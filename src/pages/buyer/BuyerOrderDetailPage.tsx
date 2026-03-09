import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Modal, Input, message, Carousel, Image } from "antd";
import { MainLayout } from "../../layouts/MainLayout";
import { orderService } from "../../services/order";
import { listingService } from "../../services/listing";
import { reviewService } from "../../services/review";
import type { CreateReviewRequest } from "../../services/review";
import { disputeService } from "../../services/dispute";
import type { CreateDisputeRequest } from "../../services/dispute";
import type { Order, Listing } from "../../types";
import { formatDateTime } from "../../utils/format";

const { TextArea } = Input;

export default function BuyerOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
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
      
      // Load listing details
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

  const handleSubmitDispute = async () => {
    if (!disputeData.summary.trim()) {
      message.warning("Vui lòng nhập mô tả vấn đề");
      return;
    }
    
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

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto p-6">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 text-blue-600 hover:text-blue-800"
        >
          ← Quay lại
        </button>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-6">
            Chi tiết đơn hàng #{order.id}
          </h1>

          {/* Order Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-gray-600">Listing:</p>
              <p className="font-semibold">{order.listingTitle}</p>
            </div>
            <div>
              <p className="text-gray-600">Người bán:</p>
              <p className="font-semibold">{order.sellerName}</p>
            </div>
            <div>
              <p className="text-gray-600">Trạng thái:</p>
              <p className="font-semibold text-blue-600">{order.status}</p>
            </div>
            <div>
              <p className="text-gray-600">Tổng tiền:</p>
              <p className="font-semibold text-green-600">
                {order.priceAmount.toLocaleString()} {order.currency}
              </p>
            </div>
            {order.depositRequired && (
              <>
                <div>
                  <p className="text-gray-600">Tiền cọc:</p>
                  <p className="font-semibold">
                    {order.depositAmount.toLocaleString()} {order.currency}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Còn lại:</p>
                  <p className="font-semibold">
                    {(order.priceAmount - order.depositAmount).toLocaleString()}{" "}
                    {order.currency}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Listing Details */}
          {listing && (
            <div className="mb-6 border-t pt-6">
              <h2 className="text-xl font-semibold mb-4">Thông tin xe đạp</h2>
              
              {/* Images */}
              {listing.media && listing.media.length > 0 && (
                <div className="mb-4">
                  <Carousel autoplay>
                    {listing.media.map((media) => (
                      <div key={media.id}>
                        <Image
                          src={media.url}
                          alt={listing.title}
                          className="w-full h-64 object-cover rounded"
                        />
                      </div>
                    ))}
                  </Carousel>
                </div>
              )}

              {/* Bike Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600">Tên xe:</p>
                  <p className="font-semibold">{listing.title}</p>
                </div>
                {listing.brandName && (
                  <div>
                    <p className="text-gray-600">Thương hiệu:</p>
                    <p className="font-semibold">{listing.brandName}</p>
                  </div>
                )}
                {listing.categoryName && (
                  <div>
                    <p className="text-gray-600">Loại xe:</p>
                    <p className="font-semibold">{listing.categoryName}</p>
                  </div>
                )}
                {listing.sizeLabel && (
                  <div>
                    <p className="text-gray-600">Kích cỡ:</p>
                    <p className="font-semibold">{listing.sizeLabel}</p>
                  </div>
                )}
                {listing.yearModel && (
                  <div>
                    <p className="text-gray-600">Năm sản xuất:</p>
                    <p className="font-semibold">{listing.yearModel}</p>
                  </div>
                )}
                {listing.conditionNote && (
                  <div>
                    <p className="text-gray-600">Tình trạng:</p>
                    <p className="font-semibold">{listing.conditionNote}</p>
                  </div>
                )}
                {listing.locationText && (
                  <div>
                    <p className="text-gray-600">Vị trí:</p>
                    <p className="font-semibold">{listing.locationText}</p>
                  </div>
                )}
              </div>

              {listing.description && (
                <div className="mt-4">
                  <p className="text-gray-600 mb-2">Mô tả:</p>
                  <p className="text-gray-800 whitespace-pre-wrap">{listing.description}</p>
                </div>
              )}

              {listing.usageHistory && (
                <div className="mt-4">
                  <p className="text-gray-600 mb-2">Lịch sử sử dụng:</p>
                  <p className="text-gray-800 whitespace-pre-wrap">{listing.usageHistory}</p>
                </div>
              )}
            </div>
          )}

          {/* Timeline */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Tiến trình</h2>
            <div className="space-y-3">
              <div
                className={
                  order.status !== "PLACED" ? "text-green-600" : "text-gray-400"
                }
              >
                ✓ Đã đặt hàng - {formatDateTime(order.createdAt)}
              </div>
              {order.depositRequired && (
                <div
                  className={
                    order.depositPaidAt ? "text-green-600" : "text-gray-400"
                  }
                >
                  {order.depositPaidAt ? "✓" : "○"} Đã thanh toán cọc
                  {order.depositPaidAt &&
                    ` - ${formatDateTime(order.depositPaidAt)}`}
                </div>
              )}
              <div
                className={
                  order.status === "SHIPPING" ||
                  order.status === "DELIVERED" ||
                  order.status === "COMPLETED"
                    ? "text-green-600"
                    : "text-gray-400"
                }
              >
                {order.status === "SHIPPING" ||
                order.status === "DELIVERED" ||
                order.status === "COMPLETED"
                  ? "✓"
                  : "○"}{" "}
                Đang giao hàng
              </div>
              <div
                className={
                  order.deliveredAt ? "text-green-600" : "text-gray-400"
                }
              >
                {order.deliveredAt ? "✓" : "○"} Đã giao hàng
                {order.deliveredAt &&
                  ` - ${formatDateTime(order.deliveredAt)}`}
              </div>
              <div
                className={
                  order.completedAt ? "text-green-600" : "text-gray-400"
                }
              >
                {order.completedAt ? "✓" : "○"} Hoàn thành
                {order.completedAt &&
                  ` - ${formatDateTime(order.completedAt)}`}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            {order.status === "DEPOSIT_PENDING" && (
              <button
                onClick={async () => {
                  try {
                    const { paymentUrl } = await orderService.payDeposit(
                      order.id,
                    );
                    window.location.href = paymentUrl;
                  } catch (error: any) {
                    message.error(error.message || "Lỗi khi tạo thanh toán");
                  }
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-lg"
              >
                💳 Thanh toán cọc ({order.depositAmount.toLocaleString()}{" "}
                {order.currency})
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
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold shadow-lg"
              >
                💳 Thanh toán toàn bộ ({order.priceAmount.toLocaleString()}{" "}
                {order.currency})
              </button>
            )}

            {order.status === "SHIPPING" && (
              <button
                onClick={() => handleUpdateStatus("DELIVERED")}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-lg"
              >
                ✅ Đã nhận hàng
              </button>
            )}

            {order.status === "DELIVERED" && order.depositRequired && order.depositPaidAt && 
             !order.payments?.some(p => p.type === "FULL" && p.status === "PAID") && (
              <button
                onClick={async () => {
                  try {
                    const { paymentUrl } = await orderService.payFull(order.id);
                    window.location.href = paymentUrl;
                  } catch (error: any) {
                    message.error(error.message || "Lỗi khi tạo thanh toán");
                  }
                }}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold shadow-lg"
              >
                💳 Thanh toán phần còn lại ({(order.priceAmount - order.depositAmount).toLocaleString()}{" "}
                {order.currency})
              </button>
            )}

            {order.status === "DELIVERED" && !order.depositRequired && (
              <button
                onClick={() => handleUpdateStatus("COMPLETED")}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                ✅ Xác nhận hoàn thành
              </button>
            )}

            {order.status === "COMPLETED" && (
              <button
                onClick={() => setShowReviewForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                ⭐ Đánh giá người bán
              </button>
            )}

            {(order.status === "CONFIRMED" ||
              order.status === "SHIPPING" ||
              order.status === "DELIVERED") && (
              <button
                onClick={() => setShowDisputeForm(true)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                ⚠️ Báo cáo vấn đề
              </button>
            )}
          </div>
        </div>

        {/* Review Form Modal */}
        {showReviewForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Đánh giá người bán</h2>
              <form onSubmit={handleSubmitReview}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">
                    Rating (1-5 sao):
                  </label>
                  <select
                    value={reviewData.rating}
                    onChange={(e) =>
                      setReviewData({
                        ...reviewData,
                        rating: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border rounded"
                    required
                  >
                    <option value={5}>5 ⭐⭐⭐⭐⭐</option>
                    <option value={4}>4 ⭐⭐⭐⭐</option>
                    <option value={3}>3 ⭐⭐⭐</option>
                    <option value={2}>2 ⭐⭐</option>
                    <option value={1}>1 ⭐</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Nhận xét:</label>
                  <textarea
                    value={reviewData.comment}
                    onChange={(e) =>
                      setReviewData({ ...reviewData, comment: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded"
                    rows={4}
                    placeholder="Chia sẻ trải nghiệm của bạn..."
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Gửi đánh giá
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="flex-1 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Dispute Form Modal */}
        <Modal
          title="⚠️ Báo cáo vấn đề"
          open={showDisputeForm}
          onOk={handleSubmitDispute}
          onCancel={() => {
            setShowDisputeForm(false);
            setDisputeData({ ...disputeData, summary: "" });
          }}
          okText="Gửi báo cáo"
          cancelText="Hủy"
          okButtonProps={{ danger: true }}
          width={600}
        >
          <div className="py-4">
            <label className="block text-gray-700 font-medium mb-2">
              Mô tả vấn đề:
            </label>
            <TextArea
              value={disputeData.summary}
              onChange={(e) =>
                setDisputeData({
                  ...disputeData,
                  summary: e.target.value,
                })
              }
              rows={6}
              placeholder="Mô tả chi tiết vấn đề bạn gặp phải với đơn hàng này..."
              showCount
              maxLength={1000}
            />
            <p className="text-sm text-gray-500 mt-2">
              💡 Vui lòng mô tả chi tiết vấn đề để chúng tôi có thể hỗ trợ bạn tốt hơn.
            </p>
          </div>
        </Modal>
      </div>
    </MainLayout>
  );
}
