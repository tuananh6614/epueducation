import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageSquare, Pencil, Send, ThumbsUp, MoreHorizontal, Reply } from 'lucide-react';
import { BlogPost, Comment } from '@/types';
import { useAuthCheck } from '@/utils/authCheck';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

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
          
          const userString = localStorage.getItem('user');
          if (userString) {
            const user = JSON.parse(userString);
            const isPostAuthor = user.id === data.data.author_id;
            setIsAuthor(isPostAuthor);
          }
          
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
          
          {post.thumbnail && (
            <div className="aspect-video w-full rounded-lg overflow-hidden mb-8">
              <img 
                src={post.thumbnail} 
                alt={post.title} 
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="prose max-w-none mb-10">
            <p className="mb-4 text-lg whitespace-pre-wrap">
              {post.content}
            </p>
          </div>
          
          <div className="flex flex-col border-t border-b py-2 mb-6">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <div className="bg-primary text-white rounded-full p-1">
                  <ThumbsUp className="h-3 w-3" />
                </div>
                <span className="text-sm text-muted-foreground">{post.likes_count || 0}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                {(post.comments_count || comments.length) > 0 && (
                  <span>{post.comments_count || comments.length} bình luận</span>
                )}
              </div>
            </div>
            
            <Separator />
            <div className="flex items-center justify-between py-1">
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="flex-1 flex items-center justify-center gap-2 hover:bg-accent rounded-md py-2"
                    onClick={() => handleReaction(selectedReaction || 'like')}
                  >
                    {selectedReaction ? (
                      <span className="text-xl mr-1">{getEmojiByReaction(selectedReaction)}</span>
                    ) : (
                      <ThumbsUp className={`h-5 w-5 ${liked ? 'fill-primary text-primary' : ''}`} />
                    )}
                    <span>{getReactionName(selectedReaction)}</span>
                  </Button>
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
              
              <Button 
                variant="ghost" 
                className="flex-1 flex items-center justify-center gap-2 hover:bg-accent rounded-md py-2"
              >
                <MessageSquare className="h-5 w-5" />
                <span>Bình luận</span>
              </Button>
              
              {isAuthor && (
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="flex-1 flex items-center justify-center gap-2 hover:bg-accent rounded-md py-2"
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
          </div>
          
          <div>
            <h2 className="text-lg font-semibold mb-4">Bình luận</h2>
            
            <div className="mb-6 flex gap-3 items-start bg-muted/30 p-4 rounded-lg">
              <Avatar className="mt-1">
                <AvatarImage 
                  src={(() => {
                    const userString = localStorage.getItem('user');
                    if (userString) {
                      const user = JSON.parse(userString);
                      return user.profile_picture || `https://ui-avatars.com/api/?name=${user.username || 'User'}&background=random`;
                    }
                    return `https://ui-avatars.com/api/?name=User&background=random`;
                  })()}
                />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <form onSubmit={handleCommentSubmit} className="flex-grow relative">
                <div className="flex-grow relative rounded-full bg-background overflow-hidden">
                  <Input
                    placeholder="Viết bình luận của bạn..." 
                    className="pr-10 border-none shadow-none rounded-full"
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
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary disabled:text-muted-foreground disabled:cursor-not-allowed"
                    disabled={!commentText.trim()}
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </form>
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium">Phù hợp nhất</div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">Sắp xếp</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Mới nhất</DropdownMenuItem>
                  <DropdownMenuItem>Cũ nhất</DropdownMenuItem>
                  <DropdownMenuItem>Phù hợp nhất</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.comment_id} className="group flex gap-3">
                  <Avatar className="h-9 w-9 mt-1">
                    <AvatarImage 
                      src={comment.author_avatar || `https://ui-avatars.com/api/?name=${comment.author_fullname || comment.author}&background=random`} 
                    />
                    <AvatarFallback>{(comment.author_fullname || comment.author)?.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="bg-muted/30 rounded-2xl px-4 py-2">
                      <div className="font-semibold text-sm">{comment.author_fullname || comment.author}</div>
                      <p className="text-sm break-words">{comment.content}</p>
                    </div>
                    <div className="flex gap-4 mt-1 pl-2 text-xs">
                      <button className="text-muted-foreground hover:text-foreground font-medium">Thích</button>
                      <button className="text-muted-foreground hover:text-foreground font-medium">Phản hồi</button>
                      <span className="text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity self-start pt-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Sao chép</DropdownMenuItem>
                        {comment.user_id === (() => {
                          const userString = localStorage.getItem('user');
                          if (userString) {
                            const user = JSON.parse(userString);
                            return user.id;
                          }
                          return null;
                        })() && (
                          <>
                            <DropdownMenuItem>Chỉnh sửa</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive focus:text-destructive">
                              Xóa
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuItem>Báo cáo</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
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
