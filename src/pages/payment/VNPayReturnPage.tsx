import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, Result, Spin, Button, Descriptions } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import { vnpayService, type VNPayReturn } from '../../services/vnpay';
import toast from 'react-hot-toast';
import { formatDateTime as formatDateTimeVN } from '../../utils/format';

export const VNPayReturnPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [paymentResult, setPaymentResult] = useState<VNPayReturn | null>(null);

  useEffect(() => {
    processPaymentCallback();
  }, []);

  const processPaymentCallback = async () => {
    try {
      setLoading(true);
      const result = await vnpayService.processCallback(searchParams);
      setPaymentResult(result);

      if (result.success) {
        toast.success('Thanh toán thành công!');
      } else {
        toast.error(result.message || 'Thanh toán thất bại');
      }
    } catch (error: any) {
      toast.error(error.message || 'Lỗi xử lý kết quả thanh toán');
      setPaymentResult({
        success: false,
        transactionId: '',
        orderId: '',
        amount: 0,
        orderInfo: '',
        responseCode: '99',
        transactionStatus: '',
        payDate: new Date().toISOString(),
        message: 'Lỗi xử lý kết quả thanh toán',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDateTime = (dateString: string) => {
    try {
      return formatDateTimeVN(dateString);
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="text-center">
          <Spin
            indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
            size="large"
          />
          <p className="mt-4 text-gray-600">Đang xử lý kết quả thanh toán...</p>
        </Card>
      </div>
    );
  }

  if (!paymentResult) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card>
          <Result
            status="error"
            title="Không thể xử lý kết quả thanh toán"
            extra={
              <Button type="primary" onClick={() => navigate('/orders')}>
                Về trang đơn hàng
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <Card>
          <Result
            status={paymentResult.success ? 'success' : 'error'}
            icon={
              paymentResult.success ? (
                <CheckCircleOutlined style={{ color: '#52c41a' }} />
              ) : (
                <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
              )
            }
            title={
              paymentResult.success
                ? 'Thanh toán thành công!'
                : 'Thanh toán không thành công'
            }
            subTitle={paymentResult.message}
            extra={[
              <Button
                type="primary"
                key="orders"
                onClick={() => navigate('/orders')}
              >
                Xem đơn hàng
              </Button>,
              <Button key="home" onClick={() => navigate('/')}>
                Về trang chủ
              </Button>,
            ]}
          >
            <div className="mt-8">
              <Descriptions
                title="Thông tin giao dịch"
                bordered
                column={1}
                size="small"
              >
                <Descriptions.Item label="Mã đơn hàng">
                  #{paymentResult.orderId}
                </Descriptions.Item>
                <Descriptions.Item label="Mã giao dịch">
                  {paymentResult.transactionId}
                </Descriptions.Item>
                <Descriptions.Item label="Số tiền">
                  <span className="font-semibold text-lg">
                    {formatCurrency(paymentResult.amount)}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="Nội dung">
                  {paymentResult.orderInfo}
                </Descriptions.Item>
                {paymentResult.bankCode && (
                  <Descriptions.Item label="Ngân hàng">
                    {paymentResult.bankCode}
                  </Descriptions.Item>
                )}
                {paymentResult.cardType && (
                  <Descriptions.Item label="Loại thẻ">
                    {paymentResult.cardType}
                  </Descriptions.Item>
                )}
                <Descriptions.Item label="Thời gian">
                  {formatDateTime(paymentResult.payDate)}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  <span
                    className={
                      paymentResult.success
                        ? 'text-green-600 font-medium'
                        : 'text-red-600 font-medium'
                    }
                  >
                    {paymentResult.success ? 'Thành công' : 'Thất bại'}
                  </span>
                </Descriptions.Item>
              </Descriptions>
            </div>

            {paymentResult.success && (
              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">
                  ✓ Thanh toán của bạn đã được xác nhận
                  <br />
                  ✓ Đơn hàng đang được xử lý
                  <br />✓ Bạn có thể kiểm tra trạng thái đơn hàng trong mục "Đơn hàng
                  của tôi"
                </p>
              </div>
            )}

            {!paymentResult.success && (
              <div className="mt-6 p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-red-800">
                  Giao dịch không thành công. Vui lòng thử lại hoặc liên hệ với
                  chúng tôi nếu bạn đã bị trừ tiền.
                </p>
              </div>
            )}
          </Result>
        </Card>
      </div>
    </div>
  );
};
