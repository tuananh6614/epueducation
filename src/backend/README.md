
# Backend cho Nền tảng Học tập Trực tuyến

Thư mục này chứa mã nguồn backend cho ứng dụng Nền tảng Học tập Trực tuyến.

## Cách chạy Backend

Do chúng ta không thể trực tiếp sửa đổi tệp `package.json` để thêm các phụ thuộc backend, bạn cần thiết lập và chạy backend riêng biệt:

1. Tạo một thư mục mới cho backend bên ngoài dự án này
2. Khởi tạo một dự án Node.js mới: `npm init -y`
3. Cài đặt các phụ thuộc cần thiết:
   ```
   npm install express cors body-parser mysql2 bcryptjs jsonwebtoken
   ```
4. Sao chép tệp `server.js` từ thư mục này vào thư mục backend của bạn
5. Chạy server: `node server.js`

Backend sẽ chạy trên cổng 5000 theo mặc định.

## Thiết lập Cơ sở dữ liệu

Đảm bảo bạn có một cơ sở dữ liệu MySQL tên là `learningplatform`. Bạn có thể tạo cơ sở dữ liệu và các bảng cần thiết bằng cách chạy lệnh SQL trong tệp `database.sql`.

Cấu trúc cơ sở dữ liệu bao gồm các bảng sau:
- users
- categories
- courses
- lessons
- quizzes
- questions
- answers
- course_enrollments
- lesson_progress
- quiz_attempts
- user_answers
- reviews
- blog_posts
- comments
- resources
- transactions
- purchase_history

## Mã JWT Secret

JWT_SECRET được sử dụng để ký và xác minh JSON Web Tokens (JWT) khi người dùng đăng nhập. Đây là một khóa bí mật quan trọng cho bảo mật ứng dụng.

Trong môi trường sản xuất thực tế, JWT_SECRET nên được lưu trữ dưới dạng biến môi trường, không nên cố định trong mã nguồn.

## API Endpoints

### Xác thực
- POST `/api/register` - Đăng ký người dùng mới
- POST `/api/login` - Đăng nhập người dùng

### Khóa học
- GET `/api/courses` - Lấy tất cả khóa học
- GET `/api/courses/:id` - Lấy thông tin một khóa học cụ thể với các bài học và bài kiểm tra

### Người dùng
- GET `/api/user` - Lấy thông tin người dùng hiện tại (route được bảo vệ)

