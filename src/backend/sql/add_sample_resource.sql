
-- Add a sample resource with price 20000
INSERT INTO resources (title, description, file_url, file_type, price, author_id, download_count)
VALUES (
    'Tài liệu học lập trình JavaScript cơ bản', 
    'Tài liệu tổng hợp các kiến thức cơ bản về JavaScript dành cho người mới bắt đầu', 
    'resource-sample.pdf', 
    'PDF', 
    20000, 
    1,  -- Assuming user_id 1 exists (admin user)
    0
);
