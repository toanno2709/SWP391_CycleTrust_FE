export const UserRole = {
  BUYER: 'BUYER',
  SELLER: 'SELLER',
  ADMIN: 'ADMIN',
  INSPECTOR: 'INSPECTOR'
} as const;
export type UserRole = typeof UserRole[keyof typeof UserRole];

export const ListingStatus = {
  DRAFT: 'DRAFT',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  UNDER_INSPECTION: 'UNDER_INSPECTION',
  VERIFIED: 'VERIFIED',
  SOLD: 'SOLD',
  ARCHIVED: 'ARCHIVED'
} as const;
export type ListingStatus = typeof ListingStatus[keyof typeof ListingStatus];

export const OrderStatus = {
  PLACED: 'PLACED',
  DEPOSIT_PENDING: 'DEPOSIT_PENDING',
  DEPOSIT_PAID: 'DEPOSIT_PAID',
  CONFIRMED: 'CONFIRMED',
  SHIPPING: 'SHIPPING',
  DELIVERED: 'DELIVERED',
  COMPLETED: 'COMPLETED',
  CANCELED: 'CANCELED',
  DISPUTED: 'DISPUTED'
} as const;
export type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus];

export const PaymentType = {
  DEPOSIT: 'DEPOSIT',
  FULL: 'FULL',
  REFUND: 'REFUND'
} as const;
export type PaymentType = typeof PaymentType[keyof typeof PaymentType];

export const PaymentStatus = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED'
} as const;
export type PaymentStatus = typeof PaymentStatus[keyof typeof PaymentStatus];

export const MediaType = {
  IMAGE: 'IMAGE',
  VIDEO: 'VIDEO'
} as const;
export type MediaType = typeof MediaType[keyof typeof MediaType];

