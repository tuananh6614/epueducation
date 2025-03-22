
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { LogOut, Waves } from 'lucide-react';

interface LogoutConfirmationProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const LogoutConfirmation = ({ isOpen, onOpenChange }: LogoutConfirmationProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = () => {
    // Xóa token và thông tin người dùng trong localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Trigger storage event for cross-component communication
    window.dispatchEvent(new Event('storage'));
    
    // Đóng dialog
    onOpenChange(false);
    
    // Hiển thị thông báo
    toast({
      title: "Đăng xuất thành công",
      description: "Hẹn gặp lại bạn sớm!",
    });
    
    // Chuyển hướng về trang chủ
    navigate('/');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LogOut className="h-5 w-5" />
            Xác nhận đăng xuất
          </DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center py-4">
          <Waves className="h-20 w-20 text-primary animate-[wave_1s_ease-in-out_infinite]" />
          <p className="text-center mt-4 text-muted-foreground">
            Cảm ơn bạn đã sử dụng QuizCourseHub!<br />
            Hẹn gặp lại bạn sớm nhé.
          </p>
        </div>
        
        <DialogFooter className="flex sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Hủy
          </Button>
          <Button
            type="button" 
            variant="destructive"
            onClick={handleLogout}
          >
            Đăng xuất
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LogoutConfirmation;

