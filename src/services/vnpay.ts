import { apiClient } from './api';

export interface VNPayPaymentRequest {
  orderId: number;
  amount: number;
  orderInfo: string;
  returnUrl?: string;
}

export interface VNPayPaymentResponse {
  success: boolean;
  paymentUrl: string;
  message?: string;
}

export interface VNPayReturn {
  success: boolean;
  transactionId: string;
  orderId: string;
  amount: number;
  orderInfo: string;
  responseCode: string;
  transactionStatus: string;
  bankCode?: string;
  cardType?: string;
  payDate: string;
  message?: string;
}

export const vnpayService = {
  async createPayment(request: VNPayPaymentRequest): Promise<VNPayPaymentResponse> {
    return await apiClient.post<VNPayPaymentResponse>('/vnpay/create-payment', request);
  },

  async processCallback(queryParams: URLSearchParams): Promise<VNPayReturn> {
    const queryString = queryParams.toString();
    return await apiClient.get<VNPayReturn>(`/vnpay/callback?${queryString}`);
  },

  async redirectToPayment(orderId: number, amount: number, orderInfo: string): Promise<void> {
    try {
      const response = await this.createPayment({
        orderId,
        amount,
        orderInfo,
      });

      if (response.success && response.paymentUrl) {
        window.location.href = response.paymentUrl;
      } else {
        throw new Error(response.message || 'Không thể tạo link thanh toán');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Lỗi kết nối đến VNPay');
    }
  },

  getResponseMessage(code: string): string {
    const messages: Record<string, string> = {
      '00': 'Giao dịch thành công',
      '01': 'Giao dịch đang chờ xử lý',
      '02': 'Merchant không hợp lệ',
      '03': 'Dữ liệu gửi sang không đúng định dạng',
      '04': 'Không cho phép thanh toán',
      '05': 'Giao dịch không thành công',
      '06': 'Giao dịch bị reversal',
      '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ',
      '09': 'Thẻ/Tài khoản chưa đăng ký dịch vụ InternetBanking',
      '10': 'Thẻ/Tài khoản không đúng hoặc chưa được kích hoạt',
      '11': 'Thẻ/Tài khoản đã hết hạn',
      '12': 'Thẻ/Tài khoản bị khóa',
      '13': 'Sai mật khẩu xác thực giao dịch (OTP)',
      '24': 'Khách hàng hủy giao dịch',
      '51': 'Tài khoản không đủ số dư',
      '65': 'Tài khoản đã vượt quá hạn mức giao dịch trong ngày',
      '75': 'Ngân hàng thanh toán đang bảo trì',
      '79': 'Giao dịch vượt quá số lần nhập sai mật khẩu',
      '97': 'Chữ ký không hợp lệ',
      '99': 'Giao dịch thất bại',
    };
    return messages[code] || 'Lỗi không xác định';
  },
};
