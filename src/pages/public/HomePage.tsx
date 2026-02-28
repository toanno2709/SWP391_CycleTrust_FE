import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '../../layouts/MainLayout';
import { listingService } from '../../services/listing';
import type { Listing } from '../../types';
import { ListingStatus } from '../../types';
import { BikeCard } from '../../components/listing/BikeCard';
import { Button, Loading } from '../../components/ui';
import { ROUTES } from '../../config/constants';

export const HomePage = () => {
  const [featuredListings, setFeaturedListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const listings = await listingService.getAll({ 
          status: ListingStatus.VERIFIED 
        });
        setFeaturedListings(listings.slice(0, 8));
      } catch (error) {
        console.error('Failed to fetch listings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  return (
    <MainLayout>
      <section className="px-6 lg:px-20 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="relative h-[500px] lg:h-[600px] w-full overflow-hidden rounded-xl flex items-center justify-center bg-slate-900">
            <div className="absolute inset-0 opacity-60">
              <img
                src="https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1600&h=900&fit=crop"
                alt="Cyclist on mountain road"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="relative z-10 max-w-3xl flex flex-col items-center gap-8 text-center p-6">
              <div className="space-y-4">
                <h1 className="text-white text-4xl lg:text-7xl font-black leading-[1.1] tracking-tight">
                  Premium Pre-owned, <br />
                  <span className="text-green-600">Expertly Verified</span>
                </h1>
                <p className="text-slate-200 text-lg lg:text-xl font-medium max-w-xl mx-auto">
                  Thị trường xe đạp thể thao đã qua sử dụng đáng tin cậy nhất Việt Nam
                </p>
              </div>
              <Link to={ROUTES.SEARCH}>
                <Button size="lg" className="text-lg px-12">
                  Tìm xe ngay
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 lg:px-20 py-12 bg-white dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-start gap-4 p-6">
            <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center text-green-600 flex-shrink-0">
              <span className="material-symbols-outlined text-3xl">verified_user</span>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Xác thực chuyên nghiệp</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Mỗi chiếc xe được kiểm tra kỹ lưỡng bởi đội ngũ chuyên gia
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-6">
            <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center text-green-600 flex-shrink-0">
              <span className="material-symbols-outlined text-3xl">shield</span>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Mua bán an toàn</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Hệ thống thanh toán đặt cọc và bảo vệ người mua
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-6">
            <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center text-green-600 flex-shrink-0">
              <span className="material-symbols-outlined text-3xl">support_agent</span>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Hỗ trợ 24/7</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Đội ngũ hỗ trợ luôn sẵn sàng giúp đỡ bạn
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 lg:px-20 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-black mb-2">Xe đã xác thực</h2>
              <p className="text-slate-600 dark:text-slate-400">
                Những chiếc xe đã được kiểm tra và xác nhận chất lượng
              </p>
            </div>
            <Link to={ROUTES.SEARCH}>
              <Button variant="outline">Xem tất cả</Button>
            </Link>
          </div>

          {loading ? (
            <Loading />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredListings.map(listing => (
                <BikeCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="px-6 lg:px-20 py-16 bg-green-50">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-black mb-4">Sẵn sàng bán xe của bạn?</h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
            Đăng bán xe đạp của bạn trên CycleTrust và tiếp cận hàng ngàn người mua tiềm năng
          </p>
          <Link to={ROUTES.SELLER_CREATE_LISTING}>
            <Button size="lg">Đăng tin ngay</Button>
          </Link>
        </div>
      </section>
    </MainLayout>
  );
};
