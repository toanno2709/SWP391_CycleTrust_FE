import { useState, useEffect } from 'react';
import { Table, Button, Card, Tag, Modal, Form, Input, Select, InputNumber, Space, Row, Col, Statistic, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { PlusOutlined, EditOutlined, MoreOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { depositPolicyService } from '../../services/depositPolicy';
import type { DepositPolicy, CreateDepositPolicyRequest } from '../../services/depositPolicy';
import toast from 'react-hot-toast';

const { TextArea } = Input;
const { Option } = Select;

export default function AdminDepositPolicyPage() {
  const [policies, setPolicies] = useState<DepositPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadPolicies();
  }, []);

  const loadPolicies = async () => {
    try {
      setLoading(true);
      const data = await depositPolicyService.getAll();
      setPolicies(data);
    } catch (error: any) {
      toast.error(error.message || 'Lỗi khi tải policies');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: CreateDepositPolicyRequest) => {
    try {
      if (editingId) {
        await depositPolicyService.update(editingId, values);
        toast.success('Cập nhật policy thành công');
      } else {
        await depositPolicyService.create(values);
        toast.success('Tạo policy thành công');
      }
      setIsModalOpen(false);
      setEditingId(null);
      form.resetFields();
      await loadPolicies();
    } catch (error: any) {
      toast.error(error.message || 'Lỗi khi lưu policy');
    }
  };

  const handleEdit = (policy: DepositPolicy) => {
    setEditingId(policy.id);
    form.setFieldsValue({
      policyName: policy.policyName,
      mode: policy.mode,
      percentValue: policy.percentValue,
      fixedAmount: policy.fixedAmount,
      minAmount: policy.minAmount,
      maxAmount: policy.maxAmount,
      note: policy.note || '',
    });
    setIsModalOpen(true);
  };

  const handleToggleActive = async (id: number, isActive: boolean) => {
    try {
      await depositPolicyService.setActive(id, !isActive);
      toast.success(`Policy đã được ${!isActive ? 'kích hoạt' : 'vô hiệu hóa'}`);
      await loadPolicies();
    } catch (error: any) {
      toast.error(error.message || 'Lỗi khi thay đổi trạng thái');
    }
  };

  const handleCreateNew = () => {
    setEditingId(null);
    form.resetFields();
    form.setFieldsValue({
      mode: 'PERCENT',
      percentValue: 10,
      minAmount: 0,
    });
    setIsModalOpen(true);
  };

  const columns = [
    {
      title: 'Tên Policy',
      dataIndex: 'policyName',
      key: 'policyName',
      width: 200,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 120,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'default'}>
          {isActive ? 'ĐANG ACTIVE' : 'KHÔNG ACTIVE'}
        </Tag>
      ),
    },
    {
      title: 'Chế độ',
      dataIndex: 'mode',
      key: 'mode',
      width: 120,
      render: (mode: string) => mode === 'PERCENT' ? 'Phần trăm' : 'Cố định',
    },
    {
      title: 'Giá trị',
      key: 'value',
      width: 150,
      render: (_: any, record: DepositPolicy) => {
        if (record.mode === 'PERCENT' && record.percentValue) {
          return `${record.percentValue}%`;
        }
        if (record.mode === 'FIXED' && record.fixedAmount) {
          return `${record.fixedAmount.toLocaleString()} VND`;
        }
        return '-';
      },
    },
    {
      title: 'Tối thiểu',
      dataIndex: 'minAmount',
      key: 'minAmount',
      width: 120,
      render: (amount: number) => `${amount.toLocaleString()} VND`,
    },
    {
      title: 'Tối đa',
      dataIndex: 'maxAmount',
      key: 'maxAmount',
      width: 120,
      render: (amount?: number) => amount ? `${amount.toLocaleString()} VND` : '-',
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note',
      ellipsis: true,
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 80,
      render: (_: any, record: DepositPolicy) => {
        const menuItems: MenuProps['items'] = [
          {
            key: 'edit',
            label: 'Sửa',
            icon: <EditOutlined />,
            onClick: () => handleEdit(record)
          },
          {
            key: 'toggle',
            label: record.isActive ? 'Vô hiệu' : 'Kích hoạt',
            icon: record.isActive ? <CloseCircleOutlined /> : <CheckCircleOutlined />,
            danger: record.isActive,
            onClick: () => handleToggleActive(record.id, record.isActive)
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

  const activePolicy = policies.find(p => p.isActive);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý Chính sách Cọc</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreateNew}
        >
          Tạo Policy Mới
        </Button>
      </div>

      <Row gutter={16} className="mb-6">
        <Col span={8}>
          <Card>
            <Statistic title="Tổng policy" value={policies.length} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic 
              title="Đang active" 
              value={policies.filter(p => p.isActive).length}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            {activePolicy ? (
              <>
                <div className="text-gray-500 text-sm mb-1">Policy hiện tại</div>
                <div className="font-semibold text-lg">{activePolicy.policyName}</div>
                <div className="text-gray-600 text-sm mt-1">
                  {activePolicy.mode === 'PERCENT' 
                    ? `${activePolicy.percentValue}%` 
                    : `${activePolicy.fixedAmount?.toLocaleString()} VND`}
                </div>
              </>
            ) : (
              <Statistic title="Policy hiện tại" value="Không có" />
            )}
          </Card>
        </Col>
      </Row>

      <Card>
        <Table
          columns={columns}
          dataSource={policies}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: 'Không có policy nào' }}
        />
      </Card>

      <Modal
        title={editingId ? 'Sửa Deposit Policy' : 'Tạo Deposit Policy Mới'}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingId(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            mode: 'PERCENT',
            percentValue: 10,
            minAmount: 0,
          }}
        >
          <Form.Item
            name="policyName"
            label="Tên Policy"
            rules={[{ required: true, message: 'Vui lòng nhập tên policy' }]}
          >
            <Input placeholder="Nhập tên policy" />
          </Form.Item>

          <Form.Item
            name="mode"
            label="Chế độ"
            rules={[{ required: true, message: 'Vui lòng chọn chế độ' }]}
          >
            <Select>
              <Option value="PERCENT">Phần trăm (%)</Option>
              <Option value="FIXED">Số tiền cố định</Option>
            </Select>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.mode !== currentValues.mode}
          >
            {({ getFieldValue }) => {
              const mode = getFieldValue('mode');
              return mode === 'PERCENT' ? (
                <Form.Item
                  name="percentValue"
                  label="Phần trăm (%)"
                  rules={[{ required: true, message: 'Vui lòng nhập phần trăm' }]}
                >
                  <InputNumber min={0} max={100} step={0.1} style={{ width: '100%' }} />
                </Form.Item>
              ) : (
                <Form.Item
                  name="fixedAmount"
                  label="Số tiền cố định (VND)"
                  rules={[{ required: true, message: 'Vui lòng nhập số tiền' }]}
                >
                  <InputNumber min={0} style={{ width: '100%' }} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                </Form.Item>
              );
            }}
          </Form.Item>

          <Form.Item
            name="minAmount"
            label="Số tiền tối thiểu (VND)"
            rules={[{ required: true, message: 'Vui lòng nhập số tiền tối thiểu' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
          </Form.Item>

          <Form.Item
            name="maxAmount"
            label="Số tiền tối đa (VND, không bắt buộc)"
          >
            <InputNumber min={0} style={{ width: '100%' }} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
          </Form.Item>

          <Form.Item
            name="note"
            label="Ghi chú"
          >
            <TextArea rows={3} placeholder="Nhập ghi chú" />
          </Form.Item>

          <Form.Item className="mb-0">
            <Space className="w-full justify-end">
              <Button onClick={() => {
                setIsModalOpen(false);
                setEditingId(null);
                form.resetFields();
              }}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                {editingId ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

