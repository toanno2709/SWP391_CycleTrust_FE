import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Carousel, Image } from "antd";
import { MainLayout } from "../../layouts/MainLayout";
import { orderService } from "../../services/order";
import { listingService } from "../../services/listing";
import type { Order, Listing } from "../../types";
import toast from "react-hot-toast";
import { formatDateTime } from "../../utils/format";

export default function SellerOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const data = await orderService.getById(Number(id));
      setOrder(data);
      
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
      toast.error(error.message || "Lỗi khi tải order");
      navigate("/seller/dashboard");
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Đang tải...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Không tìm thấy order</div>
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto p-6">
        <button
          onClick={() => navigate("/seller/dashboard")}
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
              <p className="text-gray-600">Người mua:</p>
              <p className="font-semibold">{order.buyerName}</p>
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
            {order.shippingNote && (
              <div className="col-span-2">
                <p className="text-gray-600">Ghi chú giao hàng:</p>
                <p className="font-semibold">{order.shippingNote}</p>
              </div>
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
              <div className="text-green-600">
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

          {/* Actions for Seller */}
          <div className="flex flex-wrap gap-3">
            {(order.status === "CONFIRMED" || order.status === "DEPOSIT_PAID") && (
              <button
                onClick={() => handleUpdateStatus("SHIPPING")}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                🚚 Xác nhận và gửi hàng
              </button>
            )}
          </div>

          {/* Payment Info */}
          {order.payments && order.payments.length > 0 && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-4">Lịch sử thanh toán</h2>
              <div className="space-y-2">
                {order.payments.map((payment, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded"
                  >
                    <div>
                      <p className="font-semibold">{payment.type}</p>
                      <p className="text-sm text-gray-600">
                        {formatDateTime(payment.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">
                        {payment.amount.toLocaleString()} VND
                      </p>
                      <p
                        className={`text-sm ${payment.status === "PAID" ? "text-green-600" : "text-yellow-600"}`}
                      >
                        {payment.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