export interface User {
  id: number;
  email?: string;
  phone?: string;
  role: UserRole;
  fullName: string;
  avatarUrl?: string;
  isActive: boolean;
  approvalStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  ratingAvg: number;
  ratingCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Brand {
  id: number;
  name: string;
  isActive: boolean;
  createdAt: string;
}

export interface BikeCategory {
  id: number;
  name: string;
  isActive: boolean;
  createdAt: string;
}

export interface SizeOption {
  id: number;
  label: string;
  isActive: boolean;
}

export interface ListingMedia {
  id: number;
  listingId: number;
  type: MediaType;
  url: string;
  sortOrder: number;
  createdAt: string;
}

export interface Listing {
  id: number;
  sellerId: number;
  sellerName?: string;
  title: string;
  description: string;
  usageHistory?: string;
  locationText?: string;
  brandId?: number;
  brandName?: string;
  categoryId?: number;
  categoryName?: string;
  sizeOptionId?: number;
  sizeLabel?: string;
  priceAmount: number;
  currency: string;
  conditionNote?: string;
  yearModel?: number;
  status: ListingStatus;
  approvedBy?: number;
  approvedAt?: string;
  rejectedReason?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  seller?: User;
  brand?: Brand;
  category?: BikeCategory;
  sizeOption?: SizeOption;
  media?: ListingMedia[];
  inspection?: Inspection;
}

export interface Inspection {
  id: number;
  listingId: number;
  inspectorId: number;
  summary: string;
  checklistJson?: Record<string, any>;
  reportUrl?: string;
  createdAt: string;
  updatedAt: string;
  inspector?: User;
}

export interface Order {
  id: number;
  listingId: number;
  buyerId: number;
  sellerId: number;
  status: OrderStatus;
  priceAmount: number;
  currency: string;
  depositRequired: boolean;
  depositAmount: number;
  depositDueAt?: string;
  depositPaidAt?: string;
  reserveExpiresAt?: string;
  shippingNote?: string;
  deliveredAt?: string;
  completedAt?: string;
  canceledReason?: string;
  createdAt: string;
  updatedAt: string;
  listing?: Listing;
  buyer?: User;
  seller?: User;
  payments?: Payment[];
  listingTitle?: string;
  buyerName?: string;
  sellerName?: string;
  totalAmount?: number;
  remainingAmount?: number;
}

export interface Payment {
  id: number;
  orderId: number;
  type: PaymentType;
  status: PaymentStatus;
  amount: number;
  currency: string;
  provider?: string;
  providerTxnId?: string;
  paidAt?: string;
  createdAt: string;
}

export interface Review {
  id: number;
  orderId: number;
  buyerId: number;
  sellerId: number;
  rating: number;
  comment?: string;
  createdAt: string;
  buyer?: User;
  seller?: User;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
}

export interface LoginRequest {
  emailOrPhone: string;
  password: string;
}

export interface RegisterRequest {
  email?: string;
  phone?: string;
  password: string;
  fullName: string;
  role: UserRole;
}

export interface CreateListingMediaRequest {
  type: 'IMAGE' | 'VIDEO';
  url: string;
  sortOrder: number;
}

export interface CreateListingRequest {
  title: string;
  description: string;
  usageHistory?: string;
  locationText?: string;
  brandId?: number;
  categoryId?: number;
  sizeOptionId?: number;
  priceAmount: number;
  conditionNote?: string;
  yearModel?: number;
  media?: CreateListingMediaRequest[];
  status?: 'DRAFT' | 'PENDING_APPROVAL';
}

export interface CreateOrderRequest {
  listingId: number;
  depositRequired: boolean;
  shippingNote?: string;
}

export interface CreateInspectionRequest {
  summary: string;
  checklistJson?: string;
  reportUrl?: string;
}

export const NotificationType = {
  ORDER_CREATED: 'ORDER_CREATED',
  ORDER_CONFIRMED: 'ORDER_CONFIRMED',
  ORDER_SHIPPING: 'ORDER_SHIPPING',
  ORDER_DELIVERED: 'ORDER_DELIVERED',
  ORDER_COMPLETED: 'ORDER_COMPLETED',
  ORDER_CANCELED: 'ORDER_CANCELED',
  PAYMENT_SUCCESS: 'PAYMENT_SUCCESS',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  LISTING_APPROVED: 'LISTING_APPROVED',
  LISTING_REJECTED: 'LISTING_REJECTED',
  LISTING_VERIFIED: 'LISTING_VERIFIED',
  INSPECTION_COMPLETED: 'INSPECTION_COMPLETED',
  DISPUTE_CREATED: 'DISPUTE_CREATED',
  DISPUTE_RESOLVED: 'DISPUTE_RESOLVED',
  REVIEW_RECEIVED: 'REVIEW_RECEIVED',
  MESSAGE_RECEIVED: 'MESSAGE_RECEIVED',
  SELLER_APPROVED: 'SELLER_APPROVED',
  SELLER_REJECTED: 'SELLER_REJECTED'
} as const;
export type NotificationType = typeof NotificationType[keyof typeof NotificationType];

export interface Notification {
  id: number;
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  relatedEntityId?: number;
  relatedEntityType?: string;
  actionUrl?: string;
  createdAt: string;
}

export interface NotificationSummary {
  unreadCount: number;
  recentNotifications: Notification[];
}

export interface ChatConversation {
  id: number;
  listingId?: number;
  listingTitle?: string;
  buyerId: number;
  buyerName: string;
  buyerAvatar?: string;
  sellerId: number;
  sellerName: string;
  sellerAvatar?: string;
  lastMessageAt?: string;
  lastMessage?: string;
  lastMessageSenderId?: number;
  unreadCountBuyer: number;
  unreadCountSeller: number;
  createdAt: string;
}

export interface ChatMessage {
  id: number;
  conversationId: number;
  senderId: number;
  senderName: string;
  senderAvatar?: string;
  content: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface SendMessageRequest {
  conversationId?: number;
  listingId?: number;
  receiverId: number;
  content: string;
}
