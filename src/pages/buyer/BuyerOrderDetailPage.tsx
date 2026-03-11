import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Modal, Input, message, Image } from "antd";
import { MainLayout } from "../../layouts/MainLayout";
import { orderService } from "../../services/order";
import { listingService } from "../../services/listing";
import { reviewService } from "../../services/review";
import type { CreateReviewRequest } from "../../services/review";
import { disputeService } from "../../services/dispute";
import type { CreateDisputeRequest } from "../../services/dispute";
import type { Order, Listing } from "../../types";
import { formatDateTime } from "../../utils/format";
import { ORDER_STATUS_LABELS } from "../../config/constants";

const { TextArea } = Input;

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'COMPLETED':
      return 'bg-green-500/10 text-green-600 border-green-600';
    case 'CANCELED':
      return 'bg-red-500/10 text-red-600 border-red-600';
    case 'DISPUTED':
      return 'bg-yellow-500/10 text-yellow-600 border-yellow-600';
    case 'DELIVERED':
      return 'bg-indigo-500/10 text-indigo-600 border-indigo-600';
    case 'SHIPPING':
      return 'bg-purple-500/10 text-purple-600 border-purple-600';
    case 'DEPOSIT_PAID':
      return 'bg-blue-500/10 text-blue-600 border-blue-600';
    default:
      return 'bg-slate-500/10 text-slate-600 border-slate-600';
  }
};

