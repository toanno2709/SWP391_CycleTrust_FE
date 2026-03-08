import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { MainLayout } from '../../layouts/MainLayout';
import { disputeService } from '../../services/dispute';
import type { Dispute } from '../../services/dispute';
import { useAuthStore } from '../../store/auth';
import { UserRole } from '../../types';

const DisputeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [dispute, setDispute] = useState<Dispute | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [assigneeId, setAssigneeId] = useState('');
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [resolution, setResolution] = useState('');
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
      toast.error(error.response?.data?.message || 'Không thể tải thông tin tranh chấp');
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
      toast.success('Đã thêm bình luận');
      setComment('');
      await fetchDispute();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể thêm bình luận');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigneeId || !id) return;

    try {
      setSubmitting(true);
      await disputeService.assign(Number(id), { inspectorId: Number(assigneeId) });
      toast.success('Đã phân công xử lý');
      setShowAssignForm(false);
      setAssigneeId('');
      await fetchDispute();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể phân công');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolution.trim() || !id) return;

    try {
      setSubmitting(true);
      await disputeService.resolve(Number(id), { resolution: resolution.trim() });
      toast.success('Đã giải quyết tranh chấp');
      setShowResolveForm(false);
      setResolution('');
      await fetchDispute();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể giải quyết');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-red-100 text-red-800';
      case 'ASSIGNED':
        return 'bg-yellow-100 text-yellow-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'RESOLVED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'Mới mở';
      case 'ASSIGNED':
        return 'Đã phân công';
      case 'IN_PROGRESS':
        return 'Đang xử lý';
      case 'RESOLVED':
        return 'Đã giải quyết';
      default:
        return status;
    }
  };

  const canAddComment = user && dispute && dispute.status !== 'RESOLVED';
  const canAssign = user?.role === UserRole.ADMIN && dispute?.status === 'OPEN';
  const canResolve = 
    (user?.role === UserRole.ADMIN || user?.role === UserRole.INSPECTOR) &&
    dispute?.status === 'IN_PROGRESS';

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-xl">Đang tải...</div>
        </div>
      </MainLayout>
    );
  }

  if (!dispute) {
    return null;
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-blue-600 hover:text-blue-800 flex items-center"
        >
          ← Quay lại
        </button>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Tranh chấp #{dispute.id}</h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(dispute.status)}`}>
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
              <span className="ml-2">{new Date(dispute.createdAt).toLocaleString('vi-VN')}</span>
            </div>
            {dispute.assignedInspectorName && (
              <div>
                <span className="text-gray-600">Người xử lý:</span>
                <span className="ml-2 font-medium">{dispute.assignedInspectorName}</span>
              </div>
            )}
            {dispute.assignedAdminName && (
              <div>
                <span className="text-gray-600">Người xử lý (Admin):</span>
                <span className="ml-2 font-medium">{dispute.assignedAdminName}</span>
              </div>
            )}
            {dispute.resolvedAt && (
              <div>
                <span className="text-gray-600">Thời gian giải quyết:</span>
                <span className="ml-2">{new Date(dispute.resolvedAt).toLocaleString('vi-VN')}</span>
              </div>
            )}
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Nội dung tranh chấp</h2>
            <div className="bg-gray-50 p-4 rounded border">
              <p className="text-gray-800 whitespace-pre-wrap">{dispute.summary}</p>
            </div>
          </div>

          {dispute.resolution && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-2 text-green-700">Kết quả giải quyết</h2>
              <div className="bg-green-50 p-4 rounded border border-green-200">
                <p className="text-gray-800 whitespace-pre-wrap">{dispute.resolution}</p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {(canAssign || canResolve) && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Hành động</h2>
            <div className="flex gap-3">
              {canAssign && (
                <button
                  onClick={() => setShowAssignForm(!showAssignForm)}
                  className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                >
                  Phân công xử lý
                </button>
              )}
              {canResolve && (
                <button
                  onClick={() => setShowResolveForm(!showResolveForm)}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Giải quyết tranh chấp
                </button>
              )}
            </div>

            {/* Assign Form */}
            {showAssignForm && (
              <form onSubmit={handleAssign} className="mt-4 p-4 bg-yellow-50 rounded border">
                <label className="block text-sm font-medium mb-2">
                  ID người xử lý (Inspector/Admin):
                </label>
                <input
                  type="number"
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="w-full px-3 py-2 border rounded mb-3"
                  placeholder="Nhập user ID"
                  required
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
                  >
                    {submitting ? 'Đang xử lý...' : 'Xác nhận phân công'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAssignForm(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            )}

            {/* Resolve Form */}
            {showResolveForm && (
              <form onSubmit={handleResolve} className="mt-4 p-4 bg-green-50 rounded border">
                <label className="block text-sm font-medium mb-2">
                  Kết quả giải quyết:
                </label>
                <textarea
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  className="w-full px-3 py-2 border rounded mb-3"
                  rows={4}
                  placeholder="Nhập kết quả giải quyết..."
                  required
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    {submitting ? 'Đang xử lý...' : 'Xác nhận giải quyết'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowResolveForm(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Events Timeline */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Lịch sử hoạt động</h2>
          {dispute.events && dispute.events.length > 0 ? (
            <div className="space-y-4">
              {dispute.events.map((event) => (
                <div key={event.id} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-blue-700">{event.actorName}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(event.createdAt).toLocaleString('vi-VN')}
                        </span>
                      </div>
                      {event.message && (
                        <p className="text-gray-700 whitespace-pre-wrap">{event.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Chưa có hoạt động nào</p>
          )}
        </div>

        {/* Add Comment Form */}
        {canAddComment && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Thêm bình luận</h2>
            <form onSubmit={handleAddComment}>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-3 py-2 border rounded mb-3"
                rows={4}
                placeholder="Nhập bình luận của bạn..."
                required
              />
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? 'Đang gửi...' : 'Gửi bình luận'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
    </MainLayout>
  );
};

export default DisputeDetailPage;
