
const { createConnection } = require('./db');

const addSampleCourse = async () => {
  try {
    const connection = await createConnection();
    
    // Check if instructor exists (admin user)
    const [instructors] = await connection.execute(
      'SELECT user_id FROM users WHERE username = ?',
      ['admin']
    );
    
    const instructorId = instructors.length > 0 ? instructors[0].user_id : 1;
    
    // Check if category exists
    const [categories] = await connection.execute(
      'SELECT category_id FROM categories WHERE name = ?',
      ['Lập trình']
    );
    
    const categoryId = categories.length > 0 ? categories[0].category_id : 1;
    
    // Insert sample course
    await connection.execute(
      `INSERT INTO courses 
       (title, description, thumbnail, price, instructor_id, category_id, level, is_published) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'JavaScript Cơ Bản đến Nâng Cao',
        'Khóa học JavaScript toàn diện, từ nền tảng cơ bản đến các kỹ thuật nâng cao. Bạn sẽ học cú pháp JavaScript, các khái niệm lập trình hướng đối tượng, bất đồng bộ, ES6+ và các framework phổ biến.',
        'https://images.unsplash.com/photo-1587620962725-abab7fe55159?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
        499000,
        instructorId,
        categoryId,
        'intermediate',
        true
      ]
    );
    
    // Get the inserted course ID
    const [courses] = await connection.execute(
      'SELECT course_id FROM courses WHERE title = ? ORDER BY created_at DESC LIMIT 1',
      ['JavaScript Cơ Bản đến Nâng Cao']
    );
    
    const courseId = courses[0].course_id;
    
    // Add sample lessons
    const lessons = [
      {
        title: 'Giới thiệu về JavaScript',
        content: 'Bài học này giới thiệu về lịch sử và vai trò của JavaScript trong phát triển web.',
        video_url: 'https://example.com/videos/intro-js',
        duration: 30,
        order_index: 1,
        is_free: true
      },
      {
        title: 'Biến và kiểu dữ liệu',
        content: 'Tìm hiểu về cách khai báo biến và các kiểu dữ liệu cơ bản trong JavaScript.',
        video_url: 'https://example.com/videos/variables',
        duration: 45,
        order_index: 2,
        is_free: false
      },
      {
        title: 'Cấu trúc điều kiện và vòng lặp',
        content: 'Học cách sử dụng if-else, switch-case và các loại vòng lặp trong JavaScript.',
        video_url: 'https://example.com/videos/conditionals',
        duration: 55,
        order_index: 3,
        is_free: false
      },
      {
        title: 'Hàm trong JavaScript',
        content: 'Tìm hiểu cách khai báo và sử dụng hàm, arrow function và các concept liên quan.',
        video_url: 'https://example.com/videos/functions',
        duration: 60,
        order_index: 4,
        is_free: false
      },
      {
        title: 'DOM Manipulation',
        content: 'Học cách tương tác với DOM để thay đổi nội dung và giao diện trang web.',
        video_url: 'https://example.com/videos/dom',
        duration: 70,
        order_index: 5,
        is_free: false
      }
    ];
    
    // Insert lessons
    for (const lesson of lessons) {
      await connection.execute(
        `INSERT INTO lessons 
         (course_id, title, content, video_url, duration, order_index, is_free) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          courseId,
          lesson.title,
          lesson.content,
          lesson.video_url,
          lesson.duration,
          lesson.order_index,
          lesson.is_free
        ]
      );
    }
    
    console.log('Sample course and lessons added successfully!');
    
    await connection.end();
    return { success: true, courseId };
  } catch (error) {
    console.error('Error adding sample course:', error);
    return { success: false, error: error.message };
  }
};

// Execute the function if this file is run directly
if (require.main === module) {
  addSampleCourse().then(result => {
    if (result.success) {
      console.log(`Course created with ID: ${result.courseId}`);
    } else {
      console.error(`Failed to create course: ${result.error}`);
    }
    process.exit();
  });
}

module.exports = { addSampleCourse };
