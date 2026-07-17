# 使用官方 Python 3.11 镜像作为基础
FROM python:3.11-slim

# 设置工作目录
WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# 复制后端依赖
COPY requirements.txt .

# 安装 Python 依赖
RUN pip install --no-cache-dir -r requirements.txt

# 复制后端代码
COPY . .

# 暴露端口（CloudBase 环境变量 $PORT 会传入）
EXPOSE 5000

# 启动命令
CMD gunicorn app:app --bind 0.0.0.0:$PORT --timeout 120
