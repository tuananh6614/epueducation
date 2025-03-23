
-- Thêm các tài liệu mẫu mới
INSERT INTO resources (title, description, file_url, file_type, price, author_id, download_count)
VALUES 
(
    'Học React.js từ cơ bản đến nâng cao', 
    'Tài liệu đầy đủ về React.js bao gồm hooks, context API, Redux, và các kỹ thuật tối ưu hóa', 
    'react-course.pdf', 
    'PDF', 
    50000, 
    1,
    0
),
(
    'Tài liệu hướng dẫn sử dụng Node.js', 
    'Tài liệu chi tiết giúp bạn làm quen với Node.js và xây dựng ứng dụng backend', 
    'nodejs-guide.pdf', 
    'PDF', 
    35000, 
    1,
    0
),
(
    'Tài liệu TypeScript toàn tập', 
    'Hướng dẫn TypeScript từ A-Z với các ví dụ thực tế và các pattern hay dùng', 
    'typescript-complete.pdf', 
    'PDF', 
    45000, 
    1,
    0
);
