import { useState, useEffect } from 'react';
import { reviewService, type Review } from '../../services/review';
import { formatDateTime } from '../../utils/format';
import { toast } from 'react-hot-toast';

interface SellerReviewsProps {
  sellerId: number;
}

export const SellerReviews = ({ sellerId }: SellerReviewsProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    loadReviews();
  }, [sellerId]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      
      // Load reviews and rating in parallel
      const [reviewsData, ratingData] = await Promise.all([
        reviewService.getSellerReviews(sellerId),
        reviewService.getSellerRating(sellerId)
      ]);
      
      setReviews(reviewsData);
      setAverageRating(ratingData.averageRating);
    } catch (error: any) {
      console.error('Failed to load reviews:', error);
      toast.error('Không thể tải đánh giá');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`material-symbols-outlined text-lg ${
              star <= rating ? 'text-yellow-500' : 'text-slate-300'
            }`}
            style={{ fontVariationSettings: star <= rating ? '"FILL" 1' : '"FILL" 0' }}
          >
            star
          </span>
        ))}
      </div>
    );
  };

  const getRatingDistribution = () => {
    const distribution = [0, 0, 0, 0, 0]; // [1*, 2*, 3*, 4*, 5*]
    reviews.forEach(review => {
      distribution[review.rating - 1]++;
    });
    return distribution;
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  const distribution = getRatingDistribution();
  const totalReviews = reviews.length;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg space-y-6">
      <h2 className="text-2xl font-bold">Đánh giá từ người mua</h2>

      {totalReviews === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <span className="material-symbols-outlined text-4xl mb-2">rate_review</span>
          <p>Chưa có đánh giá nào</p>
        </div>
      ) : (
        <>
          <div className="flex flex-col md:flex-row gap-6 p-6 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <div className="flex flex-col items-center justify-center md:border-r md:border-slate-300 dark:md:border-slate-600 md:pr-6">
              <div className="text-5xl font-black text-green-600 mb-2">
                {averageRating.toFixed(1)}
              </div>
              <div className="mb-2">
                {renderStars(Math.round(averageRating))}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {totalReviews} đánh giá
              </p>
            </div>

            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = distribution[star - 1];
                const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                
                return (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-sm font-semibold w-8">{star}⭐</span>
                    <div className="flex-1 bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                      <div
                        className="bg-yellow-500 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-slate-600 dark:text-slate-400 w-12 text-right">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold">Tất cả đánh giá</h3>
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-green-600 dark:text-green-400">
                        person
                      </span>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-white">
                            {review.buyerName}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {renderStars(review.rating)}
                            <span className="text-sm text-slate-500 dark:text-slate-400">
                              {formatDateTime(review.createdAt).split(' ')[0]}
                            </span>
                          </div>
                        </div>
                      </div>

                      {review.comment && (
                        <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line">
                          {review.comment}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
