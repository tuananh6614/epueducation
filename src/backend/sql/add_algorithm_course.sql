
-- Check if "Lập trình" category exists, if not create it
SET @category_id = (SELECT category_id FROM categories WHERE name = 'Lập trình' LIMIT 1);

-- If category doesn't exist, create it
INSERT INTO categories (name, description) 
SELECT 'Lập trình', 'Các khóa học về lập trình và phát triển phần mềm'
WHERE @category_id IS NULL;

-- Get the category ID (either existing or newly created)
SET @category_id = IFNULL(@category_id, LAST_INSERT_ID());

-- Insert the course (without thumbnail since this column doesn't exist in your database)
INSERT INTO courses (
  title, 
  description, 
  price, 
  instructor_id, 
  category_id, 
  level, 
  is_published
) VALUES (
  'Thuật Toán và Thiết Kế Chương Trình',
  'Khóa học này giúp bạn hiểu rõ về các thuật toán cơ bản và nâng cao, cách thiết kế và tối ưu hóa chương trình. Bạn sẽ học cách phân tích độ phức tạp, thiết kế thuật toán hiệu quả và áp dụng các cấu trúc dữ liệu phù hợp.',
  0.00,
  1, -- Assuming admin is the instructor (user_id = 1)
  @category_id,
  'intermediate',
  TRUE
);

-- Get the newly created course ID
SET @course_id = LAST_INSERT_ID();

-- Insert lessons for the course, check if your lessons table has video_url or another column name
INSERT INTO lessons (course_id, title, content, video_url, duration, order_index, is_free) VALUES
(@course_id, 'Giới thiệu về Thuật toán', 'Trong bài học này, bạn sẽ được giới thiệu về khái niệm thuật toán, tầm quan trọng và cách đánh giá thuật toán.', 'https://www.youtube.com/embed/sample1', 45, 1, TRUE),
(@course_id, 'Độ phức tạp thuật toán', 'Học cách phân tích độ phức tạp thời gian và không gian của thuật toán với ký hiệu Big O.', 'https://www.youtube.com/embed/sample2', 60, 2, FALSE),
(@course_id, 'Thuật toán sắp xếp', 'Tìm hiểu về các thuật toán sắp xếp phổ biến như Bubble Sort, Selection Sort, Insertion Sort, Merge Sort, Quick Sort và Heap Sort.', 'https://www.youtube.com/embed/sample3', 90, 3, FALSE),
(@course_id, 'Thuật toán tìm kiếm', 'Học về các thuật toán tìm kiếm như tìm kiếm tuyến tính và tìm kiếm nhị phân, cùng với ứng dụng thực tế.', 'https://www.youtube.com/embed/sample4', 50, 4, FALSE),
(@course_id, 'Cấu trúc dữ liệu', 'Tìm hiểu các cấu trúc dữ liệu cơ bản và nâng cao như mảng, danh sách liên kết, ngăn xếp, hàng đợi, cây và đồ thị.', 'https://www.youtube.com/embed/sample5', 75, 5, FALSE),
(@course_id, 'Thiết kế thuật toán', 'Học các kỹ thuật thiết kế thuật toán như chia để trị, quy hoạch động, tham lam và quay lui.', 'https://www.youtube.com/embed/sample6', 85, 6, FALSE),
(@course_id, 'Tối ưu hóa mã nguồn', 'Tìm hiểu cách tối ưu hóa mã nguồn để cải thiện hiệu suất và giảm độ phức tạp.', 'https://www.youtube.com/embed/sample7', 65, 7, FALSE),
(@course_id, 'Dự án cuối khóa', 'Áp dụng tất cả kiến thức đã học để giải quyết một vấn đề phức tạp trong thế giới thực.', 'https://www.youtube.com/embed/sample8', 120, 8, FALSE);

-- Thêm một số bài kiểm tra
INSERT INTO quizzes (course_id, title, description) VALUES
(@course_id, 'Kiểm tra giữa kỳ', 'Đánh giá kiến thức về độ phức tạp thuật toán và các thuật toán cơ bản'),
(@course_id, 'Kiểm tra cuối kỳ', 'Đánh giá tổng hợp kiến thức về thuật toán và cấu trúc dữ liệu');

-- Lấy ID của các bài kiểm tra vừa thêm
SET @quiz_midterm = LAST_INSERT_ID();
SET @quiz_final = @quiz_midterm + 1;

-- Thêm câu hỏi cho bài kiểm tra giữa kỳ
INSERT INTO questions (quiz_id, question_text, question_type) VALUES
(@quiz_midterm, 'Độ phức tạp thời gian của thuật toán Quick Sort trong trường hợp tốt nhất là gì?', 'multiple_choice'),
(@quiz_midterm, 'Thuật toán nào sau đây có độ phức tạp O(n²) trong trường hợp xấu nhất?', 'multiple_choice'),
(@quiz_midterm, 'Viết pseudocode cho thuật toán tìm kiếm nhị phân', 'essay');

-- Thêm câu hỏi cho bài kiểm tra cuối kỳ
INSERT INTO questions (quiz_id, question_text, question_type) VALUES
(@quiz_final, 'So sánh và đánh giá hiệu suất của các thuật toán sắp xếp đã học', 'essay'),
(@quiz_final, 'Thuật toán nào thích hợp nhất cho việc tìm đường đi ngắn nhất trong đồ thị có trọng số?', 'multiple_choice'),
(@quiz_final, 'Phân tích độ phức tạp của một thuật toán đệ quy', 'essay');

-- Thêm câu trả lời cho câu hỏi trắc nghiệm
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
(1, 'O(n log n)', 1),
(1, 'O(n²)', 0),
(1, 'O(n)', 0),
(1, 'O(log n)', 0),
(2, 'Merge Sort', 0),
(2, 'Heap Sort', 0),
(2, 'Bubble Sort', 1),
(2, 'Binary Search', 0),
(5, 'Thuật toán Dijkstra', 1),
(5, 'Thuật toán DFS', 0),
(5, 'Thuật toán BFS', 0),
(5, 'Thuật toán Prim', 0);

-- Thông báo hoàn thành
SELECT 'Đã thêm khóa học Thuật Toán và Thiết Kế Chương Trình thành công' AS message;
