
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { featuredBlogPosts } from '@/data/mockData';
import { formatDistanceToNow } from 'date-fns';
import { BlogPost } from '@/types';
import SectionHeading from '@/components/ui/section-heading';
import { useToast } from '@/hooks/use-toast';
import { useAuthCheck } from '@/utils/authCheck';
import { ThumbsUp, MessageCircle, Share, Image, SmilePlus } from 'lucide-react';

// Separate component for the post card
const BlogPostCard = ({ post }: { post: BlogPost }) => {
  const [liked, setLiked] = useState(false);
  const [commentOpen, setCommentOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<{id: number, text: string, author: string, created_at: string}[]>([]);
  const { toast } = useToast();
  const checkAuth = useAuthCheck();

  const handleLike = () => {
    if (!checkAuth('thích bài viết')) return;
    setLiked(!liked);
  };

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkAuth('bình luận')) return;
    if (!comment.trim()) return;
    
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;
    
    if (!user) return;
    
    setComments([
      ...comments, 
      {
        id: comments.length + 1,
        text: comment,
        author: user.username,
        created_at: new Date().toISOString()
      }
    ]);
    setComment('');
    
    toast({
      title: "Thành công",
      description: "Bình luận của bạn đã được đăng",
    });
  };

  return (
    <Card className="mb-6 overflow-hidden">
      {/* Post Header */}
      <CardContent className="p-4 pb-2 border-b">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={`https://ui-avatars.com/api/?name=${post.author}&background=random`} />
            <AvatarFallback>{post.author?.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="flex-grow">
            <div className="font-medium">{post.author}</div>
            <div className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </div>
          </div>
        </div>
      </CardContent>
      
      {/* Post Content */}
      <CardContent className="p-4 pt-3">
        <h3 className="text-lg font-medium mb-2">{post.title}</h3>
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
        
        {/* Post Stats */}
        <div className="flex justify-between text-sm text-muted-foreground border-t border-b py-2 mb-2">
          <div>
            {liked ? '1' : '0'} lượt thích
          </div>
          <div>
            {comments.length + post.comments_count} bình luận
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-between py-1">
          <Button 
            variant="ghost" 
            className={`flex-1 ${liked ? 'text-primary' : ''}`} 
            onClick={handleLike}
          >
            <ThumbsUp className="mr-2 h-5 w-5" />
            Thích
          </Button>
          <Button 
            variant="ghost" 
            className="flex-1" 
            onClick={() => setCommentOpen(!commentOpen)}
          >
            <MessageCircle className="mr-2 h-5 w-5" />
            Bình luận
          </Button>
          <Button variant="ghost" className="flex-1">
            <Share className="mr-2 h-5 w-5" />
            Chia sẻ
          </Button>
        </div>
        
        {/* Comments Section */}
        {commentOpen && (
          <div className="mt-3 pt-3 border-t">
            {comments.length > 0 && (
              <div className="mb-4 space-y-3">
                {comments.map(c => (
                  <div key={c.id} className="flex gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={`https://ui-avatars.com/api/?name=${c.author}&background=random`} />
                      <AvatarFallback>{c.author?.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-lg py-2 px-3 flex-grow">
                      <div className="font-medium text-sm">{c.author}</div>
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
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <div className="flex-grow relative">
                <Input 
                  className="rounded-full pr-10"
                  placeholder="Viết bình luận..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
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

// Separate component for the post creation form
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
  
  const handleQuickPost = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!checkAuth('đăng bài')) {
      return;
    }
    
    if (!postContent.trim()) return;
    
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;
    
    if (!user) {
      return;
    }
    
    // Create a new post
    const newPostObj: BlogPost = {
      post_id: Math.floor(Math.random() * 1000),
      user_id: user.id,
      title: postContent.substring(0, 50) + (postContent.length > 50 ? '...' : ''),
      content: postContent,
      created_at: new Date().toISOString(),
      author: user.username,
      excerpt: postContent.substring(0, 150) + '...',
      thumbnail: '',
      comments_count: 0
    };
    
    onPostCreate(newPostObj);
    setPostContent('');
    
    toast({
      title: "Thành công",
      description: "Bài viết của bạn đã được đăng",
    });
  };
  
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!checkAuth('đăng bài')) {
      return;
    }
    
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;
    
    if (!user) {
      return;
    }
    
    // Create a new post
    const newPostObj: BlogPost = {
      post_id: Math.floor(Math.random() * 1000),
      user_id: user.id,
      title: newPost.title,
      content: newPost.content,
      created_at: new Date().toISOString(),
      author: user.username,
      excerpt: newPost.content?.substring(0, 150) + '...',
      thumbnail: newPost.thumbnail || '',
      comments_count: 0
    };
    
    onPostCreate(newPostObj);
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
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
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
      
      {/* Create Post Dialog */}
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
  const [posts, setPosts] = useState<BlogPost[]>(featuredBlogPosts);
  
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
        
        {/* Quick Post Form */}
        <div className="mt-8">
          <QuickPostForm onPostCreate={handleAddPost} />
        </div>
        
        {/* Blog Posts List */}
        <div className="mt-6">
          {posts.map((post) => (
            <BlogPostCard key={post.post_id} post={post} />
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Blog;
