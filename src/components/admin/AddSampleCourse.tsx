
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const AddSampleCourse = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success?: boolean;
    message?: string;
    courseId?: number;
  }>({});
  const [isOpen, setIsOpen] = useState(false);

  const handleAddSampleCourse = async () => {
    setIsLoading(true);
    setResult({});
    
    try {
      const response = await fetch('http://localhost:5000/api/courses/seed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      
      setResult({
        success: data.success,
        message: data.message,
        courseId: data.courseId
      });
      
      if (data.success) {
        toast({
          title: "Thành công!",
          description: `Đã thêm khóa học mẫu với ID: ${data.courseId}`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Lỗi!",
          description: data.message || "Không thể thêm khóa học mẫu.",
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "Lỗi không xác định"
      });
      
      toast({
        variant: "destructive",
        title: "Lỗi!",
        description: "Không thể kết nối đến máy chủ.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Thêm khóa học mẫu</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Thêm khóa học mẫu</DialogTitle>
          <DialogDescription>
            Thêm một khóa học JavaScript mẫu vào cơ sở dữ liệu để xem demo.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
              <p>Đang thêm khóa học mẫu...</p>
            </div>
          ) : result.success === true ? (
            <div className="bg-green-50 p-4 rounded-md flex items-start">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <p className="font-medium text-green-800">Thêm khóa học thành công!</p>
                <p className="text-green-700 mt-1">ID khóa học: {result.courseId}</p>
                <p className="text-sm text-green-600 mt-2">Bạn có thể tìm thấy khóa học này trong danh sách khóa học.</p>
              </div>
            </div>
          ) : result.success === false ? (
            <div className="bg-red-50 p-4 rounded-md flex items-start">
              <XCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <p className="font-medium text-red-800">Thêm khóa học thất bại</p>
                <p className="text-red-700 mt-1">{result.message || "Đã xảy ra lỗi."}</p>
              </div>
            </div>
          ) : (
            <p className="text-center text-muted-foreground">
              Nhấn nút bên dưới để thêm khóa học mẫu vào cơ sở dữ liệu.
            </p>
          )}
        </div>
        
        <DialogFooter>
          {!isLoading && !result.success && (
            <Button onClick={handleAddSampleCourse}>
              Thêm khóa học mẫu
            </Button>
          )}
          {result.success && (
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Đóng
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddSampleCourse;
