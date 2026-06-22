#!/usr/bin/env python3
"""视界探索者教团 — 本地开发服务器
支持静态文件服务 + PUT 写入（教案生成落盘）
用法：python server.py [端口号，默认 8000]
"""

import http.server
import os
import sys
import urllib.parse
import json

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000

class PUTHandler(http.server.SimpleHTTPRequestHandler):
    """支持 PUT 写入的 HTTP 文件服务器"""

    def do_PUT(self):
        """处理 PUT 请求 —— 写入文件到磁盘"""
        # 解码路径
        path = urllib.parse.unquote(self.path.lstrip('/'))

        # 安全检查：允许 教案/ + 老师/（仅 .md 文件）
        allowed = path.startswith('教案/') or path.startswith('教案\\') \
               or (path.startswith('老师/') and path.endswith('.md')) \
               or (path.startswith('老师\\') and path.endswith('.md'))
        if not allowed:
            self.send_error(403, '仅允许写入 教案/ 和 老师/*.md')
            return

        # 创建目录
        dirname = os.path.dirname(path)
        if dirname and not os.path.exists(dirname):
            os.makedirs(dirname, exist_ok=True)

        # 读取 body 并写入文件
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length)

        try:
            with open(path, 'wb') as f:
                f.write(body)
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({
                'ok': True,
                'path': path,
                'size': len(body)
            }).encode())
            print(f'  ✅ PUT {path} ({len(body)} bytes)')
        except Exception as e:
            self.send_error(500, str(e))
            print(f'  ❌ PUT {path} 失败: {e}')

    def log_message(self, format, *args):
        # 简洁日志
        method = self.command
        path = self.path
        if method == 'PUT':
            return  # 自己处理日志
        print(f'  {method} {path} {args[0]} {args[1]}' if len(args) > 1 else f'  {method} {path}')


if __name__ == '__main__':
    print(f'''
╔══════════════════════════════════════════════╗
║  视界探索者教团 — 本地开发服务器              ║
║  支持 PUT 写教案，生成即落盘                  ║
║  http://localhost:{PORT}                     ║
╚══════════════════════════════════════════════╝
''')
    with http.server.HTTPServer(('', PORT), PUTHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print('\n👋 服务器已关闭')
