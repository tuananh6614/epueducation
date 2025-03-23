
-- Add content column to lessons table if it doesn't already exist
ALTER TABLE lessons 
ADD COLUMN IF NOT EXISTS content TEXT AFTER title;

-- Update lesson table structure to ensure consistency
ALTER TABLE lessons 
MODIFY COLUMN video_url VARCHAR(255) AFTER content,
MODIFY COLUMN duration INT AFTER video_url;

-- Let users know the update was successful
SELECT 'Content column has been added to lessons table successfully.' AS message;
