import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Resource } from '@/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Download, FileText, FilePenLine, FileSpreadsheet, FileCode, CreditCard, ExternalLink, QrCode, Copy, Smartphone, CreditCard as CreditCardIcon } from 'lucide-react';
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
  }),
  phone: z.string().optional()
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
  const [depositTab, setDepositTab] = useState("bank");
  const [selectedPaymentAmount, setSelectedPaymentAmount] = useState("150000");
  
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
      amount: '150000',
      phone: ''
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

  const copyToClipboard = (text: string) => {
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

  const handleAmountSelect = (amount: string) => {
    setSelectedPaymentAmount(amount);
    sepayForm.setValue('amount', amount);
  };

  const paymentAmounts = [
    { value: "10000", label: "10.000đ" },
    { value: "20000", label: "20.000đ" },
    { value: "50000", label: "50.000đ" },
    { value: "100000", label: "100.000đ" },
    { value: "150000", label: "150.000đ" },
    { value: "200000", label: "200.000đ" },
    { value: "500000", label: "500.000đ" }
  ];

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
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-xl font-bold">Nạp tiền vào tài khoản</DialogTitle>
          </DialogHeader>
          
          <div className="mt-4">
            <div className="grid grid-cols-5 gap-2">
              <div 
                className={`relative flex flex-col items-center justify-center p-4 rounded-md cursor-pointer border transition-all ${depositTab === 'bank' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-emerald-500'}`}
                onClick={() => setDepositTab('bank')}
              >
                {depositTab === 'bank' && <div className="absolute top-0 left-0 bg-emerald-500 text-white px-2 py-0.5 text-[10px] rounded-br-md">HOT</div>}
                <CreditCard className="h-10 w-10 text-emerald-500 mb-2" />
                <span className="text-xs text-center">Chuyển khoản</span>
              </div>
              
              <div 
                className={`flex flex-col items-center justify-center p-4 rounded-md cursor-pointer border transition-all ${depositTab === 'qr' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-emerald-500'}`}
                onClick={() => setDepositTab('qr')}
              >
                <QrCode className="h-10 w-10 text-emerald-500 mb-2" />
                <span className="text-xs text-center">QR Code</span>
              </div>
              
              <div 
                className={`flex flex-col items-center justify-center p-4 rounded-md cursor-pointer border transition-all ${depositTab === 'momo' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-emerald-500'}`}
                onClick={() => setDepositTab('momo')}
              >
                <img src="/lovable-uploads/b97148b3-3f98-4ed3-a28d-e2764daa882c.png" alt="Momo" className="h-10 w-10 mb-2" />
                <span className="text-xs text-center">Ví Momo</span>
              </div>
              
              <div 
                className={`flex flex-col items-center justify-center p-4 rounded-md cursor-pointer border transition-all ${depositTab === 'atm' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-emerald-500'}`}
                onClick={() => setDepositTab('atm')}
              >
                <CreditCardIcon className="h-10 w-10 text-emerald-500 mb-2" />
                <span className="text-xs text-center">Thẻ ATM</span>
              </div>
              
              <div 
                className={`flex flex-col items-center justify-center p-4 rounded-md cursor-pointer border transition-all ${depositTab === 'phone' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-emerald-500'}`}
                onClick={() => setDepositTab('phone')}
              >
                <Smartphone className="h-10 w-10 text-emerald-500 mb-2" />
                <span className="text-xs text-center">Thẻ điện thoại</span>
              </div>
            </div>
            
            {depositTab === 'bank' && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">Chuyển tiền bằng tài khoản ngân hàng</h3>
                
                <div className="mb-4">
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {paymentAmounts.slice(0, 8).map(amount => (
                      <button
                        key={amount.value}
                        type="button"
                        className={`py-2 px-3 border rounded-md text-center transition-all ${
                          selectedPaymentAmount === amount.value 
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                            : 'border-gray-200 hover:border-emerald-500'
                        }`}
                        onClick={() => handleAmountSelect(amount.value)}
                      >
                        {amount.label}
                      </button>
                    ))}
                  </div>
                  
                  <Input
                    type="text"
                    value={sepayForm.watch('amount')}
                    onChange={(e) => sepayForm.setValue('amount', e.target.value)}
                    className="text-lg"
                    placeholder="Nhập số tiền khác"
                  />
                </div>
                
                <div className="bg-gray-50 p-5 rounded-md border border-gray-200 mb-4">
                  <div className="text-lg font-medium text-emerald-700 mb-2">
                    Sử dụng <span className="text-emerald-500 font-bold">CHUYỂN TIỀN NHANH 24/7</span> của các ngân hàng
                  </div>
                  
                  <div className="mb-4">
                    <div className="font-medium mb-1">Tham khảo hướng dẫn của ngân hàng:</div>
                    <div className="flex gap-2 items-center">
                      <span className="text-emerald-600 hover:underline cursor-pointer">VIETINBANK</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="font-medium mb-1">Hoặc sử dụng quét QR của các ví điện tử:</div>
                    <div className="flex gap-3">
                      <img src="https://cdn.zalopay.vn/logo/zalopay-logo.png" alt="ZaloPay" className="h-8" />
                      <img src="/lovable-uploads/b97148b3-3f98-4ed3-a28d-e2764daa882c.png" alt="Momo" className="h-8" />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
                    <h4 className="font-medium text-yellow-800 mb-2">Thông tin chuyển khoản</h4>
                    <p className="text-sm text-yellow-700 mb-2">Vui lòng chuyển khoản đến tài khoản:</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Ngân hàng:</span> 
                        <span className="flex items-center">
                          <img src="/lovable-uploads/c0c65079-9013-438c-a4a5-8ed80efc88ee.png" alt="VietinBank" className="h-5 mr-2" />
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
                    <div className="flex justify-between font-mono bg-white p-2 rounded border border-yellow-200 text-sm overflow-auto max-h-24">
                      <div className="whitespace-normal break-all mr-2">{getTransferContent()}</div>
                      <Button 
                        variant="ghost" 
                        className="h-6 w-6 p-0 ml-1 flex-shrink-0" 
                        onClick={() => copyToClipboard(getTransferContent())}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center justify-center">
                    <div className="bg-white p-4 rounded-md border border-gray-200 mb-3">
                      <QrCode className="h-12 w-12 mx-auto mb-3 text-emerald-600" />
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=vietinbank:${bankInfo.accountNumber}/${getTransferContent()}`} 
                        alt="QR Code"
                        className="w-32 h-32 mx-auto"
                      />
                    </div>
                    <p className="text-xs text-center text-gray-500">
                      Quét mã QR để chuyển khoản nhanh chóng
                    </p>
                  </div>
                </div>
                
                <Button 
                  className="w-full mt-6 bg-emerald-500 hover:bg-emerald-600 text-lg py-6"
                  onClick={() => {
                    toast.info('Vui lòng chuyển khoản và xác nhận với admin', {
                      description: 'Sau khi chuyển khoản, vui lòng liên hệ admin để xác nhận giao dịch'
                    });
                    setOpenDepositDialog(false);
                  }}
                >
                  Nạp tiền
                </Button>
              </div>
            )}
            
            {depositTab === 'qr' && (
              <div className="mt-6 text-center">
                <h3 className="text-lg font-medium mb-4">Quét mã QR để nạp tiền</h3>
                <div className="bg-white p-6 rounded-md border border-gray-200 mx-auto max-w-xs mb-6">
                  <QrCode className="h-16 w-16 mx-auto mb-3 text-emerald-600" />
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=vietinbank:${bankInfo.accountNumber}/${getTransferContent()}`} 
                    alt="QR Code"
                    className="w-48 h-48 mx-auto mb-4"
                  />
                  <div className="text-sm text-gray-600">
                    <p className="font-medium">Quét mã QR bằng ứng dụng ngân hàng</p>
                    <p className="text-xs mt-1">hoặc các ví điện tử hỗ trợ</p>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 mb-4">
                  <p>Số tiền: <span className="font-bold text-black">{(parseFloat(sepayForm.watch('amount') || '0')).toLocaleString('vi-VN')}đ</span></p>
                </div>
                
                <div className="grid grid-cols-4 gap-2 mb-6">
                  {paymentAmounts.slice(0, 8).map(amount => (
                    <button
                      key={amount.value}
                      type="button"
                      className={`py-2 px-3 border rounded-md text-center transition-all ${
                        selectedPaymentAmount === amount.value 
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                          : 'border-gray-200 hover:border-emerald-500'
                      }`}
                      onClick={() => handleAmountSelect(amount.value)}
                    >
                      {amount.label}
                    </button>
                  ))}
                </div>
                
                <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-lg py-6" onClick={() => setDepositTab('bank')}>
                  Tiếp tục
                </Button>
              </div>
            )}
            
            {depositTab === 'momo' && (
              <div className="mt-6 text-center">
                <h3 className="text-lg font-medium mb-4">Thanh toán qua ví Momo</h3>
                <div className="bg-white p-6 rounded-md border border-gray-200 mx-auto max-w-xs mb-6">
                  <img 
                    src="/lovable-uploads/b97148b3-3f98-4ed3-a28d-e2764daa882c.png" 
                    alt="Momo" 
                    className="h-16 w-16 mx-auto mb-4"
                  />
                  <p className="font-medium text-sm mb-4">Số điện thoại Momo</p>
                  <p className="font-bold text-xl mb-1">{bankInfo.accountNumber}</p>
                  <p className="text-sm mb-4">{bankInfo.accountName}</p>
                  <Button 
                    variant="outline" 
                    className="text-sm border-violet-500 text-violet-600"
                    onClick={() => copyToClipboard(bankInfo.accountNumber)}
                  >
                    <Copy className="h-3 w-3 mr-2" /> Copy số điện thoại
                  </Button>
                </div>
                
                <div className="text-sm text-gray-600 mb-4">
                  <p>Số tiền: <span className="font-bold text-black">{(parseFloat(sepayForm.watch('amount') || '0')).toLocaleString('vi-VN')}đ</span></p>
                  <p className="mt-1">Nội dung chuyển khoản: <span className="font-mono font-medium">{getTransferContent()}</span></p>
                </div>
                
                <div className="grid grid-cols-4 gap-2 mb-6">
                  {paymentAmounts.slice(0, 8).map(amount => (
                    <button
                      key={amount.value}
                      type="button"
                      className={`py-2 px-3 border rounded-md text-center transition-all ${
                        selectedPaymentAmount === amount.value 
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                          : 'border-gray-200 hover:border-emerald-500'
                      }`}
                      onClick={() => handleAmountSelect(amount.value)}
                    >
                      {amount.label}
                    </button>
                  ))}
                </div>
                
                <Button 
                  className="w-full bg-violet-500 hover:bg-violet-600 text-lg py-6"
                  onClick={() => {
                    toast.info('Vui lòng chuyển khoản qua Momo', {
                      description: 'Sau khi chuyển khoản, vui lòng liên hệ admin để xác nhận giao dịch'
                    });
                    setOpenDepositDialog(false);
                  }}
                >
                  Thanh toán qua Momo
                </Button>
              </div>
            )}
            
            {depositTab === 'atm' && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">Thanh toán qua thẻ ATM</h3>
                
                <Form {...sepayForm}>
                  <form onSubmit={sepayForm.handleSubmit(handleSepayDeposit)} className="space-y-6">
                    <FormField
                      control={sepayForm.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Số tiền (VNĐ)</FormLabel>
                          <div className="grid grid-cols-4 gap-2 mb-3">
                            {paymentAmounts.slice(0, 8).map(amount => (
                              <button
                                key={amount.value}
                                type="button"
                                className={`py-2 px-3 border rounded-md text-center transition-all ${
                                  selectedPaymentAmount === amount.value 
                                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                                    : 'border-gray-200 hover:border-emerald-500'
                                }`}
                                onClick={() => handleAmountSelect(amount.value)}
                              >
                                {amount.label}
                              </button>
                            ))}
                          </div>
                          <FormControl>
                            <Input 
                              placeholder="Nhập số tiền cần nạp"
