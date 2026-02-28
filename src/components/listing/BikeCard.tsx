import { Link } from 'react-router-dom';
import type { Listing } from '../../types';
import { formatCurrency } from '../../utils/format';
import { LISTING_STATUS_LABELS } from '../../config/constants';
import { Card } from '../ui';

interface BikeCardProps {
  listing: Listing;
}

export const BikeCard = ({ listing }: BikeCardProps) => {
  const mainImage = listing.media?.[0]?.url || 'https://via.placeholder.com/400x300?text=No+Image';
  const statusColor = {
    VERIFIED: 'text-green-600 bg-green-50',
    APPROVED: 'text-blue-600 bg-blue-50',
    SOLD: 'text-slate-600 bg-slate-50',
    DRAFT: 'text-slate-600 bg-slate-50',
    PENDING_APPROVAL: 'text-yellow-600 bg-yellow-50',
    REJECTED: 'text-red-600 bg-red-50',
    UNDER_INSPECTION: 'text-purple-600 bg-purple-50',
    ARCHIVED: 'text-slate-600 bg-slate-50',
  }[listing.status] || 'text-slate-600 bg-slate-50';

  return (
    <Link to={`/listings/${listing.id}`}>
      <Card hoverable className="overflow-hidden p-0 h-full">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={mainImage}
            alt={listing.title}
            className="w-full h-full object-cover transition-transform hover:scale-105"
          />
          <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold ${statusColor}`}>
            {LISTING_STATUS_LABELS[listing.status]}
          </div>
          {listing.status === 'VERIFIED' && (
            <div className="absolute top-3 left-3 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">verified</span>
              Đã xác thực
            </div>
          )}
        </div>
        
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-bold text-lg line-clamp-2 mb-1">{listing.title}</h3>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              {listing.brand?.name && (
                <span className="font-medium">{listing.brand.name}</span>
              )}
              {listing.category?.name && (
                <>
                  <span>•</span>
                  <span>{listing.category.name}</span>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-2xl font-black text-green-600">
              {formatCurrency(listing.priceAmount, listing.currency)}
            </div>
            {listing.seller && (
              <div className="flex items-center gap-1 text-sm">
                <span className="material-symbols-outlined text-yellow-500 text-base">star</span>
                <span className="font-bold">{listing.seller.ratingAvg.toFixed(1)}</span>
              </div>
            )}
          </div>
          
          {listing.locationText && (
            <div className="flex items-center gap-1 text-sm text-slate-500">
              <span className="material-symbols-outlined text-base">location_on</span>
              <span>{listing.locationText}</span>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
};
