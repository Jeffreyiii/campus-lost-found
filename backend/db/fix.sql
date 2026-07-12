-- ============================================================
-- 校园失物招领系统 - Supabase 修复脚本
-- 请在 Supabase 控制台 → SQL Editor 中执行此脚本
-- https://supabase.com/dashboard/project/udbxzeypmksrfwicuemw
-- ============================================================

-- 1. 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username      TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    nickname      TEXT DEFAULT '',
    role          TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 创建默认管理员账号 (密码: admin123, 新正确哈希)
INSERT INTO users (username, password_hash, nickname, role)
VALUES ('admin', '$2b$12$3LmA63lD35ZeJKxdkFR75.ciBA/ALSe9Utk3vw9DQk8t.B1ob.dg2', '系统管理员', 'admin')
ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash;

-- 2. 为 lost_items 补充缺失的 user_id 字段（如果不存在）
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'lost_items' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE lost_items ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 3. 创建索引（如果不存在）
CREATE INDEX IF NOT EXISTS idx_lost_items_created_at ON lost_items (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lost_items_user_id ON lost_items (user_id);

-- 4. 启用 RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE lost_items ENABLE ROW LEVEL SECURITY;

-- 5. RLS 开放策略（后端做权限控制）
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = '允许读取用户') THEN
        CREATE POLICY "允许读取用户" ON users FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = '允许新增用户') THEN
        CREATE POLICY "允许新增用户" ON users FOR INSERT WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = '允许更新用户') THEN
        CREATE POLICY "允许更新用户" ON users FOR UPDATE USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = '允许删除用户') THEN
        CREATE POLICY "允许删除用户" ON users FOR DELETE USING (true);
    END IF;
END $$;

-- 6. 插入示例失物招领数据
INSERT INTO lost_items (title, description, location, contact_name, contact_phone, item_type) VALUES
('校园卡 张同学', '计算机学院 2023 级，卡号 20230101', '图书馆二楼阅览室', '张同学', '13900001111', 'found'),
('黑色双肩包', '瑞士军刀品牌，内有笔记本和充电器', '一食堂门口长椅上', '李同学', '13900002222', 'found'),
('AirPods Pro', '白色充电盒，刻有名字缩写 LK', '教学楼 A 区 302 教室', '刘同学', '13900003333', 'lost'),
('学生证', '物理学院研究生，姓名李明', '操场东南角', '王同学', '13900004444', 'found'),
('钱包 棕色', '内有身份证和银行卡若干', '校门口保安亭', '保安处', '13900005555', 'found'),
('iPad 第9代', '深空灰色，带苹果笔，屏幕有钢化膜', '三食堂二楼', '赵同学', '13900006666', 'lost'),
('钥匙串', '3把钥匙+1个哆啦A梦挂件', '篮球场看台', '陈同学', '13900007777', 'found'),
('华为手环 7', '黑色表带，表盘有轻微划痕', '校医院候诊区', '周同学', '13900008888', 'lost');

SELECT '修复完成！' AS message;
