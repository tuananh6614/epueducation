
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageSquare, Share } from 'lucide-react';
import { BlogPost, Comment } from '@/types';
import { useAuthCheck } from '@/utils/authCheck';
import { useToast } from '@/hooks/use-toast';

const BlogDetail = () => {
  const { postId } = useParams<{ postId: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const checkAuth = useAuthCheck();
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchPostDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/blog/posts/${postId}`);
        const data = await response.json();
        
        if (data.success) {
          setPost(data.data);
          setComments(data.data.comments || []);
        } else {
          setError('Không tìm thấy bài viết hoặc đã có lỗi xảy ra');
        }
      } catch (error) {
        console.error('Error fetching post details:', error);
        setError('Không thể kết nối đến máy chủ, vui lòng thử lại sau');
      } finally {
        setLoading(false);
      }
    };
    
    const checkLikeStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const response = await fetch(`http://localhost:5000/api/likes/check?post_id=${postId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const data = await response.json();
        if (data.success) {
          setLiked(data.liked);
        }
      } catch (error) {
        console.error('Error checking like status:', error);
      }
    };
    
    fetchPostDetails();
    checkLikeStatus();
  }, [postId]);
  
  const handleLike = async () => {
    if (checkAuth('thích bài viết')) {
      try {
        const token = localStorage.getItem('token');
        
        const response = await fetch('http://localhost:5000/api/likes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ post_id: Number(postId) })
        });
        
        const data = await response.json();
        
        if (data.success) {
          setLiked(data.liked);
          // Update likes count
          if (post) {
            setPost({
              ...post,
              likes_count: data.liked 
                ? (post.likes_count || 0) + 1 
                : Math.max((post.likes_count || 0) - 1, 0)
            });
          }
          
          toast({
            title: "Thành công",
            description: data.liked ? "Đã thích bài viết" : "Đã bỏ thích bài viết",
          });
        }
      } catch (error) {
        console.error('Error liking post:', error);
        toast({
          title: "Lỗi",
          description: "Không thể thích bài viết, vui lòng thử lại sau",
          variant: "destructive",
        });
      }
    }
  };
  
  const handleShare = () => {
    if (checkAuth('chia sẻ bài viết')) {
      // Share logic would go here
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Đã sao chép liên kết",
        description: "Liên kết bài viết đã được sao chép vào clipboard",
      });
    }
  };
  
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!checkAuth('bình luận')) {
      return;
    }
    
    if (!commentText.trim()) return;
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/blog/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          content: commentText,
          post_id: Number(postId)
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setComments([data.data, ...comments]);
        setCommentText('');
        
        // Update comments count in post
        if (post) {
          setPost({
            ...post,
            comments_count: (post.comments_count || 0) + 1
          });
        }
        
        toast({
          title: "Thành công",
          description: "Bình luận của bạn đã được đăng",
        });
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      toast({
        title: "Lỗi",
        description: "Không thể đăng bình luận, vui lòng thử lại sau",
        variant: "destructive",
      });
    }
  };
  
  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="text-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Đang tải bài viết...</p>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (error || !post) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-2xl font-bold">Bài viết không tồn tại</h1>
          <p className="text-muted-foreground mt-2">{error}</p>
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
                <AvatarImage src={post.author_avatar || `https://ui-avatars.com/api/?name=${post.author_fullname || post.author}&background=random`} />
                <AvatarFallback>{(post.author_fullname || post.author)?.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{post.author_fullname || post.author}</div>
                <div className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                </div>
              </div>
            </div>
          </div>
          
          {/* Featured Image */}
          {post.thumbnail && (
            <div className="aspect-video w-full rounded-lg overflow-hidden mb-8">
              <img 
                src={post.thumbnail} 
                alt={post.title} 
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          {/* Post Content */}
          <div className="prose max-w-none mb-10">
            <p className="mb-4 text-lg whitespace-pre-wrap">
              {post.content}
            </p>
          </div>
          
          {/* Social Interactions */}
          <div className="flex items-center justify-between border-t border-b py-4 mb-8">
            <div className="flex items-center gap-6">
              <button 
                onClick={handleLike}
                className="flex items-center gap-2 hover:text-primary transition-colors"
              >
                <Heart className={`h-5 w-5 ${liked ? 'fill-primary text-primary' : ''}`} />
                <span>{post.likes_count || 0} Thích</span>
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
                        <AvatarImage src={comment.author_avatar || `https://ui-avatars.com/api/?name=${comment.author_fullname || comment.author}&background=random`} />
                        <AvatarFallback>{(comment.author_fullname || comment.author)?.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <div className="font-medium">{comment.author_fullname || comment.author}</div>
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
              
              {comments.length === 0 && (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BlogDetail;
