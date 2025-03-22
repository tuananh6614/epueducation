
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

const addCalculusCourse = async () => {
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
      ['Toán học']
    );
    
    // If category doesn't exist, create it
    let categoryId;
    if (categories.length === 0) {
      const [result] = await connection.execute(
        'INSERT INTO categories (name, description) VALUES (?, ?)',
        ['Toán học', 'Các khóa học về toán học và ứng dụng']
      );
      categoryId = result.insertId;
    } else {
      categoryId = categories[0].category_id;
    }
    
    // Insert sample course
    await connection.execute(
      `INSERT INTO courses 
       (title, description, thumbnail, price, instructor_id, category_id, level, is_published) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'Toán Cao Cấp 3 - Giải Tích Nhiều Biến',
        'Khóa học chuyên sâu về Toán Cao Cấp 3, bao gồm giải tích nhiều biến, phương trình vi phân, tích phân bội và các ứng dụng trong khoa học dữ liệu và kỹ thuật. Phù hợp cho sinh viên ngành STEM.',
        'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
        649000,
        instructorId,
        categoryId,
        'advanced',
        true
      ]
    );
    
    // Get the inserted course ID
    const [courses] = await connection.execute(
      'SELECT course_id FROM courses WHERE title = ? ORDER BY created_at DESC LIMIT 1',
      ['Toán Cao Cấp 3 - Giải Tích Nhiều Biến']
    );
    
    const courseId = courses[0].course_id;
    
    // Add sample lessons
    const lessons = [
      {
        title: 'Giới thiệu về Giải tích nhiều biến',
        content: 'Bài học này giới thiệu về khái niệm và tầm quan trọng của giải tích nhiều biến trong khoa học và kỹ thuật.',
        video_url: 'https://example.com/videos/calc3-intro',
        duration: 45,
        order_index: 1,
        is_free: true
      },
      {
        title: 'Đạo hàm riêng và gradient',
        content: 'Tìm hiểu về đạo hàm riêng, gradient, và ứng dụng của chúng trong tối ưu hóa.',
        video_url: 'https://example.com/videos/partial-derivatives',
        duration: 60,
        order_index: 2,
        is_free: false
      },
      {
        title: 'Tích phân kép và bội',
        content: 'Học cách tính tích phân kép, tích phân bội và ứng dụng trong tính diện tích, thể tích.',
        video_url: 'https://example.com/videos/multiple-integrals',
        duration: 75,
        order_index: 3,
        is_free: false
      },
      {
        title: 'Phương trình vi phân',
        content: 'Giải quyết các phương trình vi phân cấp một và cấp hai với các phương pháp khác nhau.',
        video_url: 'https://example.com/videos/differential-equations',
        duration: 90,
        order_index: 4,
        is_free: false
      },
      {
        title: 'Chuỗi Taylor nhiều biến',
        content: 'Mở rộng khái niệm chuỗi Taylor cho hàm nhiều biến và các ứng dụng của nó.',
        video_url: 'https://example.com/videos/taylor-series',
        duration: 70,
        order_index: 5,
        is_free: false
      },
      {
        title: 'Ứng dụng trong Machine Learning',
        content: 'Khám phá cách giải tích nhiều biến được áp dụng trong các thuật toán học máy như gradient descent.',
        video_url: 'https://example.com/videos/applications-ml',
        duration: 85,
        order_index: 6,
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
    
    console.log('Calculus 3 course and lessons added successfully!');
    
    await connection.end();
    return { success: true, courseId };
  } catch (error) {
    console.error('Error adding calculus course:', error);
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

module.exports = { addSampleCourse, addCalculusCourse };
