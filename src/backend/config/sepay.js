
const SEPAY_CONFIG = {
  API_URL: 'https://api.sepay.vn/v1',
  WEBHOOK_URL: 'http://localhost:5000/api/resources/sepay-webhook',
  MERCHANT_ID: '1684',
  API_TOKEN: 'EWJFSOAYDMPQBR22LPCIMUXА9XERWI4SAQLKILJNH1JUOUFODRKC7MIZCFBZPVW',
  QR_CODE_URL: '/lovable-uploads/3d260848-57e9-4472-8745-08821398d837.png',
  BANK_INFO: {
    BANK_NAME: 'VietinBank',
    ACCOUNT_NUMBER: '101874512384',
    ACCOUNT_NAME: 'TRAN DINH DUNG',
    TRANSFER_CONTENT: 'NAPTIEN'
  }
};

module.exports = SEPAY_CONFIG;
