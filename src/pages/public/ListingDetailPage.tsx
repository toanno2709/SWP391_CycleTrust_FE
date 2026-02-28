import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '../../layouts/MainLayout';
import { listingService } from '../../services/listing';
import { orderService } from '../../services/order';
import { useAuthStore } from '../../store/auth';
import type { Listing } from '../../types';
import { UserRole } from '../../types';
import { formatCurrency, formatDateTime } from '../../utils/format';
import { LISTING_STATUS_LABELS } from '../../config/constants';
import { Button, Loading, Modal } from '../../components/ui';

export const ListingDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [useDeposit, setUseDeposit] = useState(true);
  const [creating, setCreating] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const fetchListing = async () => {
      if (!id) return;
      try {
        const data = await listingService.getById(Number(id));
        setListing(data);
      } catch (error) {
        console.error('Failed to fetch listing:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  const handleCreateOrder = async () => {
    if (!listing) return;
    setCreating(true);
    try {
      await orderService.create({
        listingId: listing.id,
        useDeposit,
      });
      navigate(`/buyer/orders`);
    } catch (error: any) {
      alert(error.message || 'Tạo đơn hàng thất bại');
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <MainLayout><Loading fullScreen /></MainLayout>;
  if (!listing) return <MainLayout><div className="text-center py-16">Không tìm thấy listing</div></MainLayout>;

  const images = listing.media?.filter(m => m.type === 'IMAGE').map(m => m.url) || [];
  const canBuy = user?.role === UserRole.BUYER && listing.status === 'VERIFIED';

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-6 lg:px-20 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
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

            <div className="py-6 border-y border-slate-200 dark:border-slate-800">
              <div className="text-4xl font-black text-green-600 mb-2">
                {formatCurrency(listing.priceAmount, listing.currency)}
              </div>
              {listing.locationText && (
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <span className="material-symbols-outlined">location_on</span>
                  <span>{listing.locationText}</span>
                </div>
              )}
            </div>

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

            {canBuy && (
              <Button
                size="lg"
                className="w-full"
                onClick={() => setOrderModalOpen(true)}
              >
                Đặt mua ngay
              </Button>
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
