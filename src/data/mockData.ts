import { Course, Lesson, BlogPost, Resource } from '../types';

export const featuredCourses: Course[] = [
  {
    course_id: 1,
    title: "Advanced Web Development",
    description: "Master modern web development with this comprehensive course covering React, Node.js, and database design.",
    created_at: "2023-05-15T10:30:00",
    updated_at: null,
    thumbnail: "https://images.unsplash.com/photo-1517292987719-0369a794ec0f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80",
    instructorName: "Sarah Johnson",
    enrolled: 1254,
    price: 0,
    isFeatured: true,
    categories: ["Web Development", "JavaScript", "React"],
    duration: "42 hours"
  },
  {
    course_id: 2,
    title: "Data Science Fundamentals",
    description: "Learn the core concepts of data science, including statistical analysis, machine learning, and data visualization.",
    created_at: "2023-06-22T14:15:00",
    updated_at: "2023-08-10T09:45:00",
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80",
    instructorName: "David Chen",
    enrolled: 982,
    price: 0,
    isFeatured: true,
    categories: ["Data Science", "Python", "Machine Learning"],
    duration: "38 hours"
  },
  {
    course_id: 3,
    title: "UX/UI Design Principles",
    description: "Discover the essential principles of user experience and interface design for creating intuitive, beautiful digital products.",
    created_at: "2023-07-05T11:00:00",
    updated_at: null,
    thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80",
    instructorName: "Maya Rodriguez",
    enrolled: 754,
    price: 0,
    isFeatured: true,
    categories: ["Design", "UX/UI", "Figma"],
    duration: "28 hours"
  }
];

export const allCourses: Course[] = [
  ...featuredCourses,
  {
    course_id: 4,
    title: "Mobile App Development with Flutter",
    description: "Build beautiful, native mobile apps for iOS and Android using Flutter and Dart programming language.",
    created_at: "2023-08-10T13:20:00",
    updated_at: null,
    thumbnail: "https://images.unsplash.com/photo-1575126473661-f5ff21669ccd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80",
    instructorName: "James Wilson",
    enrolled: 632,
    price: 0,
    categories: ["Mobile Development", "Flutter", "Dart"],
    duration: "34 hours"
  },
  {
    course_id: 5,
    title: "Cybersecurity Essentials",
    description: "Understand the fundamentals of cybersecurity and learn to protect systems and networks from digital threats.",
    created_at: "2023-09-01T09:30:00",
    updated_at: null,
    thumbnail: "https://images.unsplash.com/photo-1510511459019-5dda7724fd87?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80",
    instructorName: "Alex Morgan",
    enrolled: 845,
    price: 0,
    categories: ["Cybersecurity", "Network Security", "Ethical Hacking"],
    duration: "40 hours"
  },
  {
    course_id: 6,
    title: "Artificial Intelligence for Business",
    description: "Learn how to apply AI technologies to solve business problems and create competitive advantages.",
    created_at: "2023-10-12T15:45:00",
    updated_at: null,
    thumbnail: "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=906&q=80",
    instructorName: "Emma Thompson",
    enrolled: 573,
    price: 0,
    categories: ["Artificial Intelligence", "Business", "Machine Learning"],
    duration: "36 hours"
  }
];

export const featuredLessons: Lesson[] = [
  {
    lesson_id: 1,
    course_id: 1,
    title: "Introduction to React Components",
    content: "In this lesson, we'll explore the fundamentals of React components and how they form the building blocks of modern web applications.",
    video_link: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    order_index: 1,
    duration: "28 minutes"
  },
  {
    lesson_id: 2,
    course_id: 1,
    title: "State Management with Redux",
    content: "Learn how to manage application state efficiently using Redux, a predictable state container for JavaScript apps.",
    video_link: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    order_index: 2,
    duration: "34 minutes"
  }
];

export const featuredBlogPosts: BlogPost[] = [
  {
    post_id: 1,
    user_id: 1,
    title: "The Future of Online Education",
    content: "Exploring how technology is transforming educational experiences and what that means for learners worldwide.",
    created_at: "2023-11-05T14:30:00",
    author: "Dr. Michael Stevens",
    excerpt: "Educational technology continues to evolve at a rapid pace, offering new possibilities for personalized learning and global access to quality education...",
    thumbnail: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80",
    comments_count: 24
  },
  {
    post_id: 2,
    user_id: 2,
    title: "Effective Learning Strategies for Technical Skills",
    content: "Discover proven methods to accelerate your learning when acquiring complex technical skills.",
    created_at: "2023-11-12T10:15:00",
    author: "Jennifer Lee",
    excerpt: "Mastering technical skills requires more than just practice. This article explores evidence-based approaches to learning that can significantly improve retention and application...",
    thumbnail: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80",
    comments_count: 18
  }
];

export const featuredResources: Resource[] = [
  {
    resource_id: 1,
    resource_type: "PDF",
    resource_link: "/files/web_dev_handbook.pdf",
    description: "A comprehensive handbook for modern web development practices and principles.",
    price: 19.99,
    uploaded_at: "2023-10-10T12:00:00",
    title: "Web Development Handbook",
    thumbnail: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80"
  },
  {
    resource_id: 2,
    resource_type: "PDF",
    resource_link: "/files/data_science_toolkit.pdf",
    description: "Essential tools and techniques for data scientists at all levels.",
    price: 24.99,
    uploaded_at: "2023-10-15T09:30:00",
    title: "Data Science Toolkit",
    thumbnail: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80"
  }
];
