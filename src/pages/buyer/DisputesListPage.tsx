import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../../layouts/MainLayout';
import { disputeService } from '../../services/dispute';
import type { Dispute } from '../../services/dispute';
import toast from 'react-hot-toast';
import { formatDateTime } from '../../utils/format';

export default function DisputesListPage() {
  const navigate = useNavigate();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDisputes();
  }, []);

  const loadDisputes = async () => {
    try {
      setLoading(true);
      const data = await disputeService.getMyDisputes();
      setDisputes(data);
    } catch (error: any) {
      toast.error(error.message || 'Lỗi khi tải disputes');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'text-red-600';
      case 'ASSIGNED':
        return 'text-yellow-600';
      case 'IN_PROGRESS':
        return 'text-blue-600';
      case 'RESOLVED':
        return 'text-green-600';
      case 'CLOSED':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
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

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Danh sách Disputes</h1>

      {disputes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">Chưa có dispute nào</p>
        </div>
      ) : (
        <div className="space-y-4">
          {disputes.map(dispute => (
            <div
              key={dispute.id}
              className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition"
              onClick={() => navigate(`/buyer/disputes/${dispute.id}`)}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2">Dispute #{dispute.id}</h3>
                  <p className="text-gray-600">Order #{dispute.orderId}</p>
                </div>
                <span className={`font-semibold ${getStatusColor(dispute.status)}`}>
                  {dispute.status}
                </span>
              </div>
              <p className="text-gray-800 mb-4">{dispute.summary}</p>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <p>Người tạo: {dispute.openedByName}</p>
                  <p>Thời gian: {formatDateTime(dispute.createdAt)}</p>
                </div>
                {dispute.assignedInspectorName && (
                  <div>
                    <p>Inspector: {dispute.assignedInspectorName}</p>
                  </div>
                )}
                {dispute.resolvedAt && (
                  <div className="col-span-2">
                    <p className="text-green-600">Đã giải quyết: {formatDateTime(dispute.resolvedAt)}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    </MainLayout>
  );
}
