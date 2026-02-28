import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { catalogService } from '../../services/catalog';
import type { Brand, BikeCategory, SizeOption } from '../../types';

export const AdminCatalogPage = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<BikeCategory[]>([]);
  const [sizes, setSizes] = useState<SizeOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'brand' | 'category' | 'size'>('brand');
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [brandsData, categoriesData, sizesData] = await Promise.all([
        catalogService.getBrands(),
        catalogService.getCategories(),
        catalogService.getSizes(),
      ]);
      setBrands(brandsData);
      setCategories(categoriesData);
      setSizes(sizesData);
    } catch (error) {
      message.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = (type: 'brand' | 'category' | 'size') => {
    setModalType(type);
    form.resetFields();
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (modalType === 'brand') {
        await catalogService.createBrand(values.name);
      } else if (modalType === 'category') {
        await catalogService.createCategory(values.name);
      } else {
        await catalogService.createSize(values.label);
      }
      
      message.success('Đã thêm thành công');
      setModalOpen(false);
      fetchData();
    } catch (error) {
      message.error('Thêm thất bại');
    }
  };

  const brandColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: 'Tên thương hiệu', dataIndex: 'name', key: 'name' },
    { 
      title: 'Trạng thái', 
      dataIndex: 'isActive', 
      key: 'isActive',
      render: (active: boolean) => (active ? 'Hoạt động' : 'Vô hiệu hóa')
    },
  ];

  const categoryColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: 'Tên loại xe', dataIndex: 'name', key: 'name' },
    { 
      title: 'Trạng thái', 
      dataIndex: 'isActive', 
      key: 'isActive',
      render: (active: boolean) => (active ? 'Hoạt động' : 'Vô hiệu hóa')
    },
  ];

  const sizeColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: 'Kích thước', dataIndex: 'label', key: 'label' },
    { 
      title: 'Trạng thái', 
      dataIndex: 'isActive', 
      key: 'isActive',
      render: (active: boolean) => (active ? 'Hoạt động' : 'Vô hiệu hóa')
    },
  ];

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold">Quản lý Catalog</h1>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Thương hiệu</h2>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => handleAdd('brand')}
          >
            Thêm thương hiệu
          </Button>
        </div>
        <Table
          columns={brandColumns}
          dataSource={brands}
          loading={loading}
          rowKey="id"
          pagination={false}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Loại xe</h2>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => handleAdd('category')}
          >
            Thêm loại xe
          </Button>
        </div>
        <Table
          columns={categoryColumns}
          dataSource={categories}
          loading={loading}
          rowKey="id"
          pagination={false}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Kích thước</h2>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => handleAdd('size')}
          >
            Thêm kích thước
          </Button>
        </div>
        <Table
          columns={sizeColumns}
          dataSource={sizes}
          loading={loading}
          rowKey="id"
          pagination={false}
        />
      </div>

      <Modal
        title={`Thêm ${modalType === 'brand' ? 'thương hiệu' : modalType === 'category' ? 'loại xe' : 'kích thước'}`}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        okText="Thêm"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name={modalType === 'size' ? 'label' : 'name'}
            label={modalType === 'brand' ? 'Tên thương hiệu' : modalType === 'category' ? 'Tên loại xe' : 'Kích thước'}
            rules={[{ required: true, message: 'Vui lòng nhập!' }]}
          >
            <Input placeholder="VD: Specialized" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
