-- ============================================================
-- 校园失物招领系统 - Supabase 建表脚本
-- 请在 Supabase 控制台 → SQL Editor 中执行此脚本
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

-- 创建默认管理员账号 (密码: admin123)
-- 正确 bcrypt 哈希: $2b$12$3LmA63lD35ZeJKxdkFR75.ciBA/ALSe9Utk3vw9DQk8t.B1ob.dg2
INSERT INTO users (username, password_hash, nickname, role)
VALUES ('admin', '$2b$12$3LmA63lD35ZeJKxdkFR75.ciBA/ALSe9Utk3vw9DQk8t.B1ob.dg2', '系统管理员', 'admin')
ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash;

-- 2. 创建失物招领信息表（如已存在则跳过创建，只补充缺失列）
CREATE TABLE IF NOT EXISTS lost_items (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID REFERENCES users(id) ON DELETE SET NULL,
    title         TEXT NOT NULL,
    description   TEXT NOT NULL,
    location      TEXT NOT NULL,
    contact_name  TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    item_type     TEXT NOT NULL CHECK (item_type IN ('lost', 'found')),
    image_url     TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 为已存在的 lost_items 表补充缺失的 user_id 列
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'lost_items' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE lost_items ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 为已存在的 lost_items 表补充缺失的 image_url 列
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'lost_items' AND column_name = 'image_url'
    ) THEN
        ALTER TABLE lost_items ADD COLUMN image_url TEXT;
    END IF;
END $$;

-- 3. 创建索引
CREATE INDEX IF NOT EXISTS idx_lost_items_created_at ON lost_items (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lost_items_user_id ON lost_items (user_id);

-- 4. 启用 RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE lost_items ENABLE ROW LEVEL SECURITY;

-- 5. RLS 开放策略（后端做权限控制）
DROP POLICY IF EXISTS "允许读取用户" ON users;
CREATE POLICY "允许读取用户" ON users FOR SELECT USING (true);

DROP POLICY IF EXISTS "允许新增用户" ON users;
CREATE POLICY "允许新增用户" ON users FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "允许更新用户" ON users;
CREATE POLICY "允许更新用户" ON users FOR UPDATE USING (true);

DROP POLICY IF EXISTS "允许删除用户" ON users;
CREATE POLICY "允许删除用户" ON users FOR DELETE USING (true);

DROP POLICY IF EXISTS "允许公开读取" ON lost_items;
CREATE POLICY "允许公开读取" ON lost_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "允许公开新增" ON lost_items;
CREATE POLICY "允许公开新增" ON lost_items FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "允许公开删除" ON lost_items;
CREATE POLICY "允许公开删除" ON lost_items FOR DELETE USING (true);

-- 6. 插入示例数据
INSERT INTO lost_items (title, description, location, contact_name, contact_phone, item_type) VALUES
('校园卡 张同学', '计算机学院 2023 级，卡号 20230101', '图书馆二楼阅览室', '张同学', '13900001111', 'found'),
('黑色双肩包', '瑞士军刀品牌，内有笔记本和充电器', '一食堂门口长椅上', '李同学', '13900002222', 'found'),
('AirPods Pro', '白色充电盒，刻有名字缩写 LK', '教学楼 A 区 302 教室', '刘同学', '13900003333', 'lost'),
('学生证', '物理学院研究生，姓名李明', '操场东南角', '王同学', '13900004444', 'found'),
('钱包 棕色', '内有身份证和银行卡若干', '校门口保安亭', '保安处', '13900005555', 'found'),
('iPad 第9代', '深空灰色，带苹果笔，屏幕有钢化膜', '三食堂二楼', '赵同学', '13900006666', 'lost'),
('钥匙串', '3把钥匙+1个哆啦A梦挂件', '篮球场看台', '陈同学', '13900007777', 'found'),
('华为手环 7', '黑色表带，表盘有轻微划痕', '校医院候诊区', '周同学', '13900008888', 'lost')
ON CONFLICT DO NOTHING;

SELECT '✅ 数据库初始化完成！' AS result;

-- 7. 创建物品图片存储桶（需 Supabase Storage 支持）
-- 注意：如果以下 SQL 不支持创建存储桶，请手动在 Supabase 控制台 → Storage 中
-- 创建一个名为 item-images 的公开存储桶（Public bucket）
DO $$
BEGIN
    -- 尝试创建存储桶（如果 storage extension 已启用）
    -- 否则请手动创建：Supabase Dashboard → Storage → New Bucket → 名称: item-images → 勾选 Public bucket
    RAISE NOTICE '请确保已在 Supabase Storage 中创建名为 item-images 的公开存储桶';
END $$;
