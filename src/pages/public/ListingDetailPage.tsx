import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '../../layouts/MainLayout';
import { listingService } from '../../services/listing';
import { orderService } from '../../services/order';
import { wishlistService } from '../../services/wishlist';
import { useAuthStore } from '../../store/auth';
import { useChatStore } from '../../store/chat';
import type { Listing } from '../../types';
import { UserRole } from '../../types';
import { formatCurrency, formatDateTime } from '../../utils/format';
import { LISTING_STATUS_LABELS } from '../../config/constants';
import { Button, Loading, Modal } from '../../components/ui';
import { toast } from 'react-hot-toast';
import { 
  CHECKLIST_ITEMS,
  CONDITION_LABELS,
  CONDITION_COLORS,
  type Checklist 
} from '../../config/inspectionChecklist';
import { SellerReviews } from '../../components/listing/SellerReviews';

export const ListingDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [useDeposit, setUseDeposit] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [inWishlist, setInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      if (!id) return;
      try {
        const data = await listingService.getById(Number(id));
        setListing(data);
        
        // Check if in wishlist (only for buyers)
        if (user?.role === UserRole.BUYER) {
          try {
            const isInWishlist = await wishlistService.check(Number(id));
            setInWishlist(isInWishlist);
          } catch (error) {
            // Ignore wishlist check error
          }
        }
      } catch (error) {
        console.error('Failed to fetch listing:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id, user]);

  const handleCreateOrder = async () => {
    if (!listing) return;
    setCreating(true);
    try {
      const order = await orderService.create({
        listingId: listing.id,
        depositRequired: useDeposit,
      });
      
      toast.success('Đã tạo đơn hàng thành công!');
      setOrderModalOpen(false);
      
      // Redirect to payment
      if (useDeposit) {
        // Pay deposit
        navigate(`/buyer/orders/${order.id}`);
      } else {
        // Pay full immediately - redirect to VNPay
        try {
          const { paymentUrl } = await orderService.payFull(order.id);
          window.location.href = paymentUrl;
        } catch (error: any) {
          toast.error(error.message || 'Không thể khởi tạo thanh toán');
          navigate(`/buyer/orders/${order.id}`);
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Tạo đơn hàng thất bại');
    } finally {
      setCreating(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!listing || !user) {
      toast.error('Vui lòng đăng nhập');
      return;
    }
    
    if (user.role !== UserRole.BUYER) {
      toast.error('Chỉ người mua mới có thể lưu xe yêu thích');
      return;
    }

    setWishlistLoading(true);
    try {
      if (inWishlist) {
        await wishlistService.remove(listing.id);
        setInWishlist(false);
        toast.success('Đã xóa khỏi danh sách yêu thích');
      } else {
        await wishlistService.add(listing.id);
        setInWishlist(true);
        toast.success('Đã thêm vào danh sách yêu thích');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleChatWithSeller = () => {
    if (!listing || !user) {
      toast.error('Vui lòng đăng nhập');
      return;
    }

    if (user.id === listing.sellerId) {
      toast.error('Bạn không thể nhắn tin với chính mình');
      return;
    }

    useChatStore.getState().openChatWithSeller(listing.id, listing.sellerId);
  };


  if (loading) return <MainLayout><Loading fullScreen /></MainLayout>;
  if (!listing) return <MainLayout><div className="text-center py-16">Không tìm thấy listing</div></MainLayout>;

  const images = listing.media?.filter(m => m.type === 'IMAGE').map(m => m.url) || [];
  const video = listing.media?.find(m => m.type === 'VIDEO');
  const canBuy = user?.role === UserRole.BUYER && listing.status === 'VERIFIED';

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-6 lg:px-20 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="aspect-4/3 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
              <img
                src={images[selectedImage] || 'https://via.placeholder.com/800x600'}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 ${
                      selectedImage === idx ? 'border-green-600' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt={`${listing.title} ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
            
            {video && (
              <div className="mt-6">
                <h3 className="text-lg font-bold mb-3">Video giới thiệu</h3>
                <div className="aspect-video rounded-xl overflow-hidden bg-slate-900">
                  <video
                    src={video.url}
                    controls
                    className="w-full h-full"
                    preload="metadata"
                  >
                    Trình duyệt của bạn không hỗ trợ video.
                  </video>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 ${
                listing.status === 'VERIFIED' ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-600'
              }`}>
                {LISTING_STATUS_LABELS[listing.status]}
              </div>
              <h1 className="text-4xl font-black mb-4">{listing.title}</h1>
              <div className="flex items-center gap-4 text-slate-600 dark:text-slate-400">
                {listing.brand && <span className="font-semibold">{listing.brand.name}</span>}
                {listing.category && (
                  <>
                    <span>•</span>
                    <span>{listing.category.name}</span>
                  </>
                )}
                {listing.sizeOption && (
                  <>
                    <span>•</span>
                    <span>Size {listing.sizeOption.label}</span>
                  </>
                )}
              </div>
            </div>

            {canBuy && (
              <div className="flex flex-col gap-3">
                <div className="flex gap-3">
                  <Button
                    size="lg"
                    className="flex-1"
                    onClick={() => setOrderModalOpen(true)}
                  >
                    Đặt mua ngay
                  </Button>
                  <button
                    onClick={handleToggleWishlist}
                    disabled={wishlistLoading}
                    className={`px-4 py-2 rounded-lg border-2 transition-all ${
                      inWishlist
                        ? 'bg-red-50 border-red-500 text-red-500'
                        : 'bg-white border-slate-300 text-slate-600 hover:border-red-500 hover:text-red-500'
                    } disabled:opacity-50`}
                    title={inWishlist ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
                  >
                    <span className="material-symbols-outlined">
                      {inWishlist ? 'favorite' : 'favorite_border'}
                    </span>
                  </button>
                </div>
                {user && user.id !== listing.sellerId && (
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={handleChatWithSeller}
                    className="w-full"
                  >
                    Nhắn tin với người bán
                  </Button>
                )}
              </div>
            )}

            {listing.seller && (
              <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                {listing.seller.avatarUrl ? (
                  <img
                    src={listing.seller.avatarUrl}
                    alt={listing.seller.fullName}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl text-green-600">person</span>
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-bold text-lg">{listing.seller.fullName}</p>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-yellow-500 text-sm">star</span>
                    <span className="font-semibold">{listing.seller.ratingAvg.toFixed(1)}</span>
                    <span className="text-sm text-slate-500">
                      ({listing.seller.ratingCount} đánh giá)
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Mô tả</h2>
              <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line">
                {listing.description}
              </p>
            </div>

            {listing.usageHistory && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Lịch sử sử dụng</h2>
                <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line">
                  {listing.usageHistory}
                </p>
              </div>
            )}

            {listing.inspection && listing.status === 'VERIFIED' && (
              <div className="space-y-4 p-6 bg-green-50 dark:bg-green-900/20 rounded-lg border-2 border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-green-600">verified</span>
                  <h2 className="text-2xl font-bold text-green-600">Đã kiểm định</h2>
                </div>
                <div>
                  <p className="font-semibold mb-2">Tóm tắt báo cáo:</p>
                  <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line">
                    {listing.inspection.summary}
                  </p>
                </div>
                
                {listing.inspection.checklistJson && (() => {
                  try {
                    const checklist = JSON.parse(listing.inspection.checklistJson as any) as Checklist;
                    return (
                      <div className="mt-4">
                        <p className="font-semibold mb-3">Chi tiết kiểm định:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {CHECKLIST_ITEMS.map(item => {
                            const checklistItem = checklist[item.id];
                            if (!checklistItem) return null;
                            const condition = checklistItem.condition as 'excellent' | 'good' | 'fair' | 'poor';
                            return (
                              <div key={item.id} className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                                <div className="flex items-center justify-between mb-2">
                                  <p className="font-semibold text-sm">{item.label}</p>
                                  <span className={`px-2 py-1 rounded text-xs font-semibold text-white ${CONDITION_COLORS[condition]?.bg || 'bg-slate-500'}`}>
                                    {CONDITION_LABELS[condition] || 'N/A'}
                                  </span>
                                </div>
                                {checklistItem.notes && (
                                  <p className="text-xs text-slate-600 dark:text-slate-400">
                                    {checklistItem.notes}
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  } catch (e) {
                    console.error('Failed to parse checklist JSON:', e);
                    return null;
                  }
                })()}
                
                {listing.inspection.inspector && (
                  <div className="text-sm text-slate-600 dark:text-slate-400 pt-4 border-t border-green-200 dark:border-green-700">
                    <p>Kiểm định viên: <span className="font-semibold">{listing.inspection.inspector.fullName}</span></p>
                    <p>Ngày kiểm định: {formatDateTime(listing.inspection.createdAt)}</p>
                  </div>
                )}
                {listing.inspection.reportUrl && (
                  <a 
                    href={listing.inspection.reportUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-semibold"
                  >
                    <span className="material-symbols-outlined text-sm">description</span>
                    Xem báo cáo chi tiết
                  </a>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              {listing.yearModel && (
                <div>
                  <p className="text-slate-500 mb-1">Năm sản xuất</p>
                  <p className="font-semibold">{listing.yearModel}</p>
                </div>
              )}
              {listing.conditionNote && (
                <div>
                  <p className="text-slate-500 mb-1">Tình trạng</p>
                  <p className="font-semibold">{listing.conditionNote}</p>
                </div>
              )}
              <div>
                <p className="text-slate-500 mb-1">Đăng lúc</p>
                <p className="font-semibold">{formatDateTime(listing.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>

        {listing.seller && (
          <div className="mt-12">
            <SellerReviews 
              sellerId={listing.sellerId} 
            />
          </div>
        )}
      </div>

      <Modal
        isOpen={orderModalOpen}
        onClose={() => setOrderModalOpen(false)}
        title="Xác nhận đặt mua"
      >
        <div className="space-y-6">
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <h3 className="font-bold mb-2">{listing.title}</h3>
            <div className="text-2xl font-black text-green-600">
              {formatCurrency(listing.priceAmount, listing.currency)}
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:border-green-600 transition-colors">
              <input
                type="radio"
                checked={useDeposit}
                onChange={() => setUseDeposit(true)}
                className="text-green-600 focus:ring-green-600"
              />
              <div className="flex-1">
                <div className="font-semibold">Đặt cọc trước</div>
                <div className="text-sm text-slate-500">Đặt cọc để giữ xe, thanh toán phần còn lại sau</div>
              </div>
            </label>
            <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:border-green-600 transition-colors">
              <input
                type="radio"
                checked={!useDeposit}
                onChange={() => setUseDeposit(false)}
                className="text-green-600 focus:ring-green-600"
              />
              <div className="flex-1">
                <div className="font-semibold">Thanh toán toàn bộ</div>
                <div className="text-sm text-slate-500">Thanh toán 100% ngay</div>
              </div>
            </label>
          </div>

          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setOrderModalOpen(false)} className="flex-1">
              Hủy
            </Button>
            <Button onClick={handleCreateOrder} isLoading={creating} className="flex-1">
              Xác nhận
            </Button>
          </div>
        </div>
      </Modal>
    </MainLayout>
  );
};
