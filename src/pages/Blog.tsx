
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import SectionHeading from '@/components/ui/section-heading';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Calendar, MessageCircle, User, Plus, ThumbsUp, Share2, Image, Smile, Link, PlusCircle } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';
import { featuredBlogPosts } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

const Blog = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const { toast } = useToast();

  // Filter blog posts based on search term
  const filteredPosts = featuredBlogPosts.filter((post) => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    post.content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreatePost = () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng nhập tiêu đề và nội dung bài viết",
        variant: "destructive"
      });
      return;
    }
    
    // Would normally create a post through an API, but we'll simulate it for now
    toast({
      title: "Bài viết đã được tạo",
      description: "Bài viết của bạn đã được đăng thành công",
    });
    
    // Reset form
    setNewPostTitle('');
    setNewPostContent('');
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <SectionHeading 
          title="Cộng đồng học tập" 
          subtitle="Chia sẻ kiến thức, đặt câu hỏi và kết nối với những người học khác" 
          className="mb-10"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          <div className="lg:col-span-2 space-y-6">
            {/* Create post card */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=currentUser" />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Input 
                        placeholder="Bạn đang nghĩ gì?" 
                        className="cursor-pointer"
                        readOnly
                      />
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                      <DialogHeader>
                        <DialogTitle>Tạo bài viết mới</DialogTitle>
                        <DialogDescription>
                          Chia sẻ kiến thức, kinh nghiệm hoặc đặt câu hỏi cho cộng đồng
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex items-center gap-3 mb-4">
                        <Avatar>
                          <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=currentUser" />
                          <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">Người dùng hiện tại</p>
                          <p className="text-xs text-muted-foreground">Đăng công khai</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <Input
                          id="post-title"
                          placeholder="Tiêu đề bài viết"
                          value={newPostTitle}
                          onChange={(e) => setNewPostTitle(e.target.value)}
                        />
                        <Textarea
                          placeholder="Nội dung bài viết..."
                          value={newPostContent}
                          onChange={(e) => setNewPostContent(e.target.value)}
                          className="min-h-[200px]"
                        />
                        <div className="flex items-center gap-2 border rounded-md p-2">
                          <span className="text-sm font-medium">Thêm vào bài viết:</span>
                          <Button variant="ghost" size="icon" className="text-blue-500">
                            <Image className="h-5 w-5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-amber-500">
                            <Smile className="h-5 w-5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-green-500">
                            <Link className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button 
                          className="w-full mt-2" 
                          onClick={handleCreatePost}
                          disabled={!newPostTitle.trim() || !newPostContent.trim()}
                        >
                          Đăng bài
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardFooter className="border-t pt-3">
                <div className="grid grid-cols-3 w-full gap-1">
                  <Button variant="ghost" className="flex items-center gap-2">
                    <Image className="h-4 w-4 text-blue-500" />
                    <span>Hình ảnh</span>
                  </Button>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <Link className="h-4 w-4 text-green-500" />
                    <span>Liên kết</span>
                  </Button>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-amber-500" />
                    <span>Câu hỏi</span>
                  </Button>
                </div>
              </CardFooter>
            </Card>

            {/* Search bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Tìm kiếm bài viết..."
                className="pl-10 rounded-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Blog posts */}
            {filteredPosts.length > 0 ? (
              <div className="space-y-6">
                {filteredPosts.map((post) => (
                  <Card key={post.post_id} className="overflow-hidden hover:shadow-md transition-shadow duration-300">
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <Avatar>
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author}`} />
                          <AvatarFallback>{post.author?.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{post.author}</p>
                          <div className="flex items-center text-xs text-muted-foreground gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(post.created_at).toLocaleDateString('vi-VN')}</span>
                          </div>
                        </div>
                      </div>
                      <CardTitle className="hover:text-primary transition-colors text-xl">
                        <RouterLink to={`/blog/${post.post_id}`}>
                          {post.title}
                        </RouterLink>
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {post.excerpt}
                      </CardDescription>
                    </CardHeader>
                    
                    <RouterLink to={`/blog/${post.post_id}`}>
                      <div className="aspect-video relative overflow-hidden">
                        <img 
                          src={post.thumbnail} 
                          alt={post.title} 
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                      </div>
                    </RouterLink>
                    
                    <CardFooter className="flex flex-col space-y-3 pt-4">
                      <div className="flex justify-between items-center w-full text-sm text-muted-foreground pb-3 border-b">
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="h-3.5 w-3.5 text-primary" />
                          <span>24 thích</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <MessageCircle className="h-3.5 w-3.5" />
                            <span>{post.comments_count} bình luận</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Share2 className="h-3.5 w-3.5" />
                            <span>5 chia sẻ</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between w-full">
                        <Button variant="ghost" className="flex-1 justify-center">
                          <ThumbsUp className="h-4 w-4 mr-2" />
                          Thích
                        </Button>
                        <Button variant="ghost" className="flex-1 justify-center" asChild>
                          <RouterLink to={`/blog/${post.post_id}`}>
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Bình luận
                          </RouterLink>
                        </Button>
                        <Button variant="ghost" className="flex-1 justify-center">
                          <Share2 className="h-4 w-4 mr-2" />
                          Chia sẻ
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <h3 className="text-xl font-medium mb-2">Không tìm thấy bài viết</h3>
                <p className="text-muted-foreground mb-6">
                  Vui lòng thử tìm kiếm với từ khóa khác
                </p>
                <Button onClick={() => setSearchTerm('')}>Xóa tìm kiếm</Button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Popular categories */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Chủ đề phổ biến</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge className="cursor-pointer bg-blue-100 text-blue-600 hover:bg-blue-200">Lập trình</Badge>
                  <Badge className="cursor-pointer bg-green-100 text-green-600 hover:bg-green-200">Thiết kế</Badge>
                  <Badge className="cursor-pointer bg-purple-100 text-purple-600 hover:bg-purple-200">Marketing</Badge>
                  <Badge className="cursor-pointer bg-amber-100 text-amber-600 hover:bg-amber-200">Kinh doanh</Badge>
                  <Badge className="cursor-pointer bg-red-100 text-red-600 hover:bg-red-200">Ngôn ngữ</Badge>
                  <Badge className="cursor-pointer bg-teal-100 text-teal-600 hover:bg-teal-200">AI & ML</Badge>
                  <Badge className="cursor-pointer bg-indigo-100 text-indigo-600 hover:bg-indigo-200">Web3</Badge>
                  <Badge className="cursor-pointer bg-pink-100 text-pink-600 hover:bg-pink-200">UX/UI</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Top contributors */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Người đóng góp hàng đầu</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['Trần Văn Nam', 'Nguyễn Thị Hương', 'Lê Minh Tuấn', 'Phạm Mai Anh', 'Đỗ Quang Huy'].map((name, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`} />
                        <AvatarFallback>{name.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{name}</p>
                        <p className="text-xs text-muted-foreground">{10 - index} bài viết trong tháng</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" className="w-full justify-center" asChild>
                  <RouterLink to="/about">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Xem tất cả người đóng góp
                  </RouterLink>
                </Button>
              </CardFooter>
            </Card>

            {/* Recent activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Hoạt động gần đây</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <MessageCircle className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm"><span className="font-medium">Nguyễn Văn A</span> đã bình luận về bài viết <span className="font-medium">"Học lập trình như thế nào hiệu quả?"</span></p>
                    <p className="text-xs text-muted-foreground">2 giờ trước</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Plus className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm"><span className="font-medium">Trần Văn B</span> đã đăng bài viết mới <span className="font-medium">"10 thủ thuật CSS nâng cao"</span></p>
                    <p className="text-xs text-muted-foreground">5 giờ trước</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-red-100 p-2 rounded-full">
                    <ThumbsUp className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm"><span className="font-medium">Lê Thị C</span> đã thích bài viết <span className="font-medium">"Hướng dẫn sử dụng Git cho người mới bắt đầu"</span></p>
                    <p className="text-xs text-muted-foreground">8 giờ trước</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Blog;
