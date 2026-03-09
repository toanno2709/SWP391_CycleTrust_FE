import {
  ShoppingCartOutlined,
  CheckCircleOutlined,
  CarOutlined,
  InboxOutlined,
  CloseCircleOutlined,
  DollarOutlined,
  WarningOutlined,
  CloseOutlined,
  StarOutlined,
  ThunderboltOutlined,
  SmileOutlined,
  MessageOutlined,
  LikeOutlined,
  DislikeOutlined,
  BellOutlined,
  CheckOutlined
} from '@ant-design/icons';

export const getNotificationIcon = (type: string, props = { style: { fontSize: '20px' } }) => {
  const icons: Record<string, React.ReactNode> = {
    ORDER_CREATED: <ShoppingCartOutlined {...props} />,
    ORDER_CONFIRMED: <CheckCircleOutlined {...props} />,
    ORDER_SHIPPED: <CarOutlined {...props} />,
    ORDER_DELIVERED: <InboxOutlined {...props} />,
    ORDER_CANCELLED: <CloseCircleOutlined {...props} />,
    PAYMENT_RECEIVED: <DollarOutlined {...props} />,
    PAYMENT_FAILED: <WarningOutlined {...props} />,
    LISTING_APPROVED: <CheckOutlined {...props} />,
    LISTING_REJECTED: <CloseOutlined {...props} />,
    NEW_REVIEW: <StarOutlined {...props} />,
    DISPUTE_CREATED: <ThunderboltOutlined {...props} />,
    DISPUTE_RESOLVED: <SmileOutlined {...props} />,
    MESSAGE_RECEIVED: <MessageOutlined {...props} />,
    SELLER_APPROVED: <LikeOutlined {...props} />,
    SELLER_REJECTED: <DislikeOutlined {...props} />
  };
  return icons[type] || <BellOutlined {...props} />;
};
