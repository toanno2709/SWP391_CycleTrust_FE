import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MainLayout } from '../../layouts/MainLayout';
import { listingService } from '../../services/listing';
import type { Listing } from '../../types';
import { formatCurrency, formatDateTime } from '../../utils/format';
import { LISTING_STATUS_LABELS, ROUTES } from '../../config/constants';
import { Card, Loading, Button, Pagination } from '../../components/ui';

export const SellerDashboard = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [allListings, setAllListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        const allData = await listingService.getMyListings();
        setAllListings(allData);
        
        const pagedData = await listingService.getMyListingsPaged({
          pageNumber: currentPage,
          pageSize,
        });
        setListings(pagedData.items);
        setTotalPages(pagedData.totalPages);
      } catch (error) {
        console.error('Failed to fetch listings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [currentPage]);

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-black">Dashboard Người bán</h1>
          <Link to={ROUTES.SELLER_CREATE_LISTING}>
            <Button icon={<span className="material-symbols-outlined">add</span>}>
              Đăng tin mới
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-12">
          <Card>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
                <span className="material-symbols-outlined text-green-600 text-2xl">inventory_2</span>
              </div>
              <div>
                <p className="text-3xl font-black">{allListings.length}</p>
                <p className="text-sm text-slate-500">Tổng tin</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-blue-500 text-2xl">pending</span>
              </div>
              <div>
                <p className="text-3xl font-black">
                  {allListings.filter(l => l.status === 'PENDING_APPROVAL').length}
                </p>
                <p className="text-sm text-slate-500">Chờ duyệt</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-green-500 text-2xl">verified</span>
              </div>
              <div>
                <p className="text-3xl font-black">
                  {allListings.filter(l => l.status === 'VERIFIED').length}
                </p>
                <p className="text-sm text-slate-500">Đã xác thực</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-red-500 text-2xl">cancel</span>
              </div>
              <div>
                <p className="text-3xl font-black">
                  {allListings.filter(l => l.status === 'REJECTED').length}
                </p>
                <p className="text-sm text-slate-500">Đã từ chối</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-500/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-slate-500 text-2xl">sell</span>
              </div>
              <div>
                <p className="text-3xl font-black">
                  {allListings.filter(l => l.status === 'SOLD').length}
                </p>
                <p className="text-sm text-slate-500">Đã bán</p>
              </div>
            </div>
          </Card>
        </div>

        <Card>
          <h2 className="text-2xl font-bold mb-6">Tin đăng của bạn</h2>
          
          {loading ? (
            <Loading />
          ) : listings.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">inventory_2</span>
              <p className="text-slate-500 mb-4">Chưa có tin đăng nào</p>
              <Link to={ROUTES.SELLER_CREATE_LISTING}>
                <Button>Đăng tin đầu tiên</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {listings.map(listing => (
                <div
                  key={listing.id}
                  className="flex items-center gap-4 p-4 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-green-600 transition-colors"
                >
                  <img
                    src={listing.media?.[0]?.url || 'https://via.placeholder.com/100'}
                    alt={listing.title}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold mb-1">{listing.title}</h3>
                    <p className="text-sm text-slate-500 mb-2">{formatDateTime(listing.createdAt)}</p>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={`text-xs font-bold px-2 py-1 rounded ${
                        listing.status === 'VERIFIED' ? 'bg-green-500/10 text-green-600' :
                        listing.status === 'APPROVED' ? 'bg-blue-500/10 text-blue-600' :
                        listing.status === 'PENDING_APPROVAL' ? 'bg-yellow-500/10 text-yellow-600' :
                        listing.status === 'REJECTED' ? 'bg-red-500/10 text-red-600' :
                        listing.status === 'SOLD' ? 'bg-slate-500/10 text-slate-600' :
                        'bg-slate-500/10 text-slate-600'
                      }`}>
                        {LISTING_STATUS_LABELS[listing.status]}
                      </span>
                      <span className="text-sm font-semibold text-green-600">
                        {formatCurrency(listing.priceAmount, listing.currency)}
                      </span>
                    </div>
                    {listing.status === 'REJECTED' && listing.rejectedReason && (
                      <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-sm font-semibold text-red-800 dark:text-red-300 mb-1">
                          ⚠️ Lý do từ chối:
                        </p>
                        <p className="text-sm text-red-700 dark:text-red-400">
                          {listing.rejectedReason}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {listing.status === 'DRAFT' && (
                      <button
                        onClick={() => navigate(`/seller/listings/${listing.id}/edit`)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        ✏️ Sửa
                      </button>
                    )}
                    <Link
                      to={`/listings/${listing.id}`}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Xem
                    </Link>
                  </div>
                </div>
              ))}
              
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  className="mt-6"
                />
              )}
            </div>
          )}
        </Card>
      </div>
    </MainLayout>
  );
};
