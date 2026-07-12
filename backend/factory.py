"""
Flask 应用工厂
负责初始化应用、注册蓝图、配置 CORS 等
"""

from flask import Flask
from flask_cors import CORS

from routes.items import items_bp


def create_app() -> Flask:
    """创建并配置 Flask 应用"""
    app = Flask(__name__)

    # 加载配置（后续可扩展为从 .env 读取）
    app.config.from_object('config.Config')

    # 允许前端跨域请求（Next.js 默认运行在 localhost:3000）
    CORS(app, resources={r'/api/*': {'origins': '*'}})

    # 注册 API 路由蓝图
    app.register_blueprint(items_bp, url_prefix='/api/items')

    # 健康检查接口，用于确认后端是否正常运行
    @app.route('/api/health')
    def health_check():
        return {'status': 'ok', 'message': '校园失物招领后端运行正常'}

    return app
