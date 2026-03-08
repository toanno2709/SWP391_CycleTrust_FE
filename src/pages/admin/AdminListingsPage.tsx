import { useState, useEffect } from 'react';
import { Table, Tag, Button, Modal, Input, message, Tabs, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, EyeOutlined, MoreOutlined } from '@ant-design/icons';
import { listingService } from '../../services/listing';
import type { Listing, ListingStatus } from '../../types';
import { formatCurrency, formatDateTime } from '../../utils/format';
import { LISTING_STATUS_LABELS } from '../../config/constants';

const { TextArea } = Input;
const { TabPane } = Tabs;

export const AdminListingsPage = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('ALL');

  const fetchListings = async (status?: ListingStatus) => {
    setLoading(true);
    try {
      const data = await listingService.getAll({ status });
      setListings(data);
    } catch (error) {
      message.error('Không thể tải danh sách listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const status = activeTab === 'ALL' ? undefined : (activeTab as ListingStatus);
    fetchListings(status);
  }, [activeTab]);

  const handleApprove = async (listing: Listing) => {
    Modal.confirm({
      title: 'Xác nhận duyệt listing',
      content: `Bạn có chắc muốn duyệt listing "${listing.title}"?`,
      okText: 'Duyệt',
      cancelText: 'Hủy',
      onOk: async () => {
        setActionLoading(true);
        try {
          await listingService.approve(listing.id);
          message.success('Đã duyệt listing thành công');
          const status = activeTab === 'ALL' ? undefined : (activeTab as ListingStatus);
          fetchListings(status);
        } catch (error: any) {
          message.error(error.message || 'Duyệt listing thất bại');
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  const handleReject = (listing: Listing) => {
    setSelectedListing(listing);
    setRejectReason('');
    setRejectModalOpen(true);
  };

  const confirmReject = async () => {
    if (!selectedListing || !rejectReason.trim()) {
      message.warning('Vui lòng nhập lý do từ chối');
      return;
    }

    setActionLoading(true);
    try {
      await listingService.reject(selectedListing.id, rejectReason);
      message.success('Đã từ chối listing');
      setRejectModalOpen(false);
      setSelectedListing(null);
      setRejectReason('');
      const status = activeTab === 'ALL' ? undefined : (activeTab as ListingStatus);
      fetchListings(status);
    } catch (error: any) {
      message.error(error.message || 'Từ chối listing thất bại');
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    {
      title: 'Ảnh',
      dataIndex: 'media',
      key: 'media',
      width: 100,
      render: (media: any[]) => (
        <img
          src={media?.[0]?.url || 'https://via.placeholder.com/80'}
          alt="listing"
          className="w-20 h-20 object-cover rounded-lg"
        />
      ),
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: Listing) => (
        <div>
          <div className="font-semibold">{text}</div>
          <div className="text-xs text-slate-500">
            {record.brand?.name} • {record.category?.name}
          </div>
        </div>
      ),
    },
    {
      title: 'Người bán',
      dataIndex: 'seller',
      key: 'seller',
      render: (seller: any) => (
        <div>
          <div>{seller?.fullName}</div>
          <div className="text-xs text-slate-500">{seller?.email || seller?.phone}</div>
        </div>
      ),
    },
    {
      title: 'Giá',
      dataIndex: 'priceAmount',
      key: 'priceAmount',
      render: (price: number, record: Listing) => (
        <span className="font-semibold text-green-600">
          {formatCurrency(price, record.currency)}
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: ListingStatus) => {
        const colors: Record<string, string> = {
          PENDING_APPROVAL: 'warning',
          APPROVED: 'success',
          REJECTED: 'error',
          VERIFIED: 'success',
          SOLD: 'default',
        };
        return <Tag color={colors[status] || 'default'}>{LISTING_STATUS_LABELS[status]}</Tag>;
      },
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => formatDateTime(date),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 80,
      render: (_: any, record: Listing) => {
        const menuItems: MenuProps['items'] = [
          {
            key: 'view',
            label: 'Xem chi tiết',
            icon: <EyeOutlined />,
            onClick: () => window.open(`/listings/${record.id}`, '_blank')
          },
        ];

        if (record.status === 'PENDING_APPROVAL') {
          menuItems.push(
            {
              key: 'approve',
              label: 'Duyệt',
              icon: <CheckCircleOutlined />,
              onClick: () => handleApprove(record)
            },
            {
              key: 'reject',
              label: 'Từ chối',
              icon: <CloseCircleOutlined />,
              danger: true,
              onClick: () => handleReject(record)
            }
          );
        }

        return (
          <Dropdown menu={{ items: menuItems }} trigger={['click']}>
            <Button type="text" icon={<MoreOutlined />} loading={actionLoading} />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Quản lý Listings</h1>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Tất cả" key="ALL" />
        <TabPane tab="Chờ duyệt" key="PENDING_APPROVAL" />
        <TabPane tab="Đã duyệt" key="APPROVED" />
        <TabPane tab="Đã xác thực" key="VERIFIED" />
        <TabPane tab="Đã từ chối" key="REJECTED" />
        <TabPane tab="Đã bán" key="SOLD" />
      </Tabs>

      <Table
        columns={columns}
        dataSource={listings}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title="Từ chối listing"
        open={rejectModalOpen}
        onOk={confirmReject}
        onCancel={() => {
          setRejectModalOpen(false);
          setSelectedListing(null);
          setRejectReason('');
        }}
        confirmLoading={actionLoading}
        okText="Xác nhận từ chối"
        cancelText="Hủy"
      >
        <div className="space-y-4">
          <p>
            Listing: <strong>{selectedListing?.title}</strong>
          </p>
          <TextArea
            rows={4}
            placeholder="Nhập lý do từ chối..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
};
