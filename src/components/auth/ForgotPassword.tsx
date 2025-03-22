
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Layout from '../layout/Layout';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập địa chỉ email",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Không thể khôi phục mật khẩu');
      }
      
      toast({
        title: "Thành công",
        description: "Hướng dẫn khôi phục mật khẩu đã được gửi đến email của bạn",
      });
      
      setIsSubmitted(true);
    } catch (error) {
      console.error('Forgot password error:', error);
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : 'Không thể khôi phục mật khẩu',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container max-w-md mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Quên mật khẩu</CardTitle>
            <CardDescription>
              Nhập email của bạn để nhận hướng dẫn khôi phục mật khẩu
            </CardDescription>
          </CardHeader>
          {!isSubmitted ? (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Địa chỉ email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="example@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Đang xử lý...' : 'Gửi yêu cầu khôi phục'}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  Đã nhớ mật khẩu?{' '}
                  <Link to="/login" className="text-primary hover:underline">
                    Đăng nhập
                  </Link>
                </p>
              </CardFooter>
            </form>
          ) : (
            <CardContent className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200 text-green-800">
                <p className="font-medium">Yêu cầu đã được gửi!</p>
                <p className="text-sm mt-1">Vui lòng kiểm tra email của bạn để nhận hướng dẫn khôi phục mật khẩu.</p>
              </div>
              <Button 
                className="w-full mt-4" 
                variant="outline"
                asChild
              >
                <Link to="/login">Quay lại trang đăng nhập</Link>
              </Button>
            </CardContent>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default ForgotPassword;
