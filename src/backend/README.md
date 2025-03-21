
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

4. Cài đặt nodemon để tự động khởi động lại server khi có thay đổi code:
   ```
   npm install nodemon --save-dev
   ```

5. Sao chép tệp `server.js` và `database.sql` từ thư mục này vào thư mục backend của bạn
6. Thêm script trong `package.json` của backend:
   ```json
   "scripts": {
     "start": "node server.js",
     "dev": "nodemon server.js"
   }
   ```

7. Chạy server với nodemon: `npm run dev`

Backend sẽ chạy trên cổng 5000 theo mặc định và tự động khởi động lại khi bạn thay đổi code.

## Thiết lập Cơ sở dữ liệu

Đảm bảo bạn có một cơ sở dữ liệu MySQL tên là `learningplatform`. Bạn có thể tạo cơ sở dữ liệu và các bảng cần thiết bằng cách chạy lệnh SQL trong tệp `database.sql`.

### Cách thiết lập cơ sở dữ liệu:

1. Đăng nhập vào MySQL: `mysql -u root -p`
2. Tạo cơ sở dữ liệu: `CREATE DATABASE learningplatform;`
3. Sử dụng cơ sở dữ liệu: `USE learningplatform;`
4. Nhập dữ liệu từ file SQL: `source đường_dẫn_đến_file/database.sql;`

Hoặc sử dụng công cụ quản lý MySQL như phpMyAdmin, MySQL Workbench để nhập file SQL.

## Cấu trúc cơ sở dữ liệu

Cấu trúc cơ sở dữ liệu bao gồm các bảng sau:
- users: Thông tin người dùng
- categories: Danh mục khóa học
- courses: Thông tin khóa học
- lessons: Bài học trong khóa học
- quizzes: Bài kiểm tra
- questions: Câu hỏi trong bài kiểm tra
- answers: Câu trả lời cho câu hỏi
- course_enrollments: Đăng ký khóa học
- lesson_progress: Tiến độ học tập
- quiz_attempts: Lần thử làm bài kiểm tra
- user_answers: Câu trả lời của người dùng
- reviews: Đánh giá khóa học
- blog_posts: Bài viết blog
- comments: Bình luận
- resources: Tài liệu học tập
- transactions: Giao dịch
- purchase_history: Lịch sử mua hàng

## Mã JWT Secret

JWT_SECRET là một khóa bí mật dùng để ký (sign) và xác minh (verify) JSON Web Tokens (JWT) khi người dùng đăng nhập. JWT là một chuẩn mở (RFC 7519) định nghĩa một cách nhỏ gọn và khép kín để truyền thông tin an toàn giữa các bên dưới dạng đối tượng JSON.

Trong ứng dụng này, JWT_SECRET được sử dụng để:
1. Tạo token khi người dùng đăng nhập thành công
2. Xác minh tính hợp lệ của token khi người dùng truy cập các API được bảo vệ
3. Bảo vệ thông tin người dùng khỏi bị giả mạo

JWT_SECRET hiện tại: `TYnh&j1VK8$p2^C@4XZrQ7*sW!9mDgEb`

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

## Sử dụng API từ frontend

### Đăng ký người dùng
```javascript
const registerUser = async (userData) => {
  try {
    const response = await fetch('http://localhost:5000/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Lỗi đăng ký:', error);
    throw error;
  }
};
```

### Đăng nhập người dùng
```javascript
const loginUser = async (credentials) => {
  try {
    const response = await fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    const data = await response.json();
    
    if (data.token) {
      // Lưu token vào localStorage hoặc sessionStorage
      localStorage.setItem('token', data.token);
    }
    
    return data;
  } catch (error) {
    console.error('Lỗi đăng nhập:', error);
    throw error;
  }
};
```

### Lấy danh sách khóa học
```javascript
const getCourses = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/courses');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Lỗi lấy khóa học:', error);
    throw error;
  }
};
```

### Lấy thông tin người dùng (yêu cầu xác thực)
```javascript
const getUserProfile = async () => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Không tìm thấy token xác thực');
    }
    
    const response = await fetch('http://localhost:5000/api/user', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Lỗi lấy thông tin người dùng:', error);
    throw error;
  }
};
```

## Xử lý lỗi chung

Khi sử dụng API, bạn nên kiểm tra trường `success` trong phản hồi để xác định xem yêu cầu có thành công hay không. Nếu `success` là `false`, bạn có thể hiển thị thông báo lỗi từ trường `message`.

```javascript
try {
  const response = await loginUser({ email, password });
  
  if (response.success) {
    // Xử lý thành công
    console.log('Đăng nhập thành công!');
    // Chuyển hướng hoặc cập nhật UI
  } else {
    // Xử lý lỗi
    console.error('Lỗi:', response.message);
    // Hiển thị thông báo lỗi cho người dùng
  }
} catch (error) {
  console.error('Lỗi không xác định:', error);
  // Hiển thị thông báo lỗi chung
}
```
