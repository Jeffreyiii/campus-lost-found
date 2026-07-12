"""
Flask 应用工厂
负责初始化应用、注册蓝图、配置 CORS 等
"""

from flask import Flask
from flask_cors import CORS

from config import Config
from routes.items import items_bp
from services.item_service import ItemService


def create_app() -> Flask:
    """创建并配置 Flask 应用"""
    app = Flask(__name__)

    # 加载配置（从 .env 和环境变量读取）
    app.config.from_object(Config)

    # 允许前端跨域请求（Next.js 默认运行在 localhost:3000）
    CORS(app, resources={r'/api/*': {'origins': '*'}})

    # 注册 API 路由蓝图
    app.register_blueprint(items_bp, url_prefix='/api/items')

    # 根路径 - 简易首页提示
    @app.route('/')
    def index():
        return {
            'name': '校园失物招领系统 API',
            'version': '1.0.0',
            'endpoints': {
                'health': '/api/health',
                'items': '/api/items',
                'delete_item': '/api/items/<id>',
            },
            'docs': 'GET /api/items — 查询全部招领信息 | POST /api/items — 发布物品 | DELETE /api/items/<id> — 删除记录',
        }

    # 健康检查接口，返回运行状态与存储模式
    @app.route('/api/health')
    def health_check():
        service = ItemService()
        storage = service.storage_mode
        return {
            'status': 'ok',
            'message': '校园失物招领后端运行正常',
            'storage': storage,
            'supabase_configured': Config.is_supabase_enabled(),
        }

    return app
