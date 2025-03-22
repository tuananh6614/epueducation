
import { Resource, Purchase } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ResourceListProps {
  resources: Resource[];
  purchases: Purchase[];
}

const ResourceList = ({ resources, purchases }: ResourceListProps) => {
  const downloadResource = async (resourceId: number, resourceLink: string) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Bạn cần đăng nhập để tải tài liệu');
        return;
      }
      
      // Track download
      await fetch(`http://localhost:5000/api/resources/${resourceId}/download`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Initiate download
      window.open(resourceLink, '_blank');
      
    } catch (error) {
      console.error('Lỗi khi tải tài liệu:', error);
      toast.error('Không thể tải tài liệu');
    }
  };
  
  if (resources.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Bạn chưa mua tài liệu nào</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Tài liệu đã mua ({resources.length})</h3>
      
      <div className="grid grid-cols-1 gap-4">
        {resources.map((resource) => {
          const purchase = purchases.find(p => p.resource_id === resource.resource_id);
          return (
            <div 
              key={resource.resource_id} 
              className="border rounded-md overflow-hidden flex flex-col md:flex-row"
            >
              <div className="w-full md:w-1/4 h-40 md:h-auto">
                <img 
                  src={resource.thumbnail || '/placeholder.svg'} 
                  alt={resource.title} 
                  className="h-full w-full object-cover"
                />
              </div>
              
              <div className="p-4 flex-1 flex flex-col">
                <h4 className="text-lg font-semibold">{resource.title}</h4>
                <p className="text-gray-500 text-sm mb-2">
                  {resource.resource_type} • Mua {purchase ? formatDistanceToNow(new Date(purchase.purchase_date), { addSuffix: true, locale: vi }) : ''}
                </p>
                <p className="text-sm flex-grow">{resource.description}</p>
                
                <div className="mt-4 flex justify-end">
                  <Button 
                    onClick={() => downloadResource(resource.resource_id, resource.resource_link)}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Download size={16} />
                    Tải xuống
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ResourceList;
