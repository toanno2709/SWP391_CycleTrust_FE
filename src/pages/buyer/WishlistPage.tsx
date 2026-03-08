import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../../layouts/MainLayout';
import { wishlistService } from '../../services/wishlist';
import type { WishlistItem } from '../../services/wishlist';
import toast from 'react-hot-toast';

export default function WishlistPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    try {
      setLoading(true);
      const data = await wishlistService.getMyWishlist();
      setItems(data);
    } catch (error: any) {
      toast.error(error.message || 'Lỗi khi tải wishlist');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (listingId: number) => {
    try {
      await wishlistService.remove(listingId);
      toast.success('Đã xóa khỏi danh sách yêu thích');
      await loadWishlist();
    } catch (error: any) {
      toast.error(error.message || 'Lỗi khi xóa');
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-xl">Đang tải...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Danh sách yêu thích</h1>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg mb-4">Chưa có listing nào trong danh sách yêu thích</p>
          <button
            onClick={() => navigate('/search')}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Khám phá xe
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(item => (
            <div key={item.listingId} className="bg-white rounded-lg shadow-md overflow-hidden">
              {item.mainImageUrl ? (
                <img
                  src={item.mainImageUrl}
                  alt={item.title}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">No image</span>
                </div>
              )}
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2 truncate">{item.title}</h3>
                <p className="text-green-600 font-bold text-xl mb-2">
                  {item.priceAmount.toLocaleString()} {item.currency}
                </p>
                <p className="text-sm text-gray-600 mb-3">
                  Trạng thái: <span className="font-semibold">{item.status}</span>
                </p>
                <p className="text-xs text-gray-400 mb-4">
                  Thêm vào: {new Date(item.addedAt).toLocaleDateString()}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/listings/${item.listingId}`)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Xem chi tiết
                  </button>
                  <button
                    onClick={() => handleRemove(item.listingId)}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    </MainLayout>
  );
}
