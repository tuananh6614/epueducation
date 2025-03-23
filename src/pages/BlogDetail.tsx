
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageSquare, Pencil, Send } from 'lucide-react';
import { BlogPost, Comment } from '@/types';
import { useAuthCheck } from '@/utils/authCheck';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Emoji reactions
const emojiReactions = [
  { emoji: "❤️", name: "heart" },
  { emoji: "👍", name: "like" },
  { emoji: "😆", name: "haha" },
  { emoji: "😮", name: "wow" },
  { emoji: "😢", name: "sad" },
  { emoji: "😡", name: "angry" }
];

const BlogDetail = () => {
  const { postId } = useParams<{ postId: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthor, setIsAuthor] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editedPost, setEditedPost] = useState<{title: string, content: string, thumbnail: string | null}>({
    title: '',
    content: '',
    thumbnail: null
  });
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
  
  const checkAuth = useAuthCheck();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchPostDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/blog/posts/${postId}`);
        const data = await response.json();
        
        if (data.success) {
          setPost(data.data);
          setComments(data.data.comments || []);
          
          // Check if current user is the author
          const userString = localStorage.getItem('user');
          if (userString) {
            const user = JSON.parse(userString);
            const isPostAuthor = user.id === data.data.author_id;
            setIsAuthor(isPostAuthor);
          }
          
          // Set initial edit form values
          setEditedPost({
            title: data.data.title,
            content: data.data.content,
            thumbnail: data.data.thumbnail
          });
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
          setSelectedReaction(data.reaction || null);
        }
      } catch (error) {
        console.error('Error checking like status:', error);
      }
    };
    
    fetchPostDetails();
    checkLikeStatus();
  }, [postId]);
  
  const handleReaction = async (reaction: string) => {
    if (checkAuth('thích bài viết')) {
      try {
        const token = localStorage.getItem('token');
        
        const response = await fetch('http://localhost:5000/api/likes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ 
            post_id: Number(postId),
            reaction: reaction 
          })
        });
        
        const data = await response.json();
        
        if (data.success) {
          setLiked(data.liked);
          setSelectedReaction(data.liked ? reaction : null);
          
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
            description: data.liked ? `Đã ${reaction === 'like' ? 'thích' : 'bày tỏ cảm xúc'} bài viết` : "Đã bỏ thích bài viết",
          });
        }
      } catch (error) {
        console.error('Error reacting to post:', error);
        toast({
          title: "Lỗi",
          description: "Không thể thích bài viết, vui lòng thử lại sau",
          variant: "destructive",
        });
      }
    }
  };
  
  const handleEditPost = async () => {
    if (!checkAuth('chỉnh sửa bài viết')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/blog/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editedPost)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setPost({
          ...post!,
          title: editedPost.title,
          content: editedPost.content,
          thumbnail: editedPost.thumbnail
        });
        
        setIsEditDialogOpen(false);
        
        toast({
          title: "Thành công",
          description: "Bài viết đã được cập nhật",
        });
      } else {
        toast({
          title: "Lỗi",
          description: data.message || "Không thể cập nhật bài viết",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating post:', error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật bài viết, vui lòng thử lại sau",
        variant: "destructive",
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
      } else {
        toast({
          title: "Lỗi",
          description: data.message || "Không thể đăng bình luận",
          variant: "destructive",
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
  
  const getEmojiByReaction = (reaction: string | null) => {
    if (!reaction) return null;
    return emojiReactions.find(r => r.name === reaction)?.emoji || null;
  };
  
  const getReactionName = (reaction: string | null) => {
    if (!reaction) return "Thích";
    
    switch(reaction) {
      case "heart": return "Yêu thích";
      case "like": return "Thích";
      case "haha": return "Haha";
      case "wow": return "Wow";
      case "sad": return "Buồn";
      case "angry": return "Phẫn nộ";
      default: return "Thích";
    }
  };
  
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
              <Popover>
                <PopoverTrigger asChild>
                  <button 
                    className="flex items-center gap-2 hover:text-primary transition-colors"
                    onClick={() => handleReaction(selectedReaction || 'like')}
                  >
                    {selectedReaction ? (
                      <span className="text-xl">{getEmojiByReaction(selectedReaction)}</span>
                    ) : (
                      <Heart className={`h-5 w-5 ${liked ? 'fill-primary text-primary' : ''}`} />
                    )}
                    <span>{getReactionName(selectedReaction)}</span>
                    <span className="ml-1">({post.likes_count || 0})</span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="flex flex-wrap gap-2 p-2" side="top">
                  {emojiReactions.map((reaction) => (
                    <button
                      key={reaction.name}
                      className="p-1 cursor-pointer text-2xl hover:scale-125 transition-transform"
                      onClick={() => handleReaction(reaction.name)}
                    >
                      {reaction.emoji}
                    </button>
                  ))}
                </PopoverContent>
              </Popover>
              <button className="flex items-center gap-2 hover:text-primary transition-colors">
                <MessageSquare className="h-5 w-5" />
                <span>{comments.length} Bình luận</span>
              </button>
            </div>
            
            {isAuthor && (
              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2 hover:text-primary transition-colors"
                  >
                    <Pencil className="h-5 w-5" />
                    <span>Chỉnh sửa</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-xl">Chỉnh sửa bài viết</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-title">Tiêu đề</Label>
                      <Input 
                        id="edit-title" 
                        value={editedPost.title}
                        onChange={(e) => setEditedPost({...editedPost, title: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-content">Nội dung</Label>
                      <Textarea 
                        id="edit-content" 
                        className="min-h-32"
                        value={editedPost.content}
                        onChange={(e) => setEditedPost({...editedPost, content: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-thumbnail">Link ảnh (không bắt buộc)</Label>
                      <Input 
                        id="edit-thumbnail" 
                        placeholder="https://example.com/image.jpg"
                        value={editedPost.thumbnail || ''}
                        onChange={(e) => setEditedPost({...editedPost, thumbnail: e.target.value})}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>Hủy</Button>
                    <Button type="button" onClick={handleEditPost}>Cập nhật</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
          
          {/* Comments Section */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Bình luận</h2>
            
            {/* Comment Form */}
            <form onSubmit={handleCommentSubmit} className="mb-8 flex gap-3 items-start">
              <Avatar className="mt-1">
                <AvatarImage src={`https://ui-avatars.com/api/?name=User&background=random`} />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <div className="flex-grow relative">
                <Input
                  placeholder="Viết bình luận của bạn..." 
                  className="pr-10 rounded-full"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleCommentSubmit(e);
                    }
                  }}
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary"
                  disabled={!commentText.trim()}
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
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
