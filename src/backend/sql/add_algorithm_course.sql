
-- Check if "Lập trình" category exists, if not use existing one
SET @category_id = (SELECT category_id FROM categories WHERE name = 'Lập trình' LIMIT 1);

-- Insert the course with fields that match your courses table structure
INSERT INTO courses (
  title, 
  description
) VALUES (
  'Thuật Toán và Thiết Kế Chương Trình',
  'Khóa học này giúp bạn hiểu rõ về các thuật toán cơ bản và nâng cao, cách thiết kế và tối ưu hóa chương trình. Bạn sẽ học cách phân tích độ phức tạp, thiết kế thuật toán hiệu quả và áp dụng các cấu trúc dữ liệu phù hợp.'
);

-- Get the newly created course ID
SET @course_id = LAST_INSERT_ID();

-- Insert lessons for the course, matching your lessons table structure
INSERT INTO lessons (course_id, title, content, video_link, order_index) VALUES
(@course_id, 'Giới thiệu về Thuật toán', 'Trong bài học này, bạn sẽ được giới thiệu về khái niệm thuật toán, tầm quan trọng và cách đánh giá thuật toán.', 'https://www.youtube.com/embed/sample1', 1),
(@course_id, 'Độ phức tạp thuật toán', 'Học cách phân tích độ phức tạp thời gian và không gian của thuật toán với ký hiệu Big O.', 'https://www.youtube.com/embed/sample2', 2),
(@course_id, 'Thuật toán sắp xếp', 'Tìm hiểu về các thuật toán sắp xếp phổ biến như Bubble Sort, Selection Sort, Insertion Sort, Merge Sort, Quick Sort và Heap Sort.', 'https://www.youtube.com/embed/sample3', 3),
(@course_id, 'Thuật toán tìm kiếm', 'Học về các thuật toán tìm kiếm như tìm kiếm tuyến tính và tìm kiếm nhị phân, cùng với ứng dụng thực tế.', 'https://www.youtube.com/embed/sample4', 4),
(@course_id, 'Cấu trúc dữ liệu', 'Tìm hiểu các cấu trúc dữ liệu cơ bản và nâng cao như mảng, danh sách liên kết, ngăn xếp, hàng đợi, cây và đồ thị.', 'https://www.youtube.com/embed/sample5', 5),
(@course_id, 'Thiết kế thuật toán', 'Học các kỹ thuật thiết kế thuật toán như chia để trị, quy hoạch động, tham lam và quay lui.', 'https://www.youtube.com/embed/sample6', 6),
(@course_id, 'Tối ưu hóa mã nguồn', 'Tìm hiểu cách tối ưu hóa mã nguồn để cải thiện hiệu suất và giảm độ phức tạp.', 'https://www.youtube.com/embed/sample7', 7),
(@course_id, 'Dự án cuối khóa', 'Áp dụng tất cả kiến thức đã học để giải quyết một vấn đề phức tạp trong thế giới thực.', 'https://www.youtube.com/embed/sample8', 8);

-- Thêm một số bài kiểm tra
INSERT INTO quizzes (course_id, title, total_questions) VALUES
(@course_id, 'Kiểm tra giữa kỳ', 3),
(@course_id, 'Kiểm tra cuối kỳ', 3);

-- Lấy ID của các bài kiểm tra vừa thêm
SET @quiz_midterm = LAST_INSERT_ID();
SET @quiz_final = @quiz_midterm + 1;

-- Thêm câu hỏi cho bài kiểm tra giữa kỳ
INSERT INTO questions (quiz_id, question_text) VALUES
(@quiz_midterm, 'Độ phức tạp thời gian của thuật toán Quick Sort trong trường hợp tốt nhất là gì?'),
(@quiz_midterm, 'Thuật toán nào sau đây có độ phức tạp O(n²) trong trường hợp xấu nhất?'),
(@quiz_midterm, 'Viết pseudocode cho thuật toán tìm kiếm nhị phân');

-- Thêm câu hỏi cho bài kiểm tra cuối kỳ
INSERT INTO questions (quiz_id, question_text) VALUES
(@quiz_final, 'So sánh và đánh giá hiệu suất của các thuật toán sắp xếp đã học'),
(@quiz_final, 'Thuật toán nào thích hợp nhất cho việc tìm đường đi ngắn nhất trong đồ thị có trọng số?'),
(@quiz_final, 'Phân tích độ phức tạp của một thuật toán đệ quy');

-- Get the questions IDs to add answers
SET @q1_id = (SELECT question_id FROM questions WHERE quiz_id = @quiz_midterm AND question_text LIKE 'Độ phức tạp%');
SET @q2_id = (SELECT question_id FROM questions WHERE quiz_id = @quiz_midterm AND question_text LIKE 'Thuật toán nào%');
SET @q5_id = (SELECT question_id FROM questions WHERE quiz_id = @quiz_final AND question_text LIKE 'Thuật toán nào%');

-- Thêm câu trả lời cho câu hỏi trắc nghiệm
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
(@q1_id, 'O(n log n)', 1),
(@q1_id, 'O(n²)', 0),
(@q1_id, 'O(n)', 0),
(@q1_id, 'O(log n)', 0),
(@q2_id, 'Merge Sort', 0),
(@q2_id, 'Heap Sort', 0),
(@q2_id, 'Bubble Sort', 1),
(@q2_id, 'Binary Search', 0),
(@q5_id, 'Thuật toán Dijkstra', 1),
(@q5_id, 'Thuật toán DFS', 0),
(@q5_id, 'Thuật toán BFS', 0),
(@q5_id, 'Thuật toán Prim', 0);

-- Thông báo hoàn thành
SELECT 'Đã thêm khóa học Thuật Toán và Thiết Kế Chương Trình thành công' AS message;
