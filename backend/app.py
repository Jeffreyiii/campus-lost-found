"""
校园失物招领系统 - Flask 后端入口
启动方式:
    cd backend
    python app.py
或使用 Flask CLI:
    flask --app app run --debug
"""
from dotenv import load_dotenv
load_dotenv(override=True)

from factory import create_app

# 创建 Flask 应用实例
app = create_app()

if __name__ == '__main__':
    # 开发环境启动，默认端口 5000
    app.run(host='0.0.0.0', port=5000, debug=True)