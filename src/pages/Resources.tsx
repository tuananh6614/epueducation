
import React from 'react';
import Layout from '@/components/layout/Layout';
import { featuredResources } from '@/data/mockData';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, FilePenLine, FileSpreadsheet, FileCode } from 'lucide-react';
import { SectionHeading } from '@/components/ui/section-heading';
import { useAuthCheck } from '@/utils/authCheck';

const getResourceIcon = (type: string) => {
  switch (type) {
    case 'PDF':
      return <FileText className="h-5 w-5" />;
    case 'Word':
      return <FilePenLine className="h-5 w-5" />;
    case 'Excel':
      return <FileSpreadsheet className="h-5 w-5" />;
    case 'PPT':
      return <FileCode className="h-5 w-5" />;
    default:
      return <FileText className="h-5 w-5" />;
  }
};

const Resources = () => {
  const checkAuth = useAuthCheck();

  const handlePurchase = (resourceId: number, title: string) => {
    if (checkAuth('mua tài liệu này')) {
      // Logic to handle the purchase would go here
      console.log(`Purchased resource: ${resourceId}`);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <SectionHeading
          title="Tài liệu học tập"
          description="Các tài liệu chất lượng cao để hỗ trợ việc học tập của bạn"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
          {featuredResources.map((resource) => (
            <Card key={resource.resource_id} className="overflow-hidden flex flex-col h-full">
              <div className="aspect-video overflow-hidden">
                <img 
                  src={resource.thumbnail} 
                  alt={resource.title} 
                  className="w-full h-full object-cover transition-transform hover:scale-105"
                />
              </div>
              <CardContent className="p-6 flex-grow">
                <div className="flex items-center gap-2 mb-3 text-primary">
                  {getResourceIcon(resource.resource_type)}
                  <span className="font-medium">{resource.resource_type}</span>
                </div>
                <h3 className="text-xl font-medium mb-3">{resource.title}</h3>
                <p className="text-muted-foreground mb-4">{resource.description}</p>
              </CardContent>
              <CardFooter className="p-6 pt-0 flex items-center justify-between">
                <div className="font-bold text-lg">{resource.price.toLocaleString('vi-VN')}đ</div>
                <Button 
                  onClick={() => handlePurchase(resource.resource_id, resource.title || '')}
                  className="rounded-full"
                >
                  <Download className="mr-2 h-4 w-4" /> Mua ngay
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Resources;
