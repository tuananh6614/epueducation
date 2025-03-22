
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import SectionHeading from '@/components/ui/section-heading';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Calendar, MessageCircle, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { featuredBlogPosts } from '@/data/mockData';

const Blog = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter blog posts based on search term
  const filteredPosts = featuredBlogPosts.filter((post) => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    post.content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <SectionHeading 
          title="Bài viết mới nhất" 
          subtitle="Khám phá kiến thức, thông tin và xu hướng mới nhất trong lĩnh vực học tập trực tuyến" 
          className="mb-12"
        />

        {/* Search bar */}
        <div className="mb-12">
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Tìm kiếm bài viết..."
              className="pl-10 rounded-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Blog posts grid */}
        {filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <Card key={post.post_id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <Link to={`/blog/${post.post_id}`}>
                  <div className="aspect-video relative overflow-hidden">
                    <img 
                      src={post.thumbnail} 
                      alt={post.title} 
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                </Link>
                <CardHeader>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{new Date(post.created_at).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-3.5 w-3.5" />
                      <span>{post.comments_count} bình luận</span>
                    </div>
                  </div>
                  <CardTitle className="line-clamp-2 hover:text-primary transition-colors">
                    <Link to={`/blog/${post.post_id}`}>
                      {post.title}
                    </Link>
                  </CardTitle>
                  <CardDescription className="line-clamp-3">
                    {post.excerpt}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="flex justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{post.author}</span>
                  </div>
                  <Button variant="link" className="p-0 h-auto" asChild>
                    <Link to={`/blog/${post.post_id}`}>Đọc thêm</Link>
                  </Button>
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
    </Layout>
  );
};

export default Blog;
