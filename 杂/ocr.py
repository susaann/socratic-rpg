#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import argparse
import sys
from pathlib import Path

import fitz  # PyMuPDF
import pytesseract
from PIL import Image, ImageFilter  # 修复：添加 ImageFilter


def pdf_to_images(pdf_path, dpi=200):
    """将 PDF 每一页转换为 PIL Image 对象"""
    doc = fitz.open(pdf_path)
    for page_num in range(len(doc)):
        page = doc.load_page(page_num)
        zoom = dpi / 72
        mat = fitz.Matrix(zoom, zoom)
        pix = page.get_pixmap(matrix=mat, alpha=False)
        img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
        yield page_num + 1, img
    doc.close()


def ocr_image(img, lang="chi_sim+eng", preprocess="blur"):
    """执行 OCR 识别"""
    if preprocess == "blur":
        img = img.filter(ImageFilter.GaussianBlur(radius=0.5))
    try:
        text = pytesseract.image_to_string(img, lang=lang, config="--psm 6")
    except pytesseract.TesseractNotFoundError:
        sys.exit("错误: 未找到 Tesseract 可执行文件，请确认已安装并配置 PATH。")
    return text.strip()


def main():
    parser = argparse.ArgumentParser(description="扫描版 PDF 的 OCR 文本提取器（支持中英文）")
    parser.add_argument("pdf_path", help="输入的 PDF 文件路径")
    parser.add_argument("-o", "--output", help="输出文本文件路径")
    parser.add_argument("--dpi", type=int, default=200, help="渲染 DPI，默认 200")
    parser.add_argument("--lang", default="chi_sim+eng", help="Tesseract 语言包")
    parser.add_argument("--no-preprocess", action="store_true", help="禁用图像预处理")
    args = parser.parse_args()

    pdf_file = Path(args.pdf_path)
    if not pdf_file.is_file():
        sys.exit(f"文件不存在: {pdf_file}")

    out_file = args.output if args.output else pdf_file.stem + "_ocr.txt"
    preprocess_flag = "none" if args.no_preprocess else "blur"

    print(f"开始处理 PDF: {pdf_file}")
    print(f"输出文件: {out_file}")
    print(f"语言: {args.lang} | DPI: {args.dpi} | 预处理: {preprocess_flag}")

    all_text = []
    total_pages = 0

    for page_num, img in pdf_to_images(pdf_file, dpi=args.dpi):
        total_pages += 1
        print(f"正在处理第 {page_num} 页 ...")
        text = ocr_image(img, lang=args.lang, preprocess=preprocess_flag)
        all_text.append(f"========== 第 {page_num} 页 ==========\n{text}\n")

    with open(out_file, "w", encoding="utf-8") as f:
        f.write("\n".join(all_text))

    print(f"完成！共处理 {total_pages} 页，结果已保存至: {out_file}")


if __name__ == "__main__":
    # 如果 Tesseract 未加入 PATH，请取消下面一行的注释并修改为你的安装路径
    # pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
    main()