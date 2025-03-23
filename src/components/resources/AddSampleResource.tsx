
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { FileText } from 'lucide-react';

const AddSampleResource = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAddSample = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/add-sample-resource');
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Thành công',
          description: 'Đã thêm tài liệu mẫu giá 20.000đ vào CSDL'
        });
        
        // Reload the page to show the new resource
        window.location.reload();
      } else {
        toast({
          title: 'Lỗi',
          description: data.message || 'Không thể thêm tài liệu mẫu',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Add sample resource error:', error);
      toast({
        title: 'Lỗi',
        description: 'Lỗi kết nối đến máy chủ',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleAddSample} 
      variant="outline"
      className="flex items-center gap-2"
      disabled={isLoading}
    >
      {isLoading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
      ) : (
        <FileText className="h-4 w-4" />
      )}
      Thêm tài liệu mẫu (20.000đ)
    </Button>
  );
};

export default AddSampleResource;
