
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Clock, Home, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

const PaymentResult = () => {
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status');
  const transactionId = searchParams.get('transaction_id');
  const amount = searchParams.get('amount');
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    const checkPaymentStatus = async () => {
      if (!transactionId) return;
      
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      
      setIsLoading(true);
      
      try {
        const response = await fetch(`http://localhost:5000/api/resources/check-payment-status/${transactionId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        const result = await response.json();
        
        if (result.success) {
          if (result.data.status === 'completed') {
            toast.success('Nạp tiền thành công', {
              description: `Số tiền ${parseFloat(result.data.amount).toLocaleString('vi-VN')}đ đã được cộng vào tài khoản`
            });
            
            // Xóa pendingPayment nếu có
            localStorage.removeItem('pendingPayment');
          } else if (result.data.status === 'failed') {
            toast.error('Nạp tiền thất bại', {
              description: 'Giao dịch không thành công, vui lòng thử lại sau'
            });
            
            // Xóa pendingPayment nếu có
            localStorage.removeItem('pendingPayment');
          }
        }
      } catch (error) {
        console.error('Check payment status error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkPaymentStatus();
  }, [transactionId, navigate]);

  const getStatusColor = () => {
    if (status === 'successful') return 'text-green-500';
    if (status === 'failed') return 'text-red-500';
    return 'text-yellow-500';
  };

  const getStatusIcon = () => {
    if (status === 'successful') return <CheckCircle className="h-16 w-16 text-green-500" />;
    if (status === 'failed') return <XCircle className="h-16 w-16 text-red-500" />;
    return <Clock className="h-16 w-16 text-yellow-500" />;
  };

  const getStatusTitle = () => {
    if (status === 'successful') return 'Thanh toán thành công';
    if (status === 'failed') return 'Thanh toán thất bại';
    return 'Đang xử lý thanh toán';
  };

  const getStatusDescription = () => {
    if (status === 'successful') {
      return `Số tiền ${amount ? parseFloat(amount).toLocaleString('vi-VN') : '0'}đ đã được nạp vào tài khoản của bạn`;
    }
    if (status === 'failed') {
      return 'Giao dịch không thành công. Vui lòng thử lại hoặc liên hệ với bộ phận hỗ trợ';
    }
    return 'Hệ thống đang xử lý giao dịch của bạn. Vui lòng đợi trong giây lát';
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <Card className="border-t-8" style={{ borderTopColor: status === 'successful' ? '#10b981' : status === 'failed' ? '#ef4444' : '#f59e0b' }}>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                {getStatusIcon()}
              </div>
              <CardTitle className={`text-2xl ${getStatusColor()}`}>
                {getStatusTitle()}
              </CardTitle>
              <CardDescription className="text-base mt-2">
                {getStatusDescription()}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {transactionId && (
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm text-gray-500">Mã giao dịch:</p>
                  <p className="font-mono font-medium">{transactionId}</p>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="outline" onClick={() => navigate('/')} className="w-full sm:w-auto">
                <Home className="mr-2 h-4 w-4" /> Trang chủ
              </Button>
              <Button onClick={() => navigate('/resources')} className="w-full sm:w-auto">
                <ArrowRight className="mr-2 h-4 w-4" /> Tiếp tục mua sắm
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default PaymentResult;
