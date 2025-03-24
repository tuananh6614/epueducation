
export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  profile_picture: string | null;
  bio: string | null;
  balance: number;
  created_at: string;
}

export interface Course {
  course_id: number;
  title: string;
  description: string;
  thumbnail: string;
  price: number;
  instructor_id: number;
  instructor_name?: string;
  category_id: number;
  category_name?: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  created_at: string;
  updated_at: string;
  is_published: boolean;
  enrolled_count?: number;
  lessons_count?: number;
  is_enrolled?: boolean;
  // Adding missing properties that are being used in components
  categories?: string[];
  enrolled?: number;
  duration?: string;
  instructorName?: string;
  isFeatured?: boolean;
}

export interface Lesson {
  lesson_id: number;
  course_id: number;
  title: string;
  content?: string;
  video_url?: string;
  duration?: number;
  order_index: number;
  is_free: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  category_id: number;
  name: string;
  description: string;
  created_at: string;
}

export interface Resource {
  resource_id: number;
  title: string;
  description: string;
  file_url: string;
  thumbnail: string | null;
  price: number;
  file_type: string;
  author_id: number;
  author_name?: string;
  download_count: number;
  created_at: string;
  is_purchased?: boolean;
  preview_link?: string;
  resource_type?: string; // Added missing property
}

export interface BlogPost {
  post_id: number;
  title: string;
  content: string;
  thumbnail: string | null;
  author_id: number;
  author: string;
  author_fullname?: string;
  author_avatar?: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  likes_count?: number;
  comments_count?: number;
  has_video?: boolean;
  video_url?: string | null;
  comments?: Comment[];
  reactions?: {reaction: string, count: number}[];
  excerpt?: string; // Added missing property
}

export interface Comment {
  comment_id: number;
  content: string;
  user_id: number;
  post_id: number;
  parent_id?: number | null;
  created_at: string;
  updated_at: string;
  author?: string;
  author_fullname?: string;
  author_avatar?: string;
  likes_count?: number;
}

export interface Notification {
  notification_id: number;
  user_id: number;
  from_user_id?: number;
  post_id?: number;
  comment_id?: number;
  type: string;
  message: string;
  is_read: boolean;
  created_at: string;
  from_user?: {
    username: string;
    full_name: string;
    profile_picture: string;
  };
  // Adding missing properties from the backend
  from_avatar?: string;
  from_username?: string;
  from_fullname?: string;
  action_text?: string;
  post_title?: string;
}

export interface Transaction {
  transaction_id: number;
  user_id: number;
  amount: number;
  transaction_type: 'deposit' | 'withdrawal' | 'purchase' | 'refund' | 'resource_purchase';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  related_id?: number;
  transaction_ref?: string;
  metadata?: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentHistory {
  payment_id: number;
  user_id: number;
  amount: number;
  payment_method: string;
  transaction_ref?: string;
  bank_name?: string;
  account_number?: string;
  account_name?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  admin_note?: string;
  created_at: string;
}

// Add Purchase interface that was missing
export interface Purchase {
  purchase_id: number;
  user_id: number;
  resource_id: number;
  purchase_date: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
}

// Since we've added the properties directly to the Course interface,
// we can remove or update the ExtendedCourse interface to avoid redundancy
export interface ExtendedCourse extends Course {
  // This extends the base Course with any additional properties
  // that might be needed in the future
}
