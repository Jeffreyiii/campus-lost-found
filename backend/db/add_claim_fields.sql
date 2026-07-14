-- 为已存在的 lost_items 表添加 丢失时间 和 认领状态 字段
-- 请在 Supabase SQL Editor 中执行此脚本

-- 1. 添加丢失时间列
ALTER TABLE lost_items ADD COLUMN IF NOT EXISTS lost_time DATE;

-- 2. 添加认领状态列
ALTER TABLE lost_items ADD COLUMN IF NOT EXISTS claim_status TEXT NOT NULL DEFAULT 'unclaimed';

-- 3. 添加 CHECK 约束（如果还没加）
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.constraint_column_usage
        WHERE table_name = 'lost_items' AND constraint_name = 'check_claim_status'
    ) THEN
        ALTER TABLE lost_items ADD CONSTRAINT check_claim_status
            CHECK (claim_status IN ('unclaimed', 'claimed'));
    END IF;
END $$;

SELECT '✅ lost_items 表已更新：添加 lost_time 和 claim_status 字段' AS result;
