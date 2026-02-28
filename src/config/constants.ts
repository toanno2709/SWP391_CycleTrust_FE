export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const CLOUDINARY_CONFIG = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
  apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY,
};

export const TOKEN_KEY = 'cycle_trust_token';
export const USER_KEY = 'cycle_trust_user';

export const ROUTES = {
  HOME: '/',
  SEARCH: '/search',
  LISTING_DETAIL: '/listings/:id',
  
  LOGIN: '/login',
  REGISTER: '/register',
  
  BUYER_DASHBOARD: '/buyer/dashboard',
  BUYER_ORDERS: '/buyer/orders',
  BUYER_WISHLIST: '/buyer/wishlist',
  
  SELLER_DASHBOARD: '/seller/dashboard',
  SELLER_LISTINGS: '/seller/listings',
  SELLER_CREATE_LISTING: '/seller/listings/create',
  SELLER_EDIT_LISTING: '/seller/listings/:id/edit',
  SELLER_ORDERS: '/seller/orders',
  
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_LISTINGS: '/admin/listings',
  ADMIN_USERS: '/admin/users',
  ADMIN_ORDERS: '/admin/orders',
  ADMIN_BRANDS: '/admin/brands',
  ADMIN_CATEGORIES: '/admin/categories',
  
  INSPECTOR_DASHBOARD: '/inspector/dashboard',
  INSPECTOR_LISTINGS: '/inspector/listings',
  INSPECTOR_INSPECTION: '/inspector/listings/:id/inspect',
};

export const LISTING_STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Nháp',
  PENDING_APPROVAL: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối',
  UNDER_INSPECTION: 'Đang kiểm tra',
  VERIFIED: 'Đã xác thực',
  SOLD: 'Đã bán',
  ARCHIVED: 'Lưu trữ'
};

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PLACED: 'Đã đặt',
  DEPOSIT_PENDING: 'Chờ cọc',
  DEPOSIT_PAID: 'Đã cọc',
  CONFIRMED: 'Xác nhận',
  SHIPPING: 'Đang giao',
  DELIVERED: 'Đã giao',
  COMPLETED: 'Hoàn thành',
  CANCELED: 'Đã hủy',
  DISPUTED: 'Tranh chấp'
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Chờ thanh toán',
  PAID: 'Đã thanh toán',
  FAILED: 'Thất bại',
  REFUNDED: 'Đã hoàn tiền'
};
