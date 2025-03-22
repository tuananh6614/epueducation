
-- Check if "Lập trình" category exists, if not create it
SET @category_id = (SELECT category_id FROM categories WHERE name = 'Lập trình' LIMIT 1);

-- If category doesn't exist, create it
INSERT INTO categories (name, description) 
SELECT 'Lập trình', 'Các khóa học về lập trình và phát triển phần mềm'
WHERE @category_id IS NULL;

-- Get the category ID (either existing or newly created)
SET @category_id = (SELECT category_id FROM categories WHERE name = 'Lập trình' LIMIT 1);

-- Insert the course
INSERT INTO courses (
  title, 
  description, 
  thumbnail, 
  price, 
  instructor_id, 
  category_id, 
  level, 
  is_published
) VALUES (
  'Thuật Toán và Thiết Kế Chương Trình',
  'Khóa học này giúp bạn hiểu rõ về các thuật toán cơ bản và nâng cao, cách thiết kế và tối ưu hóa chương trình. Bạn sẽ học cách phân tích độ phức tạp, thiết kế thuật toán hiệu quả và áp dụng các cấu trúc dữ liệu phù hợp.',
  'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?q=80&w=2070&auto=format&fit=crop',
  0.00,
  1, -- Assuming admin is the instructor (user_id = 1)
  @category_id,
  'intermediate',
  TRUE
);

-- Get the newly created course ID
SET @course_id = LAST_INSERT_ID();

-- Insert lessons for the course
INSERT INTO lessons (course_id, title, content, video_url, duration, order_index, is_free) VALUES
(@course_id, 'Giới thiệu về Thuật toán', 'Trong bài học này, bạn sẽ được giới thiệu về khái niệm thuật toán, tầm quan trọng và cách đánh giá thuật toán.', 'https://www.youtube.com/embed/sample1', 45, 1, TRUE),
(@course_id, 'Độ phức tạp thuật toán', 'Học cách phân tích độ phức tạp thời gian và không gian của thuật toán với ký hiệu Big O.', 'https://www.youtube.com/embed/sample2', 60, 2, FALSE),
(@course_id, 'Thuật toán sắp xếp', 'Tìm hiểu về các thuật toán sắp xếp phổ biến như Bubble Sort, Selection Sort, Insertion Sort, Merge Sort, Quick Sort và Heap Sort.', 'https://www.youtube.com/embed/sample3', 90, 3, FALSE),
(@course_id, 'Thuật toán tìm kiếm', 'Học về các thuật toán tìm kiếm như tìm kiếm tuyến tính và tìm kiếm nhị phân, cùng với ứng dụng thực tế.', 'https://www.youtube.com/embed/sample4', 50, 4, FALSE),
(@course_id, 'Cấu trúc dữ liệu', 'Tìm hiểu các cấu trúc dữ liệu cơ bản và nâng cao như mảng, danh sách liên kết, ngăn xếp, hàng đợi, cây và đồ thị.', 'https://www.youtube.com/embed/sample5', 75, 5, FALSE),
(@course_id, 'Thiết kế thuật toán', 'Học các kỹ thuật thiết kế thuật toán như chia để trị, quy hoạch động, tham lam và quay lui.', 'https://www.youtube.com/embed/sample6', 85, 6, FALSE),
(@course_id, 'Tối ưu hóa mã nguồn', 'Tìm hiểu cách tối ưu hóa mã nguồn để cải thiện hiệu suất và giảm độ phức tạp.', 'https://www.youtube.com/embed/sample7', 65, 7, FALSE),
(@course_id, 'Dự án cuối khóa', 'Áp dụng tất cả kiến thức đã học để giải quyết một vấn đề phức tạp trong thế giới thực.', 'https://www.youtube.com/embed/sample8', 120, 8, FALSE);

-- Thông báo hoàn thành
SELECT 'Đã thêm khóa học Thuật Toán và Thiết Kế Chương Trình thành công' AS message;
