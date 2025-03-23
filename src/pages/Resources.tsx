
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Resource } from '@/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Download, FileText, FilePenLine, FileSpreadsheet, FileCode, CreditCard, ExternalLink, QrCode, Copy } from 'lucide-react';
import SectionHeading from '@/components/ui/section-heading';
import { useAuthCheck } from '@/utils/authCheck';
import { toast } from 'sonner';

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

const depositSchema = z.object({
  amount: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: 'Số tiền phải lớn hơn 0'
  }),
  bank_name: z.string().min(1, { message: 'Vui lòng nhập tên ngân hàng' }),
  account_number: z.string().min(1, { message: 'Vui lòng nhập số tài khoản' }),
  account_name: z.string().min(1, { message: 'Vui lòng nhập tên chủ tài khoản' }),
  transaction_id: z.string().min(1, { message: 'Vui lòng nhập mã giao dịch' })
});

const sepaySchema = z.object({
  amount: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: 'Số tiền phải lớn hơn 0'
  })
});

type SepayFormValues = z.infer<typeof sepaySchema>;
type DepositFormValues = z.infer<typeof depositSchema>;

const Resources = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openDepositDialog, setOpenDepositDialog] = useState(false);
  const [openPurchaseDialog, setOpenPurchaseDialog] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [userBalance, setUserBalance] = useState<number>(0);
  const [bankInfo, setBankInfo] = useState({
    bankName: 'VietinBank',
    accountNumber: '101874512384',
    accountName: 'TRAN DINH DUNG'
  });
  const [isProcessingSepay, setIsProcessingSepay] = useState(false);
  const [depositTab, setDepositTab] = useState("manual");
  
  const navigate = useNavigate();
  const checkAuth = useAuthCheck();

  const depositForm = useForm<DepositFormValues>({
    resolver: zodResolver(depositSchema),
    defaultValues: {
      amount: '',
      bank_name: '',
      account_number: '',
      account_name: '',
      transaction_id: ''
    }
  });

  const sepayForm = useForm<SepayFormValues>({
    resolver: zodResolver(sepaySchema),
    defaultValues: {
      amount: ''
    }
  });

  useEffect(() => {
    fetchResources();
    fetchUserBalance();
  }, []);

  const fetchResources = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/resources');
      const data = await response.json();
      
      if (data.success) {
        setResources(data.data);
      } else {
        toast.error('Lỗi', {
          description: data.message || 'Không thể tải danh sách tài liệu'
        });
      }
    } catch (error) {
      console.error('Fetch resources error:', error);
      toast.error('Lỗi', {
        description: 'Lỗi kết nối đến máy chủ'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserBalance = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
      const response = await fetch('http://localhost:5000/api/users', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setUserBalance(data.data.balance);
      }
    } catch (error) {
      console.error('Fetch balance error:', error);
    }
  };

  const handleDeposit = async (data: DepositFormValues) => {
    if (!checkAuth('nạp tiền')) return;
    
    const token = localStorage.getItem('token');
    
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/resources/deposit', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: parseFloat(data.amount),
          transaction_id: data.transaction_id,
          bank_info: {
            bank_name: data.bank_name,
            account_number: data.account_number,
            account_name: data.account_name
          }
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success('Nạp tiền thành công', {
          description: `Số dư của bạn: ${result.data.new_balance.toLocaleString('vi-VN')}đ`
        });
        
        setUserBalance(result.data.new_balance);
        setOpenDepositDialog(false);
        depositForm.reset();
      } else {
        toast.error('Lỗi', {
          description: result.message || 'Không thể nạp tiền'
        });
      }
    } catch (error) {
      console.error('Deposit error:', error);
      toast.error('Lỗi', {
        description: 'Lỗi kết nối đến máy chủ'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSepayDeposit = async (data: SepayFormValues) => {
    if (!checkAuth('nạp tiền')) return;
    
    const token = localStorage.getItem('token');
    
    setIsProcessingSepay(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/resources/sepay-deposit', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: parseFloat(data.amount)
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        localStorage.setItem('pendingPayment', result.data.transaction_ref);
        
        window.open(result.data.payment_url, '_blank');
        
        toast.info('Đang chuyển hướng đến trang thanh toán', {
          description: 'Vui lòng hoàn tất thanh toán trên trang SePay'
        });
        
        setOpenDepositDialog(false);
        sepayForm.reset();
      } else {
        toast.error('Lỗi', {
          description: result.message || 'Không thể tạo yêu cầu thanh toán'
        });
      }
    } catch (error) {
      console.error('SePay deposit error:', error);
      toast.error('Lỗi', {
        description: 'Lỗi kết nối đến máy chủ'
      });
    } finally {
      setIsProcessingSepay(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedResource) return;
    
    if (!checkAuth('mua tài liệu này')) {
      setOpenPurchaseDialog(false);
      return;
    }
    
    const token = localStorage.getItem('token');
    
    setIsLoading(true);
    
    try {
      const response = await fetch(`http://localhost:5000/api/resources/${selectedResource.resource_id}/purchase`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success('Mua tài liệu thành công', {
          description: `Số dư còn lại: ${result.data.new_balance.toLocaleString('vi-VN')}đ`
        });
        
        setUserBalance(result.data.new_balance);
        setOpenPurchaseDialog(false);
        
        navigate('/profile');
      } else {
        toast.error('Lỗi', {
          description: result.message || 'Không thể mua tài liệu'
        });
      }
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error('Lỗi', {
        description: 'Lỗi kết nối đến máy chủ'
      });
    } finally {
      setIsLoading(false);
      setSelectedResource(null);
    }
  };

  const openBuyDialog = (resource: Resource) => {
    if (checkAuth('xem thông tin mua')) {
      setSelectedResource(resource);
      setOpenPurchaseDialog(true);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Đã sao chép', {
        description: 'Thông tin đã được sao chép vào clipboard'
      });
    }).catch(err => {
      console.error('Không thể sao chép: ', err);
    });
  };

  const getTransferContent = () => {
    const username = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') || '{}').username : '';
    return `NAPTIEN ${username}`;
  };

  useEffect(() => {
    const checkPaymentStatus = async () => {
      const pendingPayment = localStorage.getItem('pendingPayment');
      
      if (pendingPayment) {
        const token = localStorage.getItem('token');
        
        try {
          const response = await fetch(`http://localhost:5000/api/resources/check-payment-status/${pendingPayment}`, {
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
              
              fetchUserBalance();
              
              localStorage.removeItem('pendingPayment');
            } else if (result.data.status === 'failed') {
              toast.error('Nạp tiền thất bại', {
                description: 'Giao dịch không thành công, vui lòng thử lại sau'
              });
              
              localStorage.removeItem('pendingPayment');
            }
          }
        } catch (error) {
          console.error('Check payment status error:', error);
        }
      }
    };
    
    checkPaymentStatus();
  }, []);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <SectionHeading
            title="Tài liệu học tập"
            subtitle="Các tài liệu chất lượng cao để hỗ trợ việc học tập của bạn"
          />
          
          <div className="mt-6 md:mt-0">
            <Button 
              onClick={() => setOpenDepositDialog(true)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <CreditCard className="h-4 w-4" /> Nạp tiền
              <span className="font-bold">{userBalance?.toLocaleString('vi-VN')}đ</span>
            </Button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : resources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-6">
            {resources.map((resource) => (
              <Card key={resource.resource_id} className="overflow-hidden flex flex-col h-full">
                <div className="aspect-video overflow-hidden bg-gray-100 flex items-center justify-center">
                  {resource.thumbnail ? (
                    <img 
                      src={resource.thumbnail} 
                      alt={resource.title} 
                      className="w-full h-full object-cover transition-transform hover:scale-105"
                    />
                  ) : (
                    <div className="text-3xl text-gray-400">
                      {getResourceIcon(resource.resource_type || 'PDF')}
                    </div>
                  )}
                </div>
                <CardContent className="p-6 flex-grow">
                  <div className="flex items-center gap-2 mb-3 text-primary">
                    {getResourceIcon(resource.resource_type || 'PDF')}
                    <span className="font-medium">{resource.resource_type}</span>
                  </div>
                  <h3 className="text-xl font-medium mb-3">{resource.title}</h3>
                  <p className="text-muted-foreground mb-4">{resource.description}</p>
                </CardContent>
                <CardFooter className="p-6 pt-0 flex items-center justify-between">
                  <div className="font-bold text-lg">{resource.price?.toLocaleString('vi-VN')}đ</div>
                  <Button 
                    onClick={() => openBuyDialog(resource)}
                    className="rounded-full"
                  >
                    <Download className="mr-2 h-4 w-4" /> Mua ngay
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Chưa có tài liệu nào</p>
          </div>
        )}
      </div>

      <Dialog open={openDepositDialog} onOpenChange={setOpenDepositDialog}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Nạp tiền vào tài khoản</DialogTitle>
            <DialogDescription>
              Nạp tiền để mua tài liệu và khóa học
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="manual" value={depositTab} onValueChange={setDepositTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="sepay">SePay (Tự động)</TabsTrigger>
              <TabsTrigger value="manual">Chuyển khoản thủ công</TabsTrigger>
            </TabsList>
            
            <TabsContent value="sepay" className="space-y-4 pt-4">
              <Form {...sepayForm}>
                <form onSubmit={sepayForm.handleSubmit(handleSepayDeposit)} className="space-y-6">
                  <FormField
                    control={sepayForm.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số tiền (VNĐ)</FormLabel>
                        <FormControl>
                          <input 
                            type="number" 
                            placeholder="Nhập số tiền cần nạp" 
                            {...field} 
                            min="10000" 
                            step="10000"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                    <h4 className="font-medium text-blue-800 mb-2">Thanh toán qua SePay</h4>
                    <p className="text-sm text-blue-700 mb-2">
                      Hệ thống sẽ chuyển bạn đến cổng thanh toán SePay để hoàn tất giao dịch. 
                      Sau khi thanh toán xong, số dư sẽ được cập nhật tự động.
                    </p>
                    <p className="text-sm font-medium text-blue-700">
                      Các phương thức thanh toán được hỗ trợ: Thẻ ATM, Thẻ tín dụng, Ví điện tử
                    </p>
                  </div>
                  
                  <DialogFooter className="gap-2 sm:gap-0">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setOpenDepositDialog(false)}
                    >
                      Hủy
                    </Button>
                    <Button type="submit" disabled={isProcessingSepay}>
                      {isProcessingSepay ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Đang xử lý
                        </>
                      ) : (
                        <>
                          <ExternalLink className="mr-2 h-4 w-4" /> Thanh toán qua SePay
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </TabsContent>
            
            <TabsContent value="manual" className="space-y-4 pt-4">
              <Form {...depositForm}>
                <form onSubmit={depositForm.handleSubmit(handleDeposit)} className="space-y-6">
                  <FormField
                    control={depositForm.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số tiền (VNĐ)</FormLabel>
                        <FormControl>
                          <input 
                            type="number" 
                            placeholder="Nhập số tiền cần nạp" 
                            {...field} 
                            min="10000" 
                            step="10000"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
                      <h4 className="font-medium text-yellow-800 mb-2">Thông tin chuyển khoản</h4>
                      <p className="text-sm text-yellow-700 mb-2">Vui lòng chuyển khoản đến tài khoản:</p>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Ngân hàng:</span> 
                          <span className="flex items-center">
                            <img src="https://upload.wikimedia.org/wikipedia/vi/8/80/VietinBank_logo.svg" alt="VietinBank" className="h-4 mr-2" />
                            {bankInfo.bankName} 
                            <Button 
                              variant="ghost" 
                              className="h-6 w-6 p-0 ml-1" 
                              onClick={() => copyToClipboard(bankInfo.bankName)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Số tài khoản:</span> 
                          <span className="flex items-center">
                            <span className="text-blue-600 font-mono">{bankInfo.accountNumber}</span>
                            <Button 
                              variant="ghost" 
                              className="h-6 w-6 p-0 ml-1" 
                              onClick={() => copyToClipboard(bankInfo.accountNumber)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Chủ tài khoản:</span> 
                          <span className="flex items-center">
                            <span className="text-blue-600 font-medium">{bankInfo.accountName}</span>
                            <Button 
                              variant="ghost" 
                              className="h-6 w-6 p-0 ml-1" 
                              onClick={() => copyToClipboard(bankInfo.accountName)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-yellow-700 mt-3 mb-1">Nội dung chuyển khoản:</p>
                      <div className="flex justify-between font-mono bg-white p-2 rounded border border-yellow-200 text-sm">
                        {getTransferContent()}
                        <Button 
                          variant="ghost" 
                          className="h-6 w-6 p-0 ml-1" 
                          onClick={() => copyToClipboard(getTransferContent())}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-center justify-center">
                      <div className="bg-white p-4 rounded-md border border-gray-200 mb-3">
                        <QrCode className="h-16 w-16 mx-auto mb-3 text-blue-600" />
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=bank://${bankInfo.bankName}/${bankInfo.accountNumber}/${getTransferContent()}`} 
                          alt="QR Code"
                          className="w-32 h-32 mx-auto"
                        />
                      </div>
                      <p className="text-xs text-center text-gray-500">
                        Quét mã QR để chuyển khoản nhanh chóng
                      </p>
                    </div>
                  </div>
                  
                  <FormField
                    control={depositForm.control}
                    name="transaction_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mã giao dịch</FormLabel>
                        <FormControl>
                          <input 
                            placeholder="Nhập mã giao dịch từ ngân hàng" 
                            {...field}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={depositForm.control}
                    name="bank_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tên ngân hàng của bạn</FormLabel>
                        <FormControl>
                          <input 
                            placeholder="VCB, Techcombank, MB..." 
                            {...field}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={depositForm.control}
                    name="account_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số tài khoản của bạn</FormLabel>
                        <FormControl>
                          <input 
                            placeholder="Số tài khoản của bạn" 
                            {...field}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={depositForm.control}
                    name="account_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tên chủ tài khoản của bạn</FormLabel>
                        <FormControl>
                          <input 
                            placeholder="Tên chủ tài khoản của bạn" 
                            {...field}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter className="gap-2 sm:gap-0">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setOpenDepositDialog(false)}
                    >
                      Hủy
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Đang xử lý
                        </>
                      ) : (
                        <>
                          <CreditCard className="mr-2 h-4 w-4" /> Xác nhận nạp tiền
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <Dialog open={openPurchaseDialog} onOpenChange={setOpenPurchaseDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận mua tài liệu</DialogTitle>
            <DialogDescription>
              Vui lòng xác nhận mua tài liệu
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedResource && (
              <>
                <div className="flex items-center gap-3 border-b pb-4">
                  <div className="p-2 bg-primary/10 rounded-full">
                    {getResourceIcon(selectedResource.resource_type || 'PDF')}
                  </div>
                  <div>
                    <h3 className="font-medium">{selectedResource.title}</h3>
                    <p className="text-sm text-muted-foreground">{selectedResource.resource_type}</p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">Giá tài liệu:</span>
                  <span className="font-medium">{selectedResource.price?.toLocaleString('vi-VN')}đ</span>
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <span className="font-medium">Số dư hiện tại:</span>
                  <span className="font-medium">{userBalance.toLocaleString('vi-VN')}đ</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-t">
                  <span className="font-medium">Số dư sau khi mua:</span>
                  <span className={`font-medium ${userBalance < (selectedResource.price || 0) ? 'text-red-500' : 'text-green-500'}`}>
                    {(userBalance - (selectedResource.price || 0)).toLocaleString('vi-VN')}đ
                  </span>
                </div>
                
                {userBalance < (selectedResource.price || 0) && (
                  <div className="bg-red-50 p-3 rounded-md text-sm text-red-600 mt-2">
                    Số dư không đủ để mua tài liệu này. Vui lòng nạp thêm tiền vào tài khoản.
                  </div>
                )}
              </>
            )}
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpenPurchaseDialog(false)}
            >
              Hủy
            </Button>
            <Button 
              onClick={handlePurchase} 
              disabled={isLoading || !selectedResource || userBalance < (selectedResource?.price || 0)}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang xử lý
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" /> Xác nhận mua
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Resources;
