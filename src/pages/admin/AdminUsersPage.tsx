import { useState, useEffect } from 'react';
import { userService } from '../../services/user';
import type { User } from '../../types';
import { UserRole } from '../../types';
import { Table, Button, Modal, Form, Input, Select, Tag, Space, message, Tabs, Dropdown } from 'antd';
import type { TabsProps, MenuProps } from 'antd';
import { 
  UserOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined
} from '@ant-design/icons';
import { formatDateTime } from '../../utils/format';

const { Option } = Select;

export const AdminUsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [pendingSellers, setPendingSellers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  useEffect(() => {
    fetchUsers();
    fetchPendingSellers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await userService.getAll({ limit: 1000 });
      setUsers(response.users);
    } catch (error: any) {
      message.error(error.message || 'Không thể tải danh sách users');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingSellers = async () => {
    try {
      const pending = await userService.getPendingSellers();
      setPendingSellers(pending);
    } catch (error) {
      // Ignore error if no pending sellers
    }
  };

  const handleCreateUser = async (values: any) => {
    try {
      await userService.create({
        email: values.email || undefined,
        phone: values.phone || undefined,
        password: values.password,
        fullName: values.fullName,
        role: values.role,
      });
      message.success('Tạo user thành công!');
      setCreateModalOpen(false);
      form.resetFields();
      fetchUsers();
    } catch (error: any) {
      message.error(error.message || 'Tạo user thất bại');
    }
  };

  const handleUpdateUser = async (values: any) => {
    if (!selectedUser) return;
    try {
      await userService.update(selectedUser.id, {
        email: values.email || undefined,
        phone: values.phone || undefined,
        fullName: values.fullName,
        role: values.role,
        isActive: values.isActive,
      });
      message.success('Cập nhật user thành công!');
      setEditModalOpen(false);
      setSelectedUser(null);
      editForm.resetFields();
      fetchUsers();
    } catch (error: any) {
      message.error(error.message || 'Cập nhật user thất bại');
    }
  };

  const handleDeleteUser = (user: User) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: `Bạn có chắc chắn muốn xóa user "${user.fullName}"?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await userService.delete(user.id);
          message.success('Xóa user thành công!');
          fetchUsers();
        } catch (error: any) {
          message.error(error.message || 'Xóa user thất bại');
        }
      },
    });
  };

  const handleApproveSeller = async (user: User) => {
    try {
      await userService.approveSeller(user.id);
      message.success(`Đã phê duyệt seller "${user.fullName}"!`);
      fetchUsers();
      fetchPendingSellers();
    } catch (error: any) {
      message.error(error.message || 'Phê duyệt thất bại');
    }
  };

  const handleRejectSeller = (user: User) => {
    Modal.confirm({
      title: 'Từ chối seller',
      content: `Bạn có chắc chắn muốn từ chối seller "${user.fullName}"?`,
      okText: 'Từ chối',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await userService.rejectSeller(user.id);
          message.success('Đã từ chối seller!');
          fetchUsers();
          fetchPendingSellers();
        } catch (error: any) {
          message.error(error.message || 'Từ chối thất bại');
        }
      },
    });
  };

  const handleToggleActive = async (user: User) => {
    try {
      await userService.toggleActive(user.id);
      message.success(`Đã ${user.isActive ? 'vô hiệu hóa' : 'kích hoạt'} user!`);
      fetchUsers();
    } catch (error: any) {
      message.error(error.message || 'Cập nhật trạng thái thất bại');
    }
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    editForm.setFieldsValue({
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
    });
    setEditModalOpen(true);
  };

  const getRoleBadge = (role: UserRole) => {
    const colors: Record<UserRole, string> = {
      ADMIN: 'red',
      SELLER: 'blue',
      BUYER: 'green',
      INSPECTOR: 'orange',
    };
    return <Tag color={colors[role]}>{role}</Tag>;
  };

  const getApprovalBadge = (status?: string) => {
    if (!status) return null;
    const colors: Record<string, string> = {
      PENDING: 'gold',
      APPROVED: 'green',
      REJECTED: 'red',
    };
    return <Tag color={colors[status]}>{status}</Tag>;
  };

  const userColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 70,
    },
    {
      title: 'Họ tên',
      dataIndex: 'fullName',
      key: 'fullName',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: UserRole) => getRoleBadge(role),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_: any, record: User) => (
        <Space>
          <Tag color={record.isActive ? 'green' : 'red'}>
            {record.isActive ? 'Hoạt động' : 'Vô hiệu'}
          </Tag>
          {record.approvalStatus && getApprovalBadge(record.approvalStatus)}
        </Space>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => formatDateTime(date),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 80,
      render: (_: any, record: User) => {
        const menuItems: MenuProps['items'] = [
          {
            key: 'edit',
            label: 'Sửa thông tin',
            icon: <EditOutlined />,
            onClick: () => openEditModal(record)
          },
          {
            key: 'toggle',
            label: record.isActive ? 'Vô hiệu' : 'Kích hoạt',
            icon: record.isActive ? <CloseCircleOutlined /> : <CheckCircleOutlined />,
            onClick: () => handleToggleActive(record)
          },
          {
            key: 'delete',
            label: 'Xóa',
            icon: <DeleteOutlined />,
            danger: true,
            onClick: () => handleDeleteUser(record)
          },
        ];

        return (
          <Dropdown menu={{ items: menuItems }} trigger={['click']}>
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        );
      },
    },
  ];

  const pendingSellerColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 70,
    },
    {
      title: 'Họ tên',
      dataIndex: 'fullName',
      key: 'fullName',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Ngày đăng ký',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => formatDateTime(date),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 120,
      render: (_: any, record: User) => {
        const menuItems: MenuProps['items'] = [
          {
            key: 'approve',
            label: 'Phê duyệt',
            icon: <CheckCircleOutlined />,
            onClick: () => handleApproveSeller(record)
          },
          {
            key: 'reject',
            label: 'Từ chối',
            icon: <CloseCircleOutlined />,
            danger: true,
            onClick: () => handleRejectSeller(record)
          },
        ];

        return (
          <Dropdown menu={{ items: menuItems }} trigger={['click']}>
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        );
      },
    },
  ];

  const tabItems: TabsProps['items'] = [
    {
      key: 'all',
      label: `Tất cả Users (${users.length})`,
      children: (
        <Table
          columns={userColumns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 20 }}
        />
      ),
    },
    {
      key: 'pending',
      label: (
        <span>
          Chờ duyệt Seller{' '}
          {pendingSellers.length > 0 && (
            <Tag color="orange">{pendingSellers.length}</Tag>
          )}
        </span>
      ),
      children: (
        <Table
          columns={pendingSellerColumns}
          dataSource={pendingSellers}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 20 }}
        />
      ),
    },
  ];

  return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Quản lý Users</h1>
            <p className="text-slate-600">
              Quản lý tài khoản người dùng và phê duyệt seller
            </p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={() => setCreateModalOpen(true)}
          >
            Tạo User mới
          </Button>
        </div>

        <Tabs items={tabItems} />

        {/* Create User Modal */}
        <Modal
          title="Tạo User mới"
          open={createModalOpen}
          onCancel={() => {
            setCreateModalOpen(false);
            form.resetFields();
          }}
          footer={null}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleCreateUser}
          >
            <Form.Item
              label="Họ và tên"
              name="fullName"
              rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Nguyễn Văn A" />
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
            >
              <Input type="email" placeholder="example@email.com" />
            </Form.Item>

            <Form.Item
              label="Số điện thoại"
              name="phone"
            >
              <Input placeholder="0123456789" />
            </Form.Item>

            <Form.Item
              label="Mật khẩu"
              name="password"
              rules={[
                { required: true, message: 'Vui lòng nhập mật khẩu' },
                { min: 6, message: 'Mật khẩu tối thiểu 6 ký tự' },
              ]}
            >
              <Input.Password placeholder="Mật khẩu" />
            </Form.Item>

            <Form.Item
              label="Role"
              name="role"
              rules={[{ required: true, message: 'Vui lòng chọn role' }]}
              initialValue={UserRole.BUYER}
            >
              <Select>
                <Option value={UserRole.BUYER}>Buyer (Người mua)</Option>
                <Option value={UserRole.SELLER}>Seller (Người bán)</Option>
                <Option value={UserRole.INSPECTOR}>Inspector (Kiểm định viên)</Option>
                <Option value={UserRole.ADMIN}>Admin (Quản trị viên)</Option>
              </Select>
            </Form.Item>

            <Form.Item className="mb-0">
              <Space className="w-full justify-end">
                <Button onClick={() => setCreateModalOpen(false)}>
                  Hủy
                </Button>
                <Button type="primary" htmlType="submit">
                  Tạo User
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* Edit User Modal */}
        <Modal
          title="Chỉnh sửa User"
          open={editModalOpen}
          onCancel={() => {
            setEditModalOpen(false);
            setSelectedUser(null);
            editForm.resetFields();
          }}
          footer={null}
          width={600}
        >
          <Form
            form={editForm}
            layout="vertical"
            onFinish={handleUpdateUser}
          >
            <Form.Item
              label="Họ và tên"
              name="fullName"
              rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
            >
              <Input prefix={<UserOutlined />} />
            </Form.Item>

            <Form.Item label="Email" name="email">
              <Input type="email" />
            </Form.Item>

            <Form.Item label="Số điện thoại" name="phone">
              <Input />
            </Form.Item>

            <Form.Item
              label="Role"
              name="role"
              rules={[{ required: true, message: 'Vui lòng chọn role' }]}
            >
              <Select>
                <Option value={UserRole.BUYER}>Buyer (Người mua)</Option>
                <Option value={UserRole.SELLER}>Seller (Người bán)</Option>
                <Option value={UserRole.INSPECTOR}>Inspector (Kiểm định viên)</Option>
                <Option value={UserRole.ADMIN}>Admin (Quản trị viên)</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Trạng thái"
              name="isActive"
              valuePropName="checked"
            >
              <Select>
                <Option value={true}>Hoạt động</Option>
                <Option value={false}>Vô hiệu hóa</Option>
              </Select>
            </Form.Item>

            <Form.Item className="mb-0">
              <Space className="w-full justify-end">
                <Button onClick={() => setEditModalOpen(false)}>
                  Hủy
                </Button>
                <Button type="primary" htmlType="submit">
                  Cập nhật
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
  );
};
