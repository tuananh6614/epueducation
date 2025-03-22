
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { featuredBlogPosts } from '@/data/mockData';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageSquare, Share } from 'lucide-react';
import { Comment } from '@/types';
import { useAuthCheck } from '@/utils/authCheck';

const BlogDetail = () => {
  const { postId } = useParams<{ postId: string }>();
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [likes, setLikes] = useState<number>(0);
  const checkAuth = useAuthCheck();
  
  // Find the post by ID
  const post = featuredBlogPosts.find((p) => p.post_id === Number(postId));
  
  const handleLike = () => {
    if (checkAuth('thích bài viết')) {
      setLikes(likes + 1);
    }
  };
  
  const handleShare = () => {
    if (checkAuth('chia sẻ bài viết')) {
      // Share logic would go here
      console.log('Shared post');
    }
  };
  
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!checkAuth('bình luận')) {
      return;
    }
    
    if (!commentText.trim()) return;
    
    // Get the current user from localStorage
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;
    
    if (!user) {
      return;
    }
    
    const newComment: Comment = {
      comment_id: comments.length + 1,
      post_id: Number(postId),
      user_id: user.id,
      content: commentText,
      created_at: new Date().toISOString(),
      updated_at: null,
      author: user.username,
    };
    
    setComments([newComment, ...comments]);
    setCommentText('');
  };
  
  if (!post) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-2xl font-bold">Bài viết không tồn tại</h1>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Post Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>
            <div className="flex items-center gap-4 mb-6">
              <Avatar>
                <AvatarImage src={`https://ui-avatars.com/api/?name=${post.author}&background=random`} />
                <AvatarFallback>{post.author?.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{post.author}</div>
                <div className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                </div>
              </div>
            </div>
          </div>
          
          {/* Featured Image */}
          <div className="aspect-video w-full rounded-lg overflow-hidden mb-8">
            <img 
              src={post.thumbnail} 
              alt={post.title} 
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Post Content */}
          <div className="prose max-w-none mb-10">
            <p className="mb-4 text-lg">
              {post.excerpt}
            </p>
            <p className="mb-4">
              Trong thế giới công nghệ ngày nay, việc học trực tuyến đã trở thành một phần không thể thiếu trong hành trình giáo dục của nhiều người. Từ sinh viên đại học đến chuyên gia muốn nâng cao kỹ năng, các nền tảng học trực tuyến cung cấp cơ hội tiếp cận với kiến thức mà không bị giới hạn bởi không gian hay thời gian.
            </p>
            <p className="mb-4">
              Lợi ích của học trực tuyến không chỉ dừng lại ở tính linh hoạt. Nó còn mang đến khả năng tiếp cận với các giảng viên hàng đầu từ khắp nơi trên thế giới, tài nguyên học tập phong phú, và cộng đồng học viên đa dạng. Điều này tạo ra một môi trường học tập phong phú và toàn diện, nơi kiến thức không chỉ đến từ giáo trình mà còn từ sự tương tác và chia sẻ giữa những người tham gia.
            </p>
            <h2 className="text-2xl font-bold mt-8 mb-4">Các xu hướng mới trong học trực tuyến</h2>
            <p className="mb-4">
              Công nghệ tiếp tục phát triển, và cùng với nó, các phương pháp học trực tuyến cũng không ngừng đổi mới. Từ việc áp dụng trí tuệ nhân tạo để cá nhân hóa trải nghiệm học tập đến việc tích hợp thực tế ảo để tạo ra các môi trường học tập immersive, ranh giới giữa lớp học truyền thống và kỹ thuật số đang dần mờ đi.
            </p>
            <p className="mb-4">
              Một xu hướng đáng chú ý khác là sự phát triển của các khóa học vi mô (microlearning), nơi nội dung học tập được chia thành các phần nhỏ, dễ tiêu hóa, giúp người học dễ dàng tích hợp việc học vào lịch trình bận rộn của họ. Điều này đặc biệt hữu ích cho những người làm việc toàn thời gian nhưng vẫn muốn nâng cao kỹ năng.
            </p>
            <h2 className="text-2xl font-bold mt-8 mb-4">Kết luận</h2>
            <p className="mb-4">
              Học trực tuyến không phải là xu hướng tạm thời mà là một chuyển đổi cơ bản trong cách chúng ta tiếp cận giáo dục. Với công nghệ tiếp tục phát triển và trở nên ngày càng tích hợp vào cuộc sống hàng ngày của chúng ta, học trực tuyến sẽ chỉ trở nên phổ biến và tinh vi hơn.
            </p>
            <p>
              Dù bạn đang tìm kiếm bằng cấp, phát triển kỹ năng chuyên môn, hay chỉ đơn giản là tìm hiểu về một chủ đề mới vì sự tò mò, học trực tuyến cung cấp một cánh cửa đến với kiến thức mà trước đây có thể không dễ dàng tiếp cận được. Đó là một công cụ mạnh mẽ cho sự phát triển cá nhân và chuyên môn trong thế kỷ 21.
            </p>
          </div>
          
          {/* Social Interactions */}
          <div className="flex items-center justify-between border-t border-b py-4 mb-8">
            <div className="flex items-center gap-6">
              <button 
                onClick={handleLike}
                className="flex items-center gap-2 hover:text-primary transition-colors"
              >
                <Heart className={`h-5 w-5 ${likes > 0 ? 'fill-primary text-primary' : ''}`} />
                <span>{likes} Thích</span>
              </button>
              <button className="flex items-center gap-2 hover:text-primary transition-colors">
                <MessageSquare className="h-5 w-5" />
                <span>{comments.length} Bình luận</span>
              </button>
            </div>
            <button 
              onClick={handleShare}
              className="flex items-center gap-2 hover:text-primary transition-colors"
            >
              <Share className="h-5 w-5" />
              <span>Chia sẻ</span>
            </button>
          </div>
          
          {/* Comments Section */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Bình luận</h2>
            
            {/* Comment Form */}
            <form onSubmit={handleCommentSubmit} className="mb-8">
              <Textarea 
                placeholder="Viết bình luận của bạn..." 
                className="mb-3 min-h-24"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <Button type="submit">Đăng bình luận</Button>
            </form>
            
            {/* Comments List */}
            <div className="space-y-6">
              {comments.map((comment) => (
                <Card key={comment.comment_id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Avatar>
                        <AvatarImage src={`https://ui-avatars.com/api/?name=${comment.author}&background=random`} />
                        <AvatarFallback>{comment.author?.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <div className="font-medium">{comment.author}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                          </div>
                        </div>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {/* Mock initial comment */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Avatar>
                      <AvatarImage src={`https://ui-avatars.com/api/?name=Jane%20Doe&background=random`} />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-medium">Jane Doe</div>
                        <div className="text-xs text-muted-foreground">2 ngày trước</div>
                      </div>
                      <p className="text-sm">
                        Bài viết rất hay và đầy đủ thông tin. Tôi đặc biệt thích phần về xu hướng mới trong học trực tuyến, đã cho tôi nhiều góc nhìn mới về lĩnh vực này.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BlogDetail;
