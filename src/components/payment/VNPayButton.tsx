import { useState } from 'react';
import { Button } from 'antd';
import { CreditCardOutlined } from '@ant-design/icons';
import { vnpayService } from '../../services/vnpay';
import toast from 'react-hot-toast';

interface VNPayButtonProps {
  orderId: number;
  amount: number;
  orderInfo: string;
  disabled?: boolean;
  size?: 'small' | 'middle' | 'large';
  type?: 'primary' | 'default' | 'dashed' | 'text' | 'link';
  className?: string;
}

export const VNPayButton = ({
  orderId,
  amount,
  orderInfo,
  disabled = false,
  size = 'middle',
  type = 'primary',
  className = '',
}: VNPayButtonProps) => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    try {
      setLoading(true);
      await vnpayService.redirectToPayment(orderId, amount, orderInfo);
    } catch (error: any) {
      toast.error(error.message || 'Không thể kết nối đến cổng thanh toán');
      setLoading(false);
    }
  };

  return (
    <Button
      type={type}
      size={size}
      icon={<CreditCardOutlined />}
      loading={loading}
      disabled={disabled}
      onClick={handlePayment}
      className={className}
    >
      Thanh toán VNPay
    </Button>
  );
};
