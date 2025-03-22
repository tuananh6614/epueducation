
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Heart, MessageCircle, Share2, ThumbsUp, Send, Edit, Trash2, Clock, Calendar } from 'lucide-react';
import { featuredBlogPosts } from '@/data/mockData';
import { BlogPost, Comment } from '@/types';
import { useToast } from '@/hooks/use-toast';

const BlogDetail = () => {
  const { postId } = useParams<{ postId: string }>();
  const { toast } = useToast();
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [liked, setLiked] = useState(false);

  // Find the current post from mock data
  const post = featuredBlogPosts.find(p => p.post_id.toString() === postId) as BlogPost;

  if (!post) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Bài viết không tồn tại</h1>
          <p className="mb-6">Bài viết bạn đang tìm kiếm có thể đã bị xóa hoặc di chuyển.</p>
          <Button asChild>
            <Link to="/blog">Quay lại trang blog</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const handleCommentSubmit = () => {
    if (!comment.trim()) return;

    const newComment: Comment = {
      comment_id: Math.floor(Math.random() * 1000),
      post_id: post.post_id,
      user_id: 1, // assuming current user
      content: comment,
      created_at: new Date().toISOString(),
      author: 'Người dùng hiện tại'
    };

    setComments([...comments, newComment]);
    setComment('');
    toast({
      title: "Bình luận đã được đăng",
      description: "Bình luận của bạn đã được đăng thành công",
    });
  };

  const handleLike = () => {
    setLiked(!liked);
    toast({
      title: liked ? "Đã bỏ thích" : "Đã thích",
      description: liked ? "Bạn đã bỏ thích bài viết này" : "Bạn đã thích bài viết này",
    });
  };

  const handleShare = () => {
    // Copy URL to clipboard
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Đã sao chép liên kết",
      description: "Liên kết bài viết đã được sao chép vào clipboard",
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back button */}
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link to="/blog" className="flex items-center text-muted-foreground hover:text-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Quay lại trang Blog
            </Link>
          </Button>
        </div>

        {/* Blog post */}
        <Card className="mb-8 overflow-hidden border-none shadow-md">
          <div className="aspect-[16/9] relative overflow-hidden">
            <img 
              src={post.thumbnail} 
              alt={post.title} 
              className="w-full h-full object-cover"
            />
          </div>
          
          <CardHeader className="space-y-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(post.created_at).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  <span>{post.comments_count || comments.length} bình luận</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Avatar className="h-10 w-10">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author}`} />
                <AvatarFallback>{post.author?.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{post.author}</p>
                <p className="text-xs text-muted-foreground">Tác giả</p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="prose prose-lg max-w-none">
            <div dangerouslySetInnerHTML={{ __html: post.content || post.excerpt || '' }} />
          </CardContent>
          
          <CardFooter className="border-t p-4">
            <div className="flex justify-between items-center w-full">
              <div className="flex gap-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`gap-2 ${liked ? 'text-blue-500' : ''}`}
                  onClick={handleLike}
                >
                  <ThumbsUp className="h-4 w-4" />
                  <span>Thích</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="gap-2"
                  onClick={() => document.getElementById('comment-input')?.focus()}
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Bình luận</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="gap-2"
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4" />
                  <span>Chia sẻ</span>
                </Button>
              </div>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Edit className="h-4 w-4" />
                    <span>Chỉnh sửa</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Chỉnh sửa bài viết</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Input
                        id="title"
                        placeholder="Tiêu đề bài viết"
                        defaultValue={post.title}
                        className="text-lg"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Textarea
                        id="content"
                        placeholder="Nội dung bài viết"
                        defaultValue={post.content || post.excerpt || ''}
                        className="min-h-[300px]"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" onClick={() => toast({
                      title: "Bài viết đã được cập nhật",
                      description: "Bài viết của bạn đã được cập nhật thành công"
                    })}>
                      Lưu thay đổi
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardFooter>
        </Card>

        {/* Comments section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Bình luận ({post.comments_count || comments.length})</h2>
          
          {/* Comment input */}
          <div className="flex gap-3 mb-6">
            <Avatar className="h-10 w-10">
              <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=user" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div className="flex-1 flex gap-2">
              <Textarea
                id="comment-input"
                placeholder="Viết bình luận của bạn..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="flex-1 min-h-[80px] resize-none"
              />
              <Button 
                onClick={handleCommentSubmit}
                disabled={!comment.trim()}
                size="icon"
                className="h-10 w-10 self-end"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Comment list */}
          <div className="space-y-4">
            {comments.map((comment) => (
              <Card key={comment.comment_id} className="border shadow-sm">
                <CardHeader className="p-4 pb-2 flex-row items-start space-y-0 gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.author}`} />
                    <AvatarFallback>{comment.author?.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{comment.author}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(comment.created_at).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <p>{comment.content}</p>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex gap-2">
                  <Button variant="ghost" size="sm" className="h-8 px-2 text-sm">
                    <ThumbsUp className="h-3 w-3 mr-1" /> Thích
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 px-2 text-sm">
                    <MessageCircle className="h-3 w-3 mr-1" /> Phản hồi
                  </Button>
                </CardFooter>
              </Card>
            ))}
            
            {/* Example existing comment */}
            <Card className="border shadow-sm">
              <CardHeader className="p-4 pb-2 flex-row items-start space-y-0 gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=NguyenVanA" />
                  <AvatarFallback>NV</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">Nguyễn Văn A</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date().toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <p>Bài viết rất hay và bổ ích! Cảm ơn tác giả đã chia sẻ.</p>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex gap-2">
                <Button variant="ghost" size="sm" className="h-8 px-2 text-sm">
                  <ThumbsUp className="h-3 w-3 mr-1" /> Thích
                </Button>
                <Button variant="ghost" size="sm" className="h-8 px-2 text-sm">
                  <MessageCircle className="h-3 w-3 mr-1" /> Phản hồi
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BlogDetail;
