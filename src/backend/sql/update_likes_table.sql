
-- Add reaction column to likes table
ALTER TABLE likes ADD COLUMN reaction VARCHAR(50) DEFAULT 'like';
