import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { formatDistanceToNow } from 'date-fns';
import { BlogPost } from '@/types';
import SectionHeading from '@/components/ui/section-heading';
import { useToast } from '@/hooks/use-toast';
import { useAuthCheck } from '@/utils/authCheck';
import { ThumbsUp, MessageCircle, Pencil, Image, SmilePlus } from 'lucide-react';

const emojiReactions = [
  { emoji: "❤️", name: "heart" },
  { emoji: "👍", name: "like" },
  { emoji: "😆", name: "haha" },
  { emoji: "😮", name: "wow" },
  { emoji: "😢", name: "sad" },
  { emoji: "😡", name: "angry" }
];

const BlogPostCard = ({ post }: { post: BlogPost }) => {
  const [liked, setLiked] = useState(false);
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
  const [commentOpen, setCommentOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<{id: number, text: string, author: string, author_fullname: string, author_avatar: string, created_at: string}[]>([]);
  const [isAuthor, setIsAuthor] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editedPost, setEditedPost] = useState({
    title: post.title,
    content: post.content,
    thumbnail: post.thumbnail || ''
  });
  
  const { toast } = useToast();
  const checkAuth = useAuthCheck();
  const navigate = useNavigate();

  useEffect(() => {
    const checkLikeStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const response = await fetch(`http://localhost:5000/api/likes/check?post_id=${post.post_id}`, {
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
    
    const checkAuthorStatus = () => {
      const userString = localStorage.getItem('user');
      if (userString) {
        const user = JSON.parse(userString);
        const isPostAuthor = user.id === post.author_id;
        setIsAuthor(isPostAuthor);
      }
    };
    
    checkLikeStatus();
    checkAuthorStatus();
  }, [post.post_id, post.author_id]);

  const handleReaction = async (reaction: string) => {
    if (!checkAuth('thích bài viết')) return;
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/likes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          post_id: post.post_id,
          reaction: reaction
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setLiked(data.liked);
        setSelectedReaction(data.liked ? reaction : null);
        toast({
          title: "Thành công",
          description: data.liked ? `Đã ${reaction === 'like' ? 'thích' : 'bày tỏ cảm xúc'} bài viết` : "Đã bỏ thích bài viết",
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
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkAuth('bình luận')) return;
    if (!comment.trim()) return;
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/blog/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          content: comment,
          post_id: post.post_id
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setComments([data.data, ...comments]);
        setComment('');
        
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
  
  const handleEditPost = async () => {
    if (!checkAuth('chỉnh sửa bài viết')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/blog/posts/${post.post_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: editedPost.title,
          content: editedPost.content,
          thumbnail: editedPost.thumbnail || null
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Thành công",
          description: "Bài viết đã được cập nhật",
        });
        setIsEditDialogOpen(false);
        
        window.location.reload();
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

  const getAuthorDisplayName = () => {
    return post.author_fullname || post.author;
  };

  const getAuthorAvatar = () => {
    return post.author_avatar || `https://ui-avatars.com/api/?name=${getAuthorDisplayName()}&background=random`;
  };

  return (
    <Card className="mb-6 overflow-hidden">
      <CardContent className="p-4 pb-2 border-b">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={getAuthorAvatar()} />
            <AvatarFallback>{getAuthorDisplayName().substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="flex-grow">
            <div className="font-medium">{getAuthorDisplayName()}</div>
            <div className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardContent className="p-4 pt-3">
        <Link to={`/blog/${post.post_id}`}>
          <h3 className="text-lg font-medium mb-2 hover:text-primary transition-colors">{post.title}</h3>
        </Link>
        <p className="text-muted-foreground mb-4">
          {post.content}
        </p>
        
        {post.thumbnail && (
          <div className="mb-4">
            <img 
              src={post.thumbnail} 
              alt={post.title} 
              className="w-full rounded-md"
            />
          </div>
        )}
        
        <div className="flex justify-between text-sm text-muted-foreground border-t border-b py-2 mb-2">
          <div>
            {post.likes_count || 0} lượt thích
          </div>
          <div>
            {post.comments_count || 0} bình luận
          </div>
        </div>
        
        <div className="flex justify-between py-1">
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                className={`flex-1 ${liked ? 'text-primary' : ''}`} 
              >
                {selectedReaction ? (
                  <span className="text-xl mr-2">{emojiReactions.find(r => r.name === selectedReaction)?.emoji || '❤️'}</span>
                ) : (
                  <ThumbsUp className={`mr-2 h-5 w-5 ${liked ? 'fill-primary' : ''}`} />
                )}
                Thích
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2">
              <div className="flex gap-2">
                {emojiReactions.map((reaction) => (
                  <button
                    key={reaction.name}
                    className="text-2xl hover:scale-125 transition-transform p-1"
                    onClick={() => handleReaction(reaction.name)}
                    title={reaction.name}
                  >
                    {reaction.emoji}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          <Button 
            variant="ghost" 
            className="flex-1" 
            onClick={() => setCommentOpen(!commentOpen)}
          >
            <MessageCircle className="mr-2 h-5 w-5" />
            Bình luận
          </Button>
          
          {isAuthor ? (
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" className="flex-1">
                  <Pencil className="mr-2 h-5 w-5" />
                  Chỉnh sửa
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
          ) : null}
        </div>
        
        {commentOpen && (
          <div className="mt-3 pt-3 border-t">
            {comments.length > 0 && (
              <div className="mb-4 space-y-3">
                {comments.map(c => (
                  <div key={c.id} className="flex gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={c.author_avatar} />
                      <AvatarFallback>{c.author_fullname.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-lg py-2 px-3 flex-grow">
                      <div className="font-medium text-sm">{c.author_fullname}</div>
                      <div className="text-sm">{c.text}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <form onSubmit={handleComment} className="flex gap-2">
              <UserAvatar />
              <div className="flex-grow relative">
                <Input 
                  className="rounded-full pr-10"
                  placeholder="Viết bình luận..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleComment(e);
                    }
                  }}
                />
                <button 
                  type="submit" 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary"
                  disabled={!comment.trim()}
                >
                  <SmilePlus className="h-5 w-5" />
                </button>
              </div>
            </form>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const UserAvatar = () => {
  const [userData, setUserData] = useState<{
    username: string;
    full_name?: string;
    profile_picture?: string;
  } | null>(null);

  useEffect(() => {
    const userString = localStorage.getItem('user');
    if (userString) {
      const user = JSON.parse(userString);
      setUserData(user);
    }
  }, []);

  if (!userData) {
    return (
      <Avatar className="h-8 w-8">
        <AvatarFallback>?</AvatarFallback>
      </Avatar>
    );
  }

  const displayName = userData.full_name || userData.username;
  const avatarUrl = userData.profile_picture || `https://ui-avatars.com/api/?name=${displayName}&background=random`;

  return (
    <Avatar className="h-8 w-8">
      <AvatarImage src={avatarUrl} />
      <AvatarFallback>{displayName.substring(0, 2)}</AvatarFallback>
    </Avatar>
  );
};

const QuickPostForm = ({ onPostCreate }: { onPostCreate: (post: BlogPost) => void }) => {
  const [postContent, setPostContent] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    thumbnail: ''
  });
  const { toast } = useToast();
  const checkAuth = useAuthCheck();
  const [userData, setUserData] = useState<{
    id: number;
    username: string;
    full_name?: string;
    profile_picture?: string;
  } | null>(null);

  useEffect(() => {
    const userString = localStorage.getItem('user');
    if (userString) {
      const user = JSON.parse(userString);
      setUserData(user);
    }
  }, []);
  
  const handleQuickPost = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!checkAuth('đăng bài')) {
      return;
    }
    
    if (!postContent.trim()) return;
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/blog/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          title: postContent.substring(0, 50) + (postContent.length > 50 ? '...' : ''),
          content: postContent 
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        onPostCreate(data.data);
        setPostContent('');
        
        toast({
          title: "Thành công",
          description: "Bài viết của bạn đã được đăng",
        });
      }
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Lỗi",
        description: "Không thể đăng bài viết, vui lòng thử lại sau",
        variant: "destructive",
      });
    }
  };
  
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!checkAuth('đăng bài')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/blog/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          title: newPost.title,
          content: newPost.content,
          thumbnail: newPost.thumbnail || null
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        onPostCreate(data.data);
        setIsCreateOpen(false);
        setNewPost({
          title: '',
          content: '',
          thumbnail: ''
        });
        
        toast({
          title: "Thành công",
          description: "Bài viết của bạn đã được đăng",
        });
      }
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Lỗi",
        description: "Không thể đăng bài viết, vui lòng thử lại sau",
        variant: "destructive",
      });
    }
  };
  
  const openCreateDialog = () => {
    if (checkAuth('tạo bài viết mới')) {
      setIsCreateOpen(true);
    }
  };
  
  const handleQuickPostClick = () => {
    if (!postContent.trim()) {
      checkAuth('đăng bài viết');
    }
  };

  return (
    <>
      <Card className="mb-6">
        <CardContent className="p-4">
          <form onSubmit={handleQuickPost} className="space-y-4">
            <div className="flex items-start gap-3">
              <UserAvatar />
              <Textarea 
                placeholder="Bạn đang nghĩ gì?" 
                className="flex-1 rounded-full min-h-0 py-2 resize-none"
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                onClick={handleQuickPostClick}
                rows={1}
              />
            </div>
            <div className="flex justify-between pt-3 border-t">
              <Button type="button" variant="outline" className="rounded-full flex gap-2">
                <Image className="h-5 w-5" />
                Ảnh/Video
              </Button>
              <div>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="rounded-full mr-2"
                  onClick={openCreateDialog}
                >
                  Tạo bài viết chi tiết
                </Button>
                <Button 
                  type="submit" 
                  className="rounded-full" 
                  disabled={!postContent.trim()}
                >
                  Đăng
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Tạo bài viết mới</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreatePost} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Tiêu đề</Label>
              <Input 
                id="title" 
                value={newPost.title}
                onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Nội dung</Label>
              <Textarea 
                id="content" 
                className="min-h-32"
                value={newPost.content}
                onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="thumbnail">Link ảnh (không bắt buộc)</Label>
              <Input 
                id="thumbnail" 
                placeholder="https://example.com/image.jpg"
                value={newPost.thumbnail}
                onChange={(e) => setNewPost({...newPost, thumbnail: e.target.value})}
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" className="rounded-full">Đăng bài viết</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/blog/posts');
        const data = await response.json();
        
        if (data.success) {
          setPosts(data.data);
        } else {
          toast({
            title: "Lỗi",
            description: "Không thể tải bài viết, vui lòng thử lại sau",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error fetching blog posts:', error);
        toast({
          title: "Lỗi",
          description: "Không thể kết nối đến máy chủ, vui lòng thử lại sau",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchPosts();
  }, [toast]);
  
  const handleAddPost = (newPost: BlogPost) => {
    setPosts([newPost, ...posts]);
  };
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <SectionHeading
          title="Cộng đồng"
          subtitle="Chia sẻ kiến thức và trải nghiệm học tập"
        />
        
        <div className="mt-8">
          <QuickPostForm onPostCreate={handleAddPost} />
        </div>
        
        <div className="mt-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Đang tải bài viết...</p>
            </div>
          ) : posts.length > 0 ? (
            posts.map((post) => (
              <BlogPostCard key={post.post_id} post={post} />
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-xl font-medium mb-2">Chưa có bài viết nào</p>
              <p className="text-muted-foreground">Hãy là người đầu tiên chia sẻ kiến thức với cộng đồng!</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Blog;
