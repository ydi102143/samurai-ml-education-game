#!/usr/bin/env python3
"""
レポート課題用PDF生成スクリプト
MarkdownファイルをPDFに変換し、スクリーンショットを含める
"""

import markdown
import pdfkit
from pathlib import Path
import base64
import re

def image_to_base64(image_path):
    """画像をBase64エンコードしてHTMLに埋め込む"""
    try:
        with open(image_path, 'rb') as img_file:
            return base64.b64encode(img_file.read()).decode('utf-8')
    except FileNotFoundError:
        print(f"警告: 画像ファイルが見つかりません: {image_path}")
        return None

def markdown_to_pdf_with_images(md_file, output_file):
    """MarkdownファイルをPDFに変換（画像をBase64で埋め込み）"""
    
    # Markdownファイルを読み込み
    with open(md_file, 'r', encoding='utf-8') as f:
        md_content = f.read()
    
    # 画像パスをBase64に変換
    def replace_images(match):
        img_path = match.group(1)
        # 相対パスを絶対パスに変換
        if img_path.startswith('.playwright-mcp/'):
            img_path = f"../{img_path}"
        base64_img = image_to_base64(img_path)
        if base64_img:
            return f'<img src="data:image/png;base64,{base64_img}" style="max-width: 100%; height: auto;" />'
        else:
            return f'<p>画像が見つかりません: {img_path}</p>'
    
    # 画像パターンを置換
    md_content = re.sub(r'!\[.*?\]\(([^)]+)\)', replace_images, md_content)
    
    # MarkdownをHTMLに変換
    html = markdown.markdown(md_content, extensions=['tables', 'fenced_code'])
    
    # HTMLテンプレート
    html_template = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>AI技術実装レポート - samurAI</title>
        <style>
            body {{
                font-family: 'Hiragino Sans', 'Yu Gothic', 'Meiryo', sans-serif;
                line-height: 1.6;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                color: #333;
            }}
            h1, h2, h3 {{
                color: #2c3e50;
                border-bottom: 2px solid #3498db;
                padding-bottom: 10px;
            }}
            h1 {{
                font-size: 28px;
                text-align: center;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 20px;
                margin: 0 0 30px 0;
                border-radius: 10px;
            }}
            h2 {{
                font-size: 22px;
                margin-top: 30px;
            }}
            h3 {{
                font-size: 18px;
                margin-top: 25px;
            }}
            code {{
                background-color: #f4f4f4;
                padding: 2px 4px;
                border-radius: 3px;
                font-family: 'Courier New', monospace;
            }}
            pre {{
                background-color: #f8f9fa;
                padding: 15px;
                border-radius: 5px;
                overflow-x: auto;
                border-left: 4px solid #3498db;
            }}
            table {{
                border-collapse: collapse;
                width: 100%;
                margin: 20px 0;
            }}
            th, td {{
                border: 1px solid #ddd;
                padding: 12px;
                text-align: left;
            }}
            th {{
                background-color: #f2f2f2;
                font-weight: bold;
            }}
            img {{
                max-width: 100%;
                height: auto;
                border: 1px solid #ddd;
                border-radius: 5px;
                margin: 10px 0;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }}
            .highlight {{
                background-color: #fff3cd;
                padding: 15px;
                border-radius: 5px;
                border-left: 4px solid #ffc107;
                margin: 20px 0;
            }}
            ul, ol {{
                padding-left: 20px;
            }}
            li {{
                margin: 5px 0;
            }}
        </style>
    </head>
    <body>
        {html}
    </body>
    </html>
    """
    
    # PDFに変換
    options = {
        'page-size': 'A4',
        'margin-top': '0.75in',
        'margin-right': '0.75in',
        'margin-bottom': '0.75in',
        'margin-left': '0.75in',
        'encoding': "UTF-8",
        'no-outline': None,
        'enable-local-file-access': None
    }
    
    try:
        pdfkit.from_string(html_template, output_file, options=options)
        print(f"PDFが正常に生成されました: {output_file}")
    except Exception as e:
        print(f"PDF生成エラー: {e}")
        print("wkhtmltopdfがインストールされていることを確認してください")

if __name__ == "__main__":
    # ファイルパス
    md_file = "レポート課題_AI技術実装レポート.md"
    output_file = "AI技術実装レポート_samurAI.pdf"
    
    # ファイルの存在確認
    if not Path(md_file).exists():
        print(f"エラー: Markdownファイルが見つかりません: {md_file}")
        exit(1)
    
    # PDF生成
    markdown_to_pdf_with_images(md_file, output_file)
