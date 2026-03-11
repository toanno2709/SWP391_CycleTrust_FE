import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Modal, Input, Button } from "antd";
import { disputeService } from "../../services/dispute";
import type { Dispute } from "../../services/dispute";
import { useAuthStore } from "../../store/auth";
import { UserRole } from "../../types";
import { formatDateTime } from "../../utils/format";

const { TextArea } = Input;

const DisputeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [dispute, setDispute] = useState<Dispute | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [assigneeId, setAssigneeId] = useState("");
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [resolution, setResolution] = useState("");
  const [showResolveForm, setShowResolveForm] = useState(false);

  useEffect(() => {
    fetchDispute();
  }, [id]);

  const fetchDispute = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const data = await disputeService.getById(Number(id));
      setDispute(data);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Không thể tải thông tin tranh chấp",
      );
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || !id) return;

    try {
      setSubmitting(true);
      await disputeService.addEvent(Number(id), { message: comment.trim() });
      toast.success("Đã thêm bình luận");
      setComment("");
      await fetchDispute();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể thêm bình luận");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssign = async () => {
    if (!assigneeId || !id) return;

    try {
      setSubmitting(true);
      await disputeService.assign(Number(id), {
        inspectorId: Number(assigneeId),
      });
      toast.success("Đã phân công xử lý");
      setShowAssignForm(false);
      setAssigneeId("");
      await fetchDispute();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể phân công");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolve = async () => {
    if (!resolution.trim() || !id) return;

    try {
      setSubmitting(true);
      await disputeService.resolve(Number(id), {
        resolution: resolution.trim(),
      });
      toast.success("Đã giải quyết tranh chấp");
      setShowResolveForm(false);
      setResolution("");
      await fetchDispute();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể giải quyết");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPEN":
        return "bg-red-100 text-red-800";
      case "ASSIGNED":
        return "bg-yellow-100 text-yellow-800";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800";
      case "RESOLVED":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "OPEN":
        return "Mới mở";
      case "ASSIGNED":
        return "Đã phân công";
      case "IN_PROGRESS":
        return "Đang xử lý";
      case "RESOLVED":
        return "Đã giải quyết";
      default:
        return status;
    }
  };

  const canAddComment = user && dispute && dispute.status !== "RESOLVED";
  const canAssign = user?.role === UserRole.ADMIN && dispute?.status === "OPEN";
  const canResolve =
    (user?.role === UserRole.ADMIN || user?.role === UserRole.INSPECTOR) &&
    dispute?.status === "IN_PROGRESS";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Đang tải...</div>
      </div>
    );
  }

  if (!dispute) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-blue-600 hover:text-blue-800 flex items-center"
        >
          ← Quay lại
        </button>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Tranh chấp #{dispute.id}</h1>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(dispute.status)}`}
            >
              {getStatusText(dispute.status)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Đơn hàng:</span>
              <span className="ml-2 font-medium">#{dispute.orderId}</span>
            </div>
            <div>
              <span className="text-gray-600">Người mở:</span>
              <span className="ml-2 font-medium">{dispute.openedByName}</span>
            </div>
            <div>
              <span className="text-gray-600">Thời gian tạo:</span>
              <span className="ml-2">{formatDateTime(dispute.createdAt)}</span>
            </div>
            {dispute.assignedInspectorName && (
              <div>
                <span className="text-gray-600">Người xử lý:</span>
                <span className="ml-2 font-medium">
                  {dispute.assignedInspectorName}
                </span>
              </div>
            )}
            {dispute.assignedAdminName && (
              <div>
                <span className="text-gray-600">Người xử lý (Admin):</span>
                <span className="ml-2 font-medium">
                  {dispute.assignedAdminName}
                </span>
              </div>
            )}
            {dispute.resolvedAt && (
              <div>
                <span className="text-gray-600">Thời gian giải quyết:</span>
                <span className="ml-2">
                  {formatDateTime(dispute.resolvedAt)}
                </span>
              </div>
            )}
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Nội dung tranh chấp</h2>
            <div className="bg-gray-50 p-4 rounded border">
              <p className="text-gray-800 whitespace-pre-wrap">
                {dispute.summary}
              </p>
            </div>
          </div>

          {dispute.resolution && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-2 text-green-700">
                Kết quả giải quyết
              </h2>
              <div className="bg-green-50 p-4 rounded border border-green-200">
                <p className="text-gray-800 whitespace-pre-wrap">
                  {dispute.resolution}
                </p>
              </div>
            </div>
          )}
        </div>

        {(canAssign || canResolve) && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Hành động</h2>
            <div className="flex gap-3">
              {canAssign && (
                <Button
                  type="primary"
                  style={{ backgroundColor: "#ca8a04" }}
                  onClick={() => setShowAssignForm(true)}
                >
                  Phân công xử lý
                </Button>
              )}
              {canResolve && (
                <Button
                  type="primary"
                  style={{ backgroundColor: "#16a34a" }}
                  onClick={() => setShowResolveForm(true)}
                >
                  Giải quyết tranh chấp
                </Button>
              )}
            </div>
          </div>
        )}

        <Modal
          title="Phân công xử lý tranh chấp"
          open={showAssignForm}
          onOk={handleAssign}
          onCancel={() => {
            setShowAssignForm(false);
            setAssigneeId("");
          }}
          okText="Xác nhận"
          cancelText="Hủy"
          confirmLoading={submitting}
        >
          <div className="py-4">
            <label className="block text-sm font-medium mb-2">
              ID người xử lý (Inspector/Admin):
            </label>
            <Input
              type="number"
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              placeholder="Nhập user ID"
              required
            />
          </div>
        </Modal>

        <Modal
          title="Giải quyết tranh chấp"
          open={showResolveForm}
          onOk={handleResolve}
          onCancel={() => {
            setShowResolveForm(false);
            setResolution("");
          }}
          okText="Xác nhận giải quyết"
          cancelText="Hủy"
          confirmLoading={submitting}
          okButtonProps={{
            danger: false,
            style: { backgroundColor: "#16a34a" },
          }}
          width={600}
        >
          <div className="py-4">
            <label className="block text-sm font-medium mb-2">
              Kết quả giải quyết:
            </label>
            <TextArea
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              rows={6}
              placeholder="Nhập kết quả giải quyết chi tiết..."
              showCount
              maxLength={1000}
            />
          </div>
        </Modal>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Lịch sử hoạt động</h2>
          {dispute.events && dispute.events.length > 0 ? (
            <div className="space-y-4">
              {dispute.events.map((event) => (
                <div
                  key={event.id}
                  className="border-l-4 border-blue-500 pl-4 py-2"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-blue-700">
                          {event.actorName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDateTime(event.createdAt)}
                        </span>
                      </div>
                      {event.message && (
                        <p className="text-gray-700 whitespace-pre-wrap">
                          {event.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              Chưa có hoạt động nào
            </p>
          )}
        </div>

        {canAddComment && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Thêm bình luận</h2>
            <form onSubmit={handleAddComment}>
              <TextArea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                placeholder="Nhập bình luận của bạn..."
                showCount
                maxLength={500}
                className="mb-3"
              />
              <Button
                type="primary"
                htmlType="submit"
                loading={submitting}
                size="large"
              >
                Gửi bình luận
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default DisputeDetailPage;
