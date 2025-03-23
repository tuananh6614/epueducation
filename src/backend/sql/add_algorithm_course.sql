
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
INSERT INTO lessons (course_id, title, content, video_url, order_index) VALUES
(@course_id, 'Giới thiệu về Thuật toán', 'Trong bài học này, bạn sẽ được giới thiệu về khái niệm thuật toán, tầm quan trọng và cách đánh giá thuật toán. Thuật toán là một tập hợp các bước hữu hạn được định nghĩa rõ ràng để thực hiện một tác vụ. Các thuật toán tốt cần đảm bảo tính chính xác, hiệu quả và khả năng mở rộng.', 'https://www.youtube.com/embed/sample1', 1),
(@course_id, 'Độ phức tạp thuật toán', 'Học cách phân tích độ phức tạp thời gian và không gian của thuật toán với ký hiệu Big O. Độ phức tạp O(1) là hằng số, O(log n) là logarit, O(n) là tuyến tính, O(n log n) thường thấy trong các thuật toán sắp xếp hiệu quả, O(n²) là bậc hai và O(2^n) là hàm mũ.', 'https://www.youtube.com/embed/sample2', 2),
(@course_id, 'Thuật toán sắp xếp', 'Tìm hiểu về các thuật toán sắp xếp phổ biến như Bubble Sort, Selection Sort, Insertion Sort, Merge Sort, Quick Sort và Heap Sort. Cùng với ưu và nhược điểm của từng thuật toán, cách đánh giá độ phức tạp và so sánh hiệu suất giữa các thuật toán.', 'https://www.youtube.com/embed/sample3', 3),
(@course_id, 'Thuật toán tìm kiếm', 'Học về các thuật toán tìm kiếm như tìm kiếm tuyến tính và tìm kiếm nhị phân, cùng với ứng dụng thực tế. Tìm kiếm tuyến tính có độ phức tạp O(n) trong khi tìm kiếm nhị phân có độ phức tạp O(log n) nhưng yêu cầu dữ liệu đã được sắp xếp.', 'https://www.youtube.com/embed/sample4', 4),
(@course_id, 'Cấu trúc dữ liệu', 'Tìm hiểu các cấu trúc dữ liệu cơ bản và nâng cao như mảng, danh sách liên kết, ngăn xếp, hàng đợi, cây và đồ thị. Mỗi cấu trúc dữ liệu có những ưu và nhược điểm riêng phù hợp với các vấn đề khác nhau.', 'https://www.youtube.com/embed/sample5', 5),
(@course_id, 'Thiết kế thuật toán', 'Học các kỹ thuật thiết kế thuật toán như chia để trị, quy hoạch động, tham lam và quay lui. Mỗi kỹ thuật có ưu điểm riêng và phù hợp với những loại bài toán khác nhau, hiểu cách áp dụng sẽ giúp bạn giải quyết vấn đề hiệu quả.', 'https://www.youtube.com/embed/sample6', 6),
(@course_id, 'Tối ưu hóa mã nguồn', 'Tìm hiểu cách tối ưu hóa mã nguồn để cải thiện hiệu suất và giảm độ phức tạp. Các kỹ thuật bao gồm giảm thiểu tính toán dư thừa, sử dụng cấu trúc dữ liệu phù hợp, caching kết quả và song song hóa.', 'https://www.youtube.com/embed/sample7', 7),
(@course_id, 'Dự án cuối khóa', 'Áp dụng tất cả kiến thức đã học để giải quyết một vấn đề phức tạp trong thế giới thực. Bạn sẽ phân tích vấn đề, thiết kế giải pháp, lựa chọn thuật toán và cấu trúc dữ liệu phù hợp, triển khai và đánh giá kết quả.', 'https://www.youtube.com/embed/sample8', 8);

-- ... keep existing code (quiz setup remains the same)
