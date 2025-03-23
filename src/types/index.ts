
export interface User {
  user_id: number;
  username: string;
  email: string;
  full_name: string | null;
  profile_picture: string | null;
  balance: number;
  created_at: string;
  updated_at?: string | null;
}

export interface Course {
  course_id: number;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string | null;
  thumbnail?: string;
  instructorName?: string;
  enrolled?: number;
  rating?: number;
  price?: number;
  isFeatured?: boolean;
  categories?: string[];
  duration?: string;
}

export interface Lesson {
  lesson_id: number;
  course_id: number;
  title: string;
  content: string | null;
  video_link: string | null;
  order_index: number | null;
  duration?: string;
  is_free?: boolean;
  video_url?: string;
}

export interface BlogPost {
  post_id: number;
  user_id: number;
  title: string;
  content: string | null;
  created_at: string;
  author?: string;
  author_fullname?: string;
  author_avatar?: string;
  author_id?: number;
  excerpt?: string;
  thumbnail?: string;
  comments_count?: number;
  likes_count?: number;
}

export interface Comment {
  comment_id: number;
  post_id: number;
  user_id: number;
  content: string;
  created_at: string;
  updated_at: string | null;
  author?: string;
  author_fullname?: string;
  author_avatar?: string;
}

export interface Resource {
  resource_id: number;
  resource_type: 'PDF' | 'Word' | 'Excel' | 'PPT';
  resource_link: string;
  description: string | null;
  price: number;
  uploaded_at?: string;
  created_at?: string;
  title?: string;
  thumbnail?: string;
  file_url?: string;
  file_type?: string;
  download_count?: number;
  filename?: string;
  preview_link?: string;
}

export interface Purchase {
  purchase_id: number;
  user_id: number;
  resource_id: number;
  purchase_date: string;
  price_paid: number;
}

export interface Transaction {
  transaction_id: number;
  user_id: number;
  resource_id?: number;
  amount: number;
  status: string;
  created_at: string;
  transaction_type?: string;
  transaction_ref?: string;
  metadata?: string;
}

export interface ProfileFormData {
  username: string;
  email: string;
  full_name: string;
}

export interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface Notification {
  notification_id: number;
  user_id: number;
  from_user_id?: number;
  post_id?: number | null;
  comment_id?: number | null;
  type: 'like' | 'comment' | 'system';
  is_read: boolean;
  created_at: string;
  from_username?: string;
  from_fullname?: string;
  from_avatar?: string;
  post_title?: string;
  action_text?: string;
  message?: string;
}
