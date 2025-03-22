
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import SectionHeading from '@/components/ui/section-heading';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Download, FileText, Filter } from 'lucide-react';
import { featuredResources } from '@/data/mockData';

const Resources = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  // Get all unique resource types
  const allTypes = Array.from(
    new Set(featuredResources.map((resource) => resource.resource_type))
  );

  // Filter resources based on search and type filters
  const filteredResources = featuredResources.filter((resource) => {
    const matchesSearch = resource.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          resource.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedTypes.length === 0 || 
                        selectedTypes.includes(resource.resource_type);
    
    return matchesSearch && matchesType;
  });

  const toggleType = (type: string) => {
    setSelectedTypes((prev) => 
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    );
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'PDF':
        return <FileText className="h-5 w-5 text-red-500" />;
      case 'Word':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'Excel':
        return <FileText className="h-5 w-5 text-green-500" />;
      case 'PPT':
        return <FileText className="h-5 w-5 text-orange-500" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price * 23000);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <SectionHeading 
          title="Tài nguyên học tập" 
          subtitle="Tải xuống tài liệu, mẫu và các công cụ hữu ích cho việc học tập của bạn" 
          className="mb-12"
        />

        {/* Search and Filter Section */}
        <div className="mb-10">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Tìm kiếm tài nguyên..."
                className="pl-10 rounded-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <span className="flex items-center text-sm font-medium mr-2">
              <Filter className="h-4 w-4 mr-1" /> Lọc theo:
            </span>
            {allTypes.map((type) => (
              <Badge
                key={type}
                variant={selectedTypes.includes(type) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleType(type)}
              >
                {type}
              </Badge>
            ))}
          </div>
        </div>

        {/* Resources Grid */}
        {filteredResources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredResources.map((resource) => (
              <Card key={resource.resource_id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="aspect-video relative bg-muted/70 flex items-center justify-center">
                  {resource.thumbnail ? (
                    <img 
                      src={resource.thumbnail} 
                      alt={resource.title} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="p-8 flex flex-col items-center justify-center">
                      {getIconForType(resource.resource_type)}
                      <span className="mt-2 text-lg font-medium">{resource.resource_type} Tài liệu</span>
                    </div>
                  )}
                </div>
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge>{resource.resource_type}</Badge>
                    <span className="font-semibold text-primary">{formatPrice(resource.price)}</span>
                  </div>
                  <CardTitle className="line-clamp-2">
                    {resource.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-3">
                    {resource.description}
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button className="w-full gap-2">
                    <Download className="h-4 w-4" />
                    Tải xuống
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <h3 className="text-xl font-medium mb-2">Không tìm thấy tài nguyên</h3>
            <p className="text-muted-foreground mb-6">
              Vui lòng thử tìm kiếm với từ khóa khác hoặc điều chỉnh bộ lọc
            </p>
            <Button onClick={() => { setSearchTerm(''); setSelectedTypes([]); }}>
              Xóa bộ lọc
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Resources;
