-- ============================================================
-- 图片上传功能需要的数据库修复（执行一次即可）
-- 在 Supabase SQL Editor 中执行:
-- https://supabase.com/dashboard/project/udbxzeypmksrfwicuemw/sql/new
-- ============================================================

-- 1. 给 lost_items 表添加 image_url 列（存储图片公开链接）
ALTER TABLE lost_items ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 2. 验证
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'lost_items' AND column_name = 'image_url';

-- 说明：执行完此 SQL 后，还需要在 Supabase Dashboard 中手动创建 Storage 存储桶：
-- Storage → New Bucket → 名称: item-images → 勾选 Public bucket → Create