export default function BuyerOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [reviewData, setReviewData] = useState<CreateReviewRequest>({
    orderId: 0,
    rating: 5,
    comment: "",
  });
  const [disputeData, setDisputeData] = useState<CreateDisputeRequest>({
    orderId: 0,
    summary: "",
  });

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const data = await orderService.getById(Number(id));
      setOrder(data);
      setReviewData((prev) => ({ ...prev, orderId: data.id }));
      setDisputeData((prev) => ({ ...prev, orderId: data.id }));
      
      if (data.listingId) {
        try {
          const listingData = await listingService.getById(data.listingId);
          setListing(listingData);
        } catch (err) {
          console.error('Failed to load listing details:', err);
        }
      }
    } catch (error: any) {
      message.error(error.message || "Lỗi khi tải order");
      navigate("/buyer/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    if (!order) return;
    try {
      await orderService.updateStatus(order.id, status as any);
      message.success("Cập nhật trạng thái thành công");
      await loadOrder();
    } catch (error: any) {
      message.error(error.message || "Lỗi khi cập nhật trạng thái");
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await reviewService.create(reviewData);
      message.success("Đánh giá thành công");
      setShowReviewForm(false);
      await loadOrder();
    } catch (error: any) {
      message.error(error.message || "Lỗi khi đánh giá");
    }
  };

  const handleSubmitDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await disputeService.create(disputeData);
      message.success("Tạo báo cáo vấn đề thành công");
      setShowDisputeForm(false);
      setDisputeData({ ...disputeData, summary: "" });
      await loadOrder();
    } catch (error: any) {
      message.error(error.message || "Lỗi khi tạo báo cáo");
    }
  };

  const getTimelineSteps = (): Array<{ label: string; completed: boolean; date?: string | null }> => {
    if (!order) return [];
    
    const baseSteps: Array<{ label: string; completed: boolean; date?: string | null }> = [
      { label: 'Đặt hàng', completed: true, date: order.createdAt },
    ];

    if (order.depositRequired) {
      baseSteps.push({ 
        label: 'Cọc', 
        completed: !!order.depositPaidAt, 
        date: order.depositPaidAt 
      });
    }

    baseSteps.push(
      { label: 'Giao hàng', completed: ['SHIPPING', 'DELIVERED', 'COMPLETED'].includes(order.status), date: null },
      { label: 'Đã nhận', completed: ['DELIVERED', 'COMPLETED'].includes(order.status) || !!order.deliveredAt, date: order.deliveredAt },
      { label: 'Hoàn thành', completed: order.status === 'COMPLETED' || !!order.completedAt, date: order.completedAt }
    );

    return baseSteps;
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

  if (!order) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-xl">Không tìm thấy order</div>
        </div>
      </MainLayout>
    );
  }

  const timelineSteps = getTimelineSteps();
  const isCanceled = order.status === "CANCELED";

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-2"
          >
            ← Quay lại
          </button>
          <div className="flex items-center gap-4">
            <span className="text-2xl font-bold text-gray-800">Đơn hàng #{order.id}</span>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold border-2 ${getStatusBadgeClass(order.status)}`}>
              {ORDER_STATUS_LABELS[order.status]}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-6 text-gray-800">Tiến trình đơn hàng</h2>
          {isCanceled ? (
            <div className="flex items-center justify-center p-6 bg-red-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-500 text-white rounded-full flex items-center justify-center font-bold text-xl">
                  ✗
                </div>
                <div>
                  <p className="font-semibold text-red-700 text-lg">Đã hủy</p>
                  {order.canceledReason && (
                    <p className="text-sm text-red-600 mt-1">{order.canceledReason}</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className="flex items-center justify-between">
                {timelineSteps.map((step, index) => (
                  <div key={index} className="flex flex-col items-center flex-1 relative">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg z-10 transition-all ${
                      step.completed 
                        ? 'bg-green-500 text-white shadow-lg' 
                        : 'bg-gray-200 text-gray-400'
                    }`}>
                      {step.completed ? '✓' : index + 1}
                    </div>
                    
                    {index < timelineSteps.length - 1 && (
                      <div className={`absolute top-6 left-1/2 w-full h-1 -z-0 ${
                        timelineSteps[index + 1].completed ? 'bg-green-500' : 'bg-gray-200'
                      }`} style={{ transform: 'translateY(-50%)' }} />
                    )}
                    
                    <div className="text-center mt-3">
                      <p className={`font-semibold text-sm ${step.completed ? 'text-green-700' : 'text-gray-500'}`}>
                        {step.label}
                      </p>
                      {step.date && (
                        <p className="text-xs text-gray-500 mt-1">{formatDateTime(step.date).split(' ')[0]}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Thông tin đơn hàng</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Người bán</p>
                  <p className="font-semibold text-gray-800">{order.sellerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Ngày đặt</p>
                  <p className="font-semibold text-gray-800">{formatDateTime(order.createdAt).split(' ')[0]}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Tổng tiền</p>
                  <p className="font-bold text-xl text-green-600">{order.priceAmount.toLocaleString()} {order.currency}</p>
                </div>
                {order.depositRequired && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Tiền cọc</p>
                    <p className="font-semibold text-gray-800">{order.depositAmount.toLocaleString()} {order.currency}</p>
                  </div>
                )}
              </div>
            </div>

            {listing && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Thông tin xe đạp</h3>
                
                {listing.media && listing.media.length > 0 && (
                  <div className="mb-6">
                    <div className="relative bg-gray-100 rounded-lg overflow-hidden mb-4 h-80">
                      <Image
                        src={listing.media[selectedImageIndex].url}
                        alt={listing.title}
                        className="w-full h-full object-contain"
                        preview={{
                          mask: <div className="text-white">🔍 Xem ảnh lớn</div>
                        }}
                      />
                    </div>
                    

                    {listing.media.length > 1 && (
                      <div className="grid grid-cols-5 gap-2">
                        {listing.media.map((media, index) => (
                          <div
                            key={media.id}
                            onClick={() => setSelectedImageIndex(index)}
                            className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all h-20 ${
                              selectedImageIndex === index
                                ? 'border-blue-500 shadow-lg'
                                : 'border-gray-200 hover:border-blue-300'
                            }`}
                          >
                            <img
                              src={media.url}
                              alt={`${listing.title} - ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 border-t pt-4">
                  <div>
                    <p className="text-sm text-gray-500">Tên xe</p>
                    <p className="font-semibold text-gray-800">{listing.title}</p>
                  </div>
                  {listing.brandName && (
                    <div>
                      <p className="text-sm text-gray-500">Thương hiệu</p>
                      <p className="font-semibold text-gray-800">{listing.brandName}</p>
                    </div>
                  )}
                  {listing.categoryName && (
                    <div>
                      <p className="text-sm text-gray-500">Loại xe</p>
                      <p className="font-semibold text-gray-800">{listing.categoryName}</p>
                    </div>
                  )}
                  {listing.sizeLabel && (
                    <div>
                      <p className="text-sm text-gray-500">Kích cỡ</p>
                      <p className="font-semibold text-gray-800">{listing.sizeLabel}</p>
                    </div>
                  )}
                  {listing.yearModel && (
                    <div>
                      <p className="text-sm text-gray-500">Năm sản xuất</p>
                      <p className="font-semibold text-gray-800">{listing.yearModel}</p>
                    </div>
                  )}
                  {listing.conditionNote && (
                    <div>
                      <p className="text-sm text-gray-500">Tình trạng</p>
                      <p className="font-semibold text-gray-800">{listing.conditionNote}</p>
                    </div>
                  )}
                </div>

                {listing.description && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-500 mb-2">Mô tả</p>
                    <p className="text-gray-700 whitespace-pre-wrap text-sm">{listing.description}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Thao tác</h3>
              <div className="space-y-3">
                {(order.status === "DEPOSIT_PAID" || order.status === "CONFIRMED") && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-medium text-blue-800 mb-1">Chờ người bán xác nhận</p>
                    <p className="text-xs text-blue-600">Người bán sẽ xác nhận và giao hàng cho bạn</p>
                  </div>
                )}

                {order.status === "DEPOSIT_PENDING" && (
                  <button
                    onClick={async () => {
                      try {
                        const { paymentUrl } = await orderService.payDeposit(order.id);
                        window.location.href = paymentUrl;
                      } catch (error: any) {
                        message.error(error.message || "Lỗi khi tạo thanh toán");
                      }
                    }}
                    className="w-full px-4 py-3 bg-blue-600 !text-white rounded-lg hover:bg-blue-700 font-semibold shadow-lg transition-colors"
                  >
                    Thanh toán cọc
                    <div className="text-sm mt-1">{order.depositAmount.toLocaleString()} {order.currency}</div>
                  </button>
                )}

                {order.status === "PLACED" && !order.depositRequired && (
                  <button
                    onClick={async () => {
                      try {
                        const { paymentUrl } = await orderService.payFull(order.id);
                        window.location.href = paymentUrl;
                      } catch (error: any) {
                        message.error(error.message || "Lỗi khi tạo thanh toán");
                      }
                    }}
                    className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold shadow-lg transition-colors"
                  >
                    💳 Thanh toán toàn bộ
                    <div className="text-sm mt-1">{order.priceAmount.toLocaleString()} {order.currency}</div>
                  </button>
                )}

                {order.status === "DELIVERED" && order.depositRequired && order.depositPaidAt && 
                 !order.payments?.some(p => p.type === "FULL" && p.status === "PAID") && (
                  <button
                    onClick={async () => {
                      try {
                        const { paymentUrl } = await orderService.payRemaining(order.id);
                        window.location.href = paymentUrl;
                      } catch (error: any) {
                        message.error(error.message || "Lỗi khi tạo thanh toán");
                      }
                    }}
                    className="w-full px-4 py-3 bg-green-600 !text-white rounded-lg hover:bg-green-700 font-semibold shadow-lg transition-colors"
                  >
                    Thanh toán phần còn lại
                    <div className="text-sm mt-1">{(order.priceAmount - order.depositAmount).toLocaleString()} {order.currency}</div>
                  </button>
                )}

                {order.status === "SHIPPING" && (
                  <button
                    onClick={() => handleUpdateStatus("DELIVERED")}
                    className="w-full px-4 py-3 bg-indigo-600 !text-white rounded-lg hover:bg-indigo-700 font-semibold shadow-lg transition-colors"
                  >
                    Xác nhận đã nhận hàng
                  </button>
                )}

                {order.status === "DELIVERED" && !order.depositRequired && (
                  <button
                    onClick={() => handleUpdateStatus("COMPLETED")}
                    className="w-full px-4 py-3 bg-green-600 !text-white rounded-lg hover:bg-green-700 font-semibold shadow-lg transition-colors"
                  >
                    Hoàn thành đơn hàng
                  </button>
                )}

                {order.status === "COMPLETED" && (
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="w-full px-4 py-3 bg-yellow-500 !text-white rounded-lg hover:bg-yellow-600 font-semibold shadow-lg transition-colors"
                  >
                    ⭐ Đánh giá người bán
                  </button>
                )}

                {(order.status === "DELIVERED" || order.status === "COMPLETED") && (
                  <button
                    onClick={() => setShowDisputeForm(true)}
                    className="!mt-4 w-full px-4 py-3 bg-red-100 text-red-700 border-2 border-red-300 rounded-lg hover:bg-red-200 font-semibold transition-colors"
                  >
                    ⚠️ Báo cáo vấn đề
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <Modal
          title="Đánh giá người bán"
          open={showReviewForm}
          onCancel={() => setShowReviewForm(false)}
          footer={null}
        >
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Đánh giá (1-5 sao)</label>
              <input
                type="number"
                min="1"
                max="5"
                value={reviewData.rating}
                onChange={(e) =>
                  setReviewData({ ...reviewData, rating: parseInt(e.target.value) })
                }
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Nhận xét</label>
              <TextArea
                rows={4}
                value={reviewData.comment}
                onChange={(e) =>
                  setReviewData({ ...reviewData, comment: e.target.value })
                }
                placeholder="Chia sẻ trải nghiệm của bạn..."
                required
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 !text-white rounded-lg hover:bg-blue-700"
              >
                Gửi đánh giá
              </button>
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Hủy
              </button>
            </div>
          </form>
        </Modal>

        <Modal
          title="Báo cáo vấn đề"
          open={showDisputeForm}
          onCancel={() => setShowDisputeForm(false)}
          footer={null}
        >
          <form onSubmit={handleSubmitDispute} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Mô tả vấn đề</label>
              <TextArea
                rows={6}
                value={disputeData.summary}
                onChange={(e) =>
                  setDisputeData({ ...disputeData, summary: e.target.value })
                }
                placeholder="Mô tả chi tiết vấn đề bạn gặp phải..."
                required
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Gửi báo cáo
              </button>
              <button
                type="button"
                onClick={() => setShowDisputeForm(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Hủy
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </MainLayout>
  );
}
