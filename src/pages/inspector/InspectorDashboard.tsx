import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '../../layouts/MainLayout';
import { listingService } from '../../services/listing';
import type { Listing } from '../../types';
import { formatCurrency } from '../../utils/format';
import { LISTING_STATUS_LABELS } from '../../config/constants';
import { Card, Loading } from '../../components/ui';
import { InspectionDetailModal } from '../../components/listing/InspectionDetailModal';

export const InspectorDashboard = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [myInspections, setMyInspections] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pendingData, inspectedData] = await Promise.all([
          listingService.getAll({ status: 'APPROVED' }),
          listingService.getMyInspections()
        ]);
        setListings(pendingData);
        setMyInspections(inspectedData);
      } catch (error) {
        console.error('Failed to fetch listings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleViewInspection = (listing: Listing) => {
    setSelectedListing(listing);
    setModalOpen(true);
  };

  const verifiedCount = myInspections.filter(l => l.status === 'VERIFIED').length;
  const pendingInspectionCount = listings.filter(l => l.status === 'APPROVED').length;

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-black mb-8">Dashboard Kiểm định viên</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center">
                <span className="material-symbols-outlined text-orange-600 text-2xl">pending_actions</span>
              </div>
              <div>
                <p className="text-3xl font-black">{pendingInspectionCount}</p>
                <p className="text-sm text-slate-500">Chờ kiểm định</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
                <span className="material-symbols-outlined text-green-600 text-2xl">verified</span>
              </div>
              <div>
                <p className="text-3xl font-black">{verifiedCount}</p>
                <p className="text-sm text-slate-500">Đã xác thực</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-blue-500 text-2xl">assignment</span>
              </div>
              <div>
                <p className="text-3xl font-black">{myInspections.length}</p>
                <p className="text-sm text-slate-500">Tổng đã kiểm định</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Hỗ trợ</h2>
          <Link to="/admin/disputes">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center">
                    <span className="material-symbols-outlined text-orange-600 text-2xl">report_problem</span>
                  </div>
                  <div>
                    <p className="text-lg font-bold">Hỗ trợ giải quyết tranh chấp</p>
                    <p className="text-sm text-slate-500">Xem và hỗ trợ xử lý các khiếu nại</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-slate-400">arrow_forward</span>
              </div>
            </Card>
          </Link>
        </div>

        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Listings chờ kiểm định</h2>
            <Link 
              to="/inspector/listings"
              className="text-green-600 hover:text-green-700 font-semibold flex items-center gap-1"
            >
              Xem tất cả
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </Link>
          </div>
          
          {loading ? (
            <Loading />
          ) : pendingInspectionCount === 0 ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">check_circle</span>
              <p className="text-slate-500">Không có listing nào cần kiểm định</p>
            </div>
          ) : (
            <div className="space-y-4">
              {listings
                .filter(l => l.status === 'APPROVED')
                .slice(0, 5)
                .map(listing => (
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
                      <p className="text-sm text-slate-500 mb-2">
                        {listing.brandName} • {listing.categoryName}
                      </p>
                      <div className="flex items-center gap-3">
                        <span className="text-green-600 font-bold">
                          {formatCurrency(listing.priceAmount, listing.currency)}
                        </span>
                        <span className="text-xs px-2 py-1 rounded-full bg-orange-50 text-orange-600">
                          {LISTING_STATUS_LABELS[listing.status]}
                        </span>
                      </div>
                    </div>
                    <Link
                      to={`/inspector/listings/${listing.id}/inspect`}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Kiểm định
                    </Link>
                  </div>
                ))}
            </div>
          )}
        </Card>

        <Card className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Xe đã kiểm định</h2>
            <Link 
              to="/inspector/listings"
              className="text-green-600 hover:text-green-700 font-semibold flex items-center gap-1"
            >
              Xem tất cả
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </Link>
          </div>
          
          {loading ? (
            <Loading />
          ) : myInspections.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">assignment</span>
              <p className="text-slate-500">Chưa có xe nào được kiểm định</p>
            </div>
          ) : (
            <div className="space-y-4">
              {myInspections
                .slice(0, 5)
                .map(listing => (
                  <div
                    key={listing.id}
                    className="flex items-center gap-4 p-4 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-green-600 transition-colors cursor-pointer"
                    onClick={() => handleViewInspection(listing)}
                  >
                    <img
                      src={listing.media?.[0]?.url || 'https://via.placeholder.com/100'}
                      alt={listing.title}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-bold mb-1">{listing.title}</h3>
                      <p className="text-sm text-slate-500 mb-2">
                        {listing.brandName} • {listing.categoryName}
                      </p>
                      <div className="flex items-center gap-3">
                        <span className="text-green-600 font-bold">
                          {formatCurrency(listing.priceAmount, listing.currency)}
                        </span>
                        <span className="text-xs px-2 py-1 rounded-full bg-green-50 text-green-600">
                          {LISTING_STATUS_LABELS[listing.status]}
                        </span>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                      Xem chi tiết
                    </button>
                  </div>
                ))}
            </div>
          )}
        </Card>
      </div>

      <InspectionDetailModal 
        listing={selectedListing}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </MainLayout>
  );
};
