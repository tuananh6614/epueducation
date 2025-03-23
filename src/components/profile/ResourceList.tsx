
import { useState } from "react";
import { Resource, Purchase } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FilePlus, FileText, Download, ExternalLink } from "lucide-react";
import { formatDistance } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";

interface ResourceListProps {
  resources: Resource[];
  purchases: Purchase[];
}

const ResourceList = ({ resources, purchases }: ResourceListProps) => {
  const [downloading, setDownloading] = useState<number | null>(null);

  if (!resources.length) {
    return (
      <div className="text-center py-8">
        <FilePlus className="h-12 w-12 mx-auto text-gray-400" />
        <h3 className="mt-4 text-lg font-medium">Bạn chưa mua tài liệu nào</h3>
        <p className="mt-2 text-gray-500">Khám phá các tài liệu học tập chất lượng cao.</p>
        <Button className="mt-4" onClick={() => window.location.href = '/resources'}>
          Xem tài liệu
        </Button>
      </div>
    );
  }

  const handleDownload = async (resource: Resource) => {
    try {
      setDownloading(resource.resource_id);
      
      // Show loading toast
      toast.loading(`Đang tải xuống ${resource.title}...`);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Bạn chưa đăng nhập');
      }

      // Sửa đường dẫn API cho phù hợp với endpoint trên server
      const response = await fetch(`http://localhost:5000/api/resources/${resource.resource_id}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Không thể tải tài liệu');
      }

      // Dismiss loading toast
      toast.dismiss();

      // Create a link and trigger download
      const data = await response.blob();
      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      // Use filename if available, otherwise use title + default extension
      a.download = resource.file_url || `${resource.title || 'resource'}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('Tải xuống thành công', {
        description: `${resource.title} đã được tải xuống`
      });
    } catch (error: any) {
      console.error('Lỗi khi tải tài liệu:', error);
      toast.error('Tải xuống thất bại', {
        description: error.message || 'Đã có lỗi xảy ra, vui lòng thử lại sau'
      });
    } finally {
      setDownloading(null);
    }
  };

  const getPurchaseDate = (resourceId: number) => {
    const purchase = purchases.find(p => p.resource_id === resourceId);
    return purchase?.purchase_date 
      ? formatDistance(new Date(purchase.purchase_date), new Date(), { addSuffix: true, locale: vi })
      : 'Không rõ';
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium mb-4">Tài liệu đã mua ({resources.length})</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {resources.map(resource => (
          <Card key={resource.resource_id} className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium line-clamp-2">{resource.title}</CardTitle>
            </CardHeader>
            
            <CardContent className="pt-2">
              <div className="space-y-4">
                <div className="flex items-center text-sm text-gray-500">
                  <FileText className="mr-2 h-4 w-4" />
                  <span>{resource.description || 'Không có mô tả'}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-500">
                  <span className="font-medium">Đã mua:</span>
                  <span className="ml-2">{getPurchaseDate(resource.resource_id)}</span>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0 mt-2">
                  <Button 
                    onClick={() => handleDownload(resource)}
                    disabled={downloading === resource.resource_id}
                    className="flex-1"
                  >
                    {downloading === resource.resource_id ? 'Đang tải...' : 'Tải xuống'}
                    <Download className="ml-2 h-4 w-4" />
                  </Button>
                  
                  {resource.preview_link && (
                    <Button 
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        window.open(resource.preview_link, '_blank');
                        toast.info('Đã mở liên kết xem trước', {
                          description: `Đang xem trước ${resource.title}`
                        });
                      }}
                    >
                      Xem trước
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ResourceList;
