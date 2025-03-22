
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
import { SectionHeading } from '@/components/ui/section-heading';
import { useToast } from '@/hooks/use-toast';
import { useAuthCheck } from '@/utils/authCheck';

const BlogPostCard = ({ post }: { post: BlogPost }) => {
  return (
    <Card className="overflow-hidden h-full">
      <div className="aspect-video overflow-hidden">
        <img 
          src={post.thumbnail} 
          alt={post.title} 
          className="w-full h-full object-cover transition-transform hover:scale-105"
        />
      </div>
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="h-8 w-8">
            <AvatarImage src={`https://ui-avatars.com/api/?name=${post.author}&background=random`} />
            <AvatarFallback>{post.author?.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-sm">{post.author}</div>
            <div className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </div>
          </div>
        </div>
        <h3 className="text-xl font-medium mb-2">
          <Link to={`/blog/${post.post_id}`} className="hover:text-primary transition-colors">
            {post.title}
          </Link>
        </h3>
        <p className="text-muted-foreground line-clamp-3 mb-4">
          {post.excerpt}
        </p>
        <div className="flex justify-between items-center">
          <Link to={`/blog/${post.post_id}`} className="text-primary hover:underline text-sm">
            Đọc tiếp
          </Link>
          <div className="text-sm text-muted-foreground">
            {post.comments_count} bình luận
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>(featuredBlogPosts);
  const [postContent, setPostContent] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    thumbnail: ''
  });
  const { toast } = useToast();
  const checkAuth = useAuthCheck();
  
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
      post_id: posts.length + 1,
      user_id: user.id,
      title: newPost.title,
      content: newPost.content,
      created_at: new Date().toISOString(),
      author: user.username,
      excerpt: newPost.content?.substring(0, 150) + '...',
      thumbnail: newPost.thumbnail || 'https://images.unsplash.com/photo-1501504905252-473c47e087f8',
      comments_count: 0
    };
    
    setPosts([newPostObj, ...posts]);
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
      post_id: posts.length + 1,
      user_id: user.id,
      title: postContent.substring(0, 50) + (postContent.length > 50 ? '...' : ''),
      content: postContent,
      created_at: new Date().toISOString(),
      author: user.username,
      excerpt: postContent.substring(0, 150) + '...',
      thumbnail: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8',
      comments_count: 0
    };
    
    setPosts([newPostObj, ...posts]);
    setPostContent('');
    
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
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <SectionHeading
          title="Blog"
          description="Chia sẻ kiến thức và trải nghiệm học tập"
        />
        
        {/* Quick Post Section */}
        <Card className="mb-10 mt-8">
          <CardContent className="p-6">
            <form onSubmit={handleQuickPost} className="space-y-4">
              <div className="flex items-start gap-4">
                <Avatar>
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <Textarea 
                  placeholder="Chia sẻ kiến thức của bạn..." 
                  className="flex-1"
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  onClick={handleQuickPostClick}
                />
              </div>
              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={openCreateDialog}>
                  Tạo bài viết chi tiết
                </Button>
                <Button type="submit" disabled={!postContent.trim()}>
                  Đăng
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        
        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <BlogPostCard key={post.post_id} post={post} />
          ))}
        </div>
        
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
                <Button type="submit">Đăng bài viết</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Blog;
