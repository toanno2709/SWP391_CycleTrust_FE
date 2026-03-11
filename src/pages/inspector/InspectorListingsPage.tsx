import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '../../layouts/MainLayout';
import { listingService } from '../../services/listing';
import type { Listing, ListingStatus } from '../../types';
import { formatCurrency } from '../../utils/format';
import { LISTING_STATUS_LABELS } from '../../config/constants';
import { Card, Loading } from '../../components/ui';
import { InspectionDetailModal } from '../../components/listing/InspectionDetailModal';

const TABS = [
  { id: 'all', label: 'Tất cả', status: null },
  { id: 'pending', label: 'Chờ kiểm định', status: 'APPROVED' as ListingStatus },
  { id: 'inspecting', label: 'Đang kiểm tra', status: 'UNDER_INSPECTION' as ListingStatus },
  { id: 'verified', label: 'Đã xác thực', status: 'VERIFIED' as ListingStatus },
  { id: 'myInspections', label: 'Đã kiểm định của tôi', status: 'MY_INSPECTIONS' as any },
];

export const InspectorListingsPage = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [myInspections, setMyInspections] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const [allData, inspectedData] = await Promise.all([
        listingService.getAll(),
        listingService.getMyInspections()
      ]);
      setListings(allData);
      setMyInspections(inspectedData);
    } catch (error) {
      console.error('Failed to fetch listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewInspection = (listing: Listing) => {
    setSelectedListing(listing);
    setModalOpen(true);
  };

  const currentTab = TABS.find(t => t.id === activeTab);
  let filteredListings: Listing[];
  
  if (activeTab === 'myInspections') {
    filteredListings = myInspections;
  } else if (currentTab?.status) {
    filteredListings = listings.filter(l => l.status === currentTab.status);
  } else {
    filteredListings = listings.filter(l => ['APPROVED', 'UNDER_INSPECTION', 'VERIFIED'].includes(l.status));
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-black">Danh sách Listings</h1>
          <Link 
            to="/inspector/dashboard"
            className="text-green-600 hover:text-green-700 font-semibold flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Về Dashboard
          </Link>
        </div>

        <div className="flex gap-2 mb-8 border-b border-slate-200 dark:border-slate-800">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-semibold transition-colors relative ${
                activeTab === tab.id
                  ? 'text-green-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-green-600'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {tab.label}
              {tab.id === 'myInspections' ? (
                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-slate-100 dark:bg-slate-800">
                  {myInspections.length}
                </span>
              ) : tab.status ? (
                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-slate-100 dark:bg-slate-800">
                  {listings.filter(l => l.status === tab.status).length}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        {loading ? (
          <Loading />
        ) : filteredListings.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">inbox</span>
              <p className="text-slate-500">Không có listing nào</p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredListings.map(listing => (
              <Card key={listing.id}>
                <div className="flex items-center gap-4">
                  <img
                    src={listing.media?.[0]?.url || 'https://via.placeholder.com/150'}
                    alt={listing.title}
                    className="w-32 h-32 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-xl mb-1">{listing.title}</h3>
                        <p className="text-sm text-slate-500">
                          {listing.brandName} • {listing.categoryName} • {listing.sizeLabel}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-3 py-1 rounded-full ${
                          listing.status === 'APPROVED'
                            ? 'bg-orange-50 text-orange-600'
                            : listing.status === 'UNDER_INSPECTION'
                            ? 'bg-blue-50 text-blue-600'
                            : listing.status === 'VERIFIED'
                            ? 'bg-green-50 text-green-600'
                            : 'bg-slate-50 text-slate-600'
                        }`}
                      >
                        {LISTING_STATUS_LABELS[listing.status]}
                      </span>
                    </div>
                    
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                      {listing.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="text-green-600 font-bold text-lg">
                          {formatCurrency(listing.priceAmount, listing.currency)}
                        </span>
                        <span className="text-sm text-slate-500">
                          Người bán: {listing.sellerName}
                        </span> 
                      </div>

                      {listing.status === 'APPROVED' && (
                        <Link
                          to={`/inspector/listings/${listing.id}/inspect`}
                          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center gap-2"
                        >
                          <span className="material-symbols-outlined text-lg">assignment</span>
                          Kiểm định
                        </Link>
                      )}

                      {listing.status === 'UNDER_INSPECTION' && (
                        <Link
                          to={`/inspector/listings/${listing.id}/inspect`}
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center gap-2"
                        >
                          <span className="material-symbols-outlined text-lg">edit</span>
                          Tiếp tục kiểm tra
                        </Link>
                      )}

                      {listing.status === 'VERIFIED' && listing.inspection && (
                        <button
                          onClick={() => handleViewInspection(listing)}
                          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center gap-2"
                        >
                          <span className="material-symbols-outlined text-lg">visibility</span>
                          Xem báo cáo
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <InspectionDetailModal 
        listing={selectedListing}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </MainLayout>
  );
};
