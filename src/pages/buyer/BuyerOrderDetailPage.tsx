import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "../../layouts/MainLayout";
import { orderService } from "../../services/order";
import { reviewService } from "../../services/review";
import type { CreateReviewRequest } from "../../services/review";
import { disputeService } from "../../services/dispute";
import type { CreateDisputeRequest } from "../../services/dispute";
import type { Order } from "../../types";
import toast from "react-hot-toast";

export default function BuyerOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
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
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi tải order");
      navigate("/buyer/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    if (!order) return;
    try {
      await orderService.updateStatus(order.id, status as any);
      toast.success("Cập nhật trạng thái thành công");
      await loadOrder();
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi cập nhật trạng thái");
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await reviewService.create(reviewData);
      toast.success("Đánh giá thành công");
      setShowReviewForm(false);
      await loadOrder();
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi đánh giá");
    }
  };

  const handleSubmitDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await disputeService.create(disputeData);
      toast.success("Tạo dispute thành công");
      setShowDisputeForm(false);
      await loadOrder();
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi tạo dispute");
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
          onClick={() => navigate("/buyer/dashboard")}
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

          {/* Timeline */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Tiến trình</h2>
            <div className="space-y-3">
              <div
                className={
                  order.status !== "PLACED" ? "text-green-600" : "text-gray-400"
                }
              >
                ✓ Đã đặt hàng - {new Date(order.createdAt).toLocaleString()}
              </div>
              {order.depositRequired && (
                <div
                  className={
                    order.depositPaidAt ? "text-green-600" : "text-gray-400"
                  }
                >
                  {order.depositPaidAt ? "✓" : "○"} Đã thanh toán cọc
                  {order.depositPaidAt &&
                    ` - ${new Date(order.depositPaidAt).toLocaleString()}`}
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
                  ` - ${new Date(order.deliveredAt).toLocaleString()}`}
              </div>
              <div
                className={
                  order.completedAt ? "text-green-600" : "text-gray-400"
                }
              >
                {order.completedAt ? "✓" : "○"} Hoàn thành
                {order.completedAt &&
                  ` - ${new Date(order.completedAt).toLocaleString()}`}
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
                    toast.error(error.message || "Lỗi khi tạo thanh toán");
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
                    toast.error(error.message || "Lỗi khi tạo thanh toán");
                  }
                }}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold shadow-lg"
              >
                💳 Thanh toán toàn bộ ({order.priceAmount.toLocaleString()}{" "}
                {order.currency})
              </button>
            )}

            {order.status === "DELIVERED" && (
              <button
                onClick={() => handleUpdateStatus("COMPLETED")}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Xác nhận hoàn thành
              </button>
            )}

            {order.status === "COMPLETED" && (
              <button
                onClick={() => setShowReviewForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Đánh giá người bán
              </button>
            )}

            {(order.status === "CONFIRMED" ||
              order.status === "SHIPPING" ||
              order.status === "DELIVERED") && (
              <button
                onClick={() => setShowDisputeForm(true)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Báo cáo vấn đề
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
        {showDisputeForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Báo cáo vấn đề</h2>
              <form onSubmit={handleSubmitDispute}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">
                    Mô tả vấn đề:
                  </label>
                  <textarea
                    value={disputeData.summary}
                    onChange={(e) =>
                      setDisputeData({
                        ...disputeData,
                        summary: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded"
                    rows={4}
                    placeholder="Mô tả chi tiết vấn đề bạn gặp phải..."
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Gửi báo cáo
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDisputeForm(false)}
                    className="flex-1 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
