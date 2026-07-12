-- ============================================================
-- 校园失物招领系统 - Supabase 建表脚本
-- 在 Supabase 控制台 → SQL Editor 中执行此脚本
-- ============================================================

-- 1. 创建失物招领信息表
CREATE TABLE IF NOT EXISTS lost_items (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title         TEXT NOT NULL,
    description   TEXT NOT NULL,
    location      TEXT NOT NULL,
    contact_name  TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    item_type     TEXT NOT NULL CHECK (item_type IN ('lost', 'found')),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. 创建索引，加速按时间倒序查询
CREATE INDEX IF NOT EXISTS idx_lost_items_created_at
    ON lost_items (created_at DESC);

-- 3. 启用行级安全（RLS）
ALTER TABLE lost_items ENABLE ROW LEVEL SECURITY;

-- 4. 开放策略（适用于使用 anon key / publishable key 的场景）
--    若后端使用 service_role key，可跳过 RLS 直接操作
--    以下先删除旧策略再重建，确保幂等执行

DROP POLICY IF EXISTS "允许公开读取" ON lost_items;
CREATE POLICY "允许公开读取" ON lost_items
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "允许公开新增" ON lost_items;
CREATE POLICY "允许公开新增" ON lost_items
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "允许公开删除" ON lost_items;
CREATE POLICY "允许公开删除" ON lost_items
    FOR DELETE USING (true);
