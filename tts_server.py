#!/usr/bin/env python3
"""Edge TTS 服务器 — 接收文本和声音参数，返回音频流"""
import http.server
import subprocess
import tempfile
import os
import json
import urllib.parse
import sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8765

class TTSHandler(http.server.BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == '/tts':
            params = urllib.parse.parse_qs(parsed.query)
            text = params.get('text', [''])[0]
            voice = params.get('voice', ['zh-CN-XiaoxiaoNeural'])[0]
            rate = params.get('rate', ['+0%'])[0]
            pitch = params.get('pitch', ['+0Hz'])[0]

            if not text or len(text) > 500:
                self.send_error(400, 'text required, max 500 chars')
                return

            try:
                with tempfile.NamedTemporaryFile(suffix='.mp3', delete=False) as tmp:
                    tmp_path = tmp.name

                cmd = [
                    'edge-tts', '--voice', voice,
                    '--rate=' + rate,
                    '--pitch=' + pitch,
                    '--text', text,
                    '--write-media', tmp_path
                ]
                subprocess.run(cmd, capture_output=True, timeout=15)

                self.send_response(200)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Content-Type', 'audio/mpeg')
                self.send_header('Content-Length', os.path.getsize(tmp_path))
                self.send_header('Cache-Control', 'no-cache')
                self.end_headers()

                with open(tmp_path, 'rb') as f:
                    self.wfile.write(f.read())

                os.unlink(tmp_path)

            except Exception as e:
                self.send_error(500, str(e))
        else:
            self.send_error(404)

    def log_message(self, format, *args):
        print(f'  TTS {args[0]}' if len(args) > 1 else '')

if __name__ == '__main__':
    print(f'🎤 Edge TTS 服务 http://localhost:{PORT}/tts?text=你好&voice=zh-CN-XiaoxiaoNeural')
    with http.server.HTTPServer(('', PORT), TTSHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print('\n👋 TTS 服务已关闭')
