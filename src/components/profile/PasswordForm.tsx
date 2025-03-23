
import { useState, FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const PasswordForm = () => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validate passwords
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Mật khẩu không khớp", {
        description: "Mật khẩu mới và xác nhận mật khẩu phải giống nhau"
      });
      return;
    }
    
    if (formData.newPassword.length < 6) {
      toast.warning("Mật khẩu quá ngắn", {
        description: "Mật khẩu mới phải có ít nhất 6 ký tự"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Bạn chưa đăng nhập');
      }
      
      // Show loading toast
      toast.loading("Đang cập nhật mật khẩu...");
      
      const response = await fetch('http://localhost:5000/api/users/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      });
      
      const data = await response.json();
      
      // Dismiss loading toast
      toast.dismiss();
      
      if (data.success) {
        // Reset form after successful password change
        setFormData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
        
        toast.success('Đổi mật khẩu thành công', {
          description: "Mật khẩu của bạn đã được cập nhật"
        });
      } else {
        throw new Error(data.message || 'Đổi mật khẩu thất bại');
      }
    } catch (error: any) {
      console.error('Lỗi khi đổi mật khẩu:', error);
      toast.error('Đổi mật khẩu thất bại', {
        description: error.message || 'Đã có lỗi xảy ra, vui lòng thử lại sau'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
          <Input
            id="currentPassword"
            name="currentPassword"
            type="password"
            value={formData.currentPassword}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="newPassword">Mật khẩu mới</Label>
          <Input
            id="newPassword"
            name="newPassword"
            type="password"
            value={formData.newPassword}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>
      </div>
      
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
      </Button>
    </form>
  );
};

export default PasswordForm;
