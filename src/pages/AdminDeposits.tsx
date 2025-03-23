
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Check, X } from 'lucide-react';
import SectionHeading from '@/components/ui/section-heading';
import { useAuthCheck } from '@/utils/authCheck';

type PendingDeposit = {
  transaction_id: number;
  user_id: number;
  username: string;
  full_name: string;
  email: string;
  amount: string;
  transaction_ref: string;
  metadata: string;
  created_at: string;
};

const AdminDeposits = () => {
  const [pendingDeposits, setPendingDeposits] = useState<PendingDeposit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  
  const navigate = useNavigate();
  const checkAuth = useAuthCheck();

  useEffect(() => {
    // Check if user is admin
    if (!checkAuth('xem trang quản trị')) {
      navigate('/');
      return;
    }
    
    fetchPendingDeposits();
  }, []);

  const fetchPendingDeposits = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/resources/pending-deposits', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setPendingDeposits(data.data);
      } else {
        toast.error('Lỗi', {
          description: data.message || 'Không thể tải danh sách giao dịch đang chờ xử lý'
        });
      }
    } catch (error) {
      console.error('Fetch pending deposits error:', error);
      toast.error('Lỗi', {
        description: 'Lỗi kết nối đến máy chủ'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyDeposit = async (deposit: PendingDeposit, status: 'success' | 'failed') => {
    try {
      setProcessingId(deposit.transaction_id);
      
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/resources/verify-deposit', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          transaction_id: deposit.transaction_ref,
          username: deposit.username,
          amount: parseFloat(deposit.amount),
          status
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Xác nhận thành công', {
          description: `Đã ${status === 'success' ? 'xác nhận' : 'từ chối'} giao dịch`
        });
        
        // Remove the verified deposit from the list
        setPendingDeposits(prevDeposits => 
          prevDeposits.filter(item => item.transaction_id !== deposit.transaction_id)
        );
      } else {
        toast.error('Lỗi', {
          description: data.message || 'Không thể xác nhận giao dịch'
        });
      }
    } catch (error) {
      console.error('Verify deposit error:', error);
      toast.error('Lỗi', {
        description: 'Lỗi kết nối đến máy chủ'
      });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <SectionHeading
          title="Quản lý nạp tiền"
          subtitle="Xác nhận các giao dịch nạp tiền từ người dùng"
        />
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : pendingDeposits.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {pendingDeposits.map((deposit) => {
              // Parse metadata if it exists
              let metadata = {};
              try {
                metadata = JSON.parse(deposit.metadata || '{}');
              } catch (error) {
                console.error('Metadata parse error:', error);
              }
              
              return (
                <Card key={deposit.transaction_id} className="overflow-hidden">
                  <CardHeader className="bg-gray-50">
                    <CardTitle className="flex justify-between items-center">
                      <span>Giao dịch #{deposit.transaction_ref}</span>
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">
                        Đang chờ
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Người dùng</p>
                        <p className="font-medium">{deposit.full_name} ({deposit.username})</p>
                        <p className="text-sm text-muted-foreground">{deposit.email}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground">Số tiền</p>
                        <p className="font-medium text-lg">{parseFloat(deposit.amount).toLocaleString('vi-VN')}đ</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground">Thông tin chuyển khoản</p>
                        <div className="bg-gray-50 p-3 rounded text-sm">
                          <p><span className="font-medium">Ngân hàng:</span> {(metadata as any).bank_name || 'N/A'}</p>
                          <p><span className="font-medium">STK:</span> {(metadata as any).account_number || 'N/A'}</p>
                          <p><span className="font-medium">Chủ TK:</span> {(metadata as any).account_name || 'N/A'}</p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground">Thời gian</p>
                        <p>{new Date(deposit.created_at).toLocaleString('vi-VN')}</p>
                      </div>
                      
                      <div className="flex gap-2 pt-4">
                        <Button 
                          onClick={() => handleVerifyDeposit(deposit, 'success')}
                          className="flex-1"
                          variant="default"
                          disabled={processingId === deposit.transaction_id}
                        >
                          {processingId === deposit.transaction_id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          ) : (
                            <Check className="mr-2 h-4 w-4" />
                          )}
                          Xác nhận
                        </Button>
                        
                        <Button 
                          onClick={() => handleVerifyDeposit(deposit, 'failed')}
                          className="flex-1"
                          variant="destructive"
                          disabled={processingId === deposit.transaction_id}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Từ chối
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Không có giao dịch nào đang chờ xử lý</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminDeposits;
