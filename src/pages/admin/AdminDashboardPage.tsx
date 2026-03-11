import { useState } from 'react';
import { Card, Row, Col, Statistic, Select, DatePicker, Space } from 'antd';
import { 
  ShoppingOutlined, 
  UserOutlined, 
  DollarOutlined, 
  RiseOutlined,
  FallOutlined 
} from '@ant-design/icons';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const { Option } = Select;
const { RangePicker } = DatePicker;

const generateMockData = () => {
  const revenueData = Array.from({ length: 12 }, (_, i) => ({
    month: `Tháng ${i + 1}`,
    revenue: Math.floor(Math.random() * 50000000) + 20000000,
    orders: Math.floor(Math.random() * 100) + 20,
  }));

  const orderStatusData = [
    { name: 'Hoàn thành', value: 145, color: '#52c41a' },
    { name: 'Đang giao', value: 32, color: '#1890ff' },
    { name: 'Chờ xác nhận', value: 18, color: '#faad14' },
    { name: 'Đã hủy', value: 12, color: '#ff4d4f' },
    { name: 'Tranh chấp', value: 5, color: '#fa8c16' },
  ];

  const userGrowthData = Array.from({ length: 12 }, (_, i) => ({
    month: `T${i + 1}`,
    buyers: Math.floor(Math.random() * 50) + 10,
    sellers: Math.floor(Math.random() * 20) + 5,
  }));

  const topListingsData = [
    { name: 'Honda Wave RSX', sales: 15, revenue: 45000000 },
    { name: 'Yamaha Exciter', sales: 12, revenue: 38000000 },
    { name: 'Honda Air Blade', sales: 10, revenue: 32000000 },
    { name: 'Yamaha Sirius', sales: 8, revenue: 24000000 },
    { name: 'Suzuki Raider', sales: 6, revenue: 18000000 },
  ];

  const recentActivities = [
    { id: 1, type: 'order', message: 'Đơn hàng #1234 đã hoàn thành', time: '5 phút trước' },
    { id: 2, type: 'user', message: 'User mới đăng ký: nguyen.van.a@email.com', time: '15 phút trước' },
    { id: 3, type: 'listing', message: 'Listing mới: Honda Winner X', time: '30 phút trước' },
    { id: 4, type: 'dispute', message: 'Dispute mới từ đơn hàng #1220', time: '1 giờ trước' },
    { id: 5, type: 'order', message: 'Đơn hàng #1233 được tạo', time: '2 giờ trước' },
  ];

  return {
    revenueData,
    orderStatusData,
    userGrowthData,
    topListingsData,
    recentActivities,
  };
};

export default function AdminDashboardPage() {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [dateRange, setDateRange] = useState<any>(null);

  const mockData = generateMockData();

  const totalRevenue = 450000000;
  const totalOrders = 212;
  const totalUsers = 847;
  const averageOrderValue = totalRevenue / totalOrders;

  const revenueGrowth = 12.5;
  const orderGrowth = 8.3;
  const userGrowth = 15.7;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Space>
          <Select
            value={period}
            onChange={(value) => setPeriod(value)}
            style={{ width: 150 }}
          >
            <Option value="daily">Theo ngày</Option>
            <Option value="weekly">Theo tuần</Option>
            <Option value="monthly">Theo tháng</Option>
          </Select>
          <RangePicker
            value={dateRange}
            onChange={(dates) => setDateRange(dates)}
            format="DD/MM/YYYY"
            placeholder={['Từ ngày', 'Đến ngày']}
          />
        </Space>
      </div>

      <Row gutter={16} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng doanh thu"
              value={totalRevenue}
              suffix="VND"
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#3f8600', fontSize: '20px' }}
            />
            <div className="flex items-center gap-1 mt-2 text-sm">
              <RiseOutlined style={{ color: '#3f8600' }} />
              <span style={{ color: '#3f8600' }}>+{revenueGrowth}%</span>
              <span className="text-gray-500">so với tháng trước</span>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng đơn hàng"
              value={totalOrders}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: '#1890ff', fontSize: '20px' }}
            />
            <div className="flex items-center gap-1 mt-2 text-sm">
              <RiseOutlined style={{ color: '#3f8600' }} />
              <span style={{ color: '#3f8600' }}>+{orderGrowth}%</span>
              <span className="text-gray-500">so với tháng trước</span>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng người dùng"
              value={totalUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#722ed1', fontSize: '20px' }}
            />
            <div className="flex items-center gap-1 mt-2 text-sm">
              <RiseOutlined style={{ color: '#3f8600' }} />
              <span style={{ color: '#3f8600' }}>+{userGrowth}%</span>
              <span className="text-gray-500">so với tháng trước</span>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Giá trị đơn TB"
              value={averageOrderValue}
              suffix="VND"
              valueStyle={{ color: '#faad14', fontSize: '20px' }}
            />
            <div className="flex items-center gap-1 mt-2 text-sm">
              <FallOutlined style={{ color: '#cf1322' }} />
              <span style={{ color: '#cf1322' }}>-2.3%</span>
              <span className="text-gray-500">so với tháng trước</span>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={16} className="mb-6">
        <Col xs={24} lg={16}>
          <Card title="Biểu đồ Doanh thu" className="h-full">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={mockData.revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1890ff" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#1890ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis 
                  tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                />
                <Tooltip 
                  formatter={(value: any) => [`${value.toLocaleString()} VND`, 'Doanh thu']}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#1890ff"
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  name="Doanh thu"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Trạng thái Đơn hàng" className="h-full">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={mockData.orderStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {mockData.orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row gutter={16} className="mb-6">
        <Col xs={24} lg={12}>
          <Card title="Tăng trưởng Người dùng">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockData.userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="buyers" 
                  stroke="#52c41a" 
                  strokeWidth={2}
                  name="Người mua"
                  dot={{ r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="sellers" 
                  stroke="#1890ff" 
                  strokeWidth={2}
                  name="Người bán"
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Top Listings bán chạy">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockData.topListingsData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} />
                <Tooltip 
                  formatter={(value: any, name?: string | number) => {
                    if (name === 'sales') return [value, 'Số lượng bán'];
                    return [`${value.toLocaleString()} VND`, 'Doanh thu'];
                  }}
                />
                <Legend />
                <Bar dataKey="sales" fill="#1890ff" name="Số lượng" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24}>
          <Card title="Hoạt động gần đây">
            <div className="space-y-3">
              {mockData.recentActivities.map((activity) => (
                <div 
                  key={activity.id} 
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'order' ? 'bg-green-500' :
                      activity.type === 'user' ? 'bg-blue-500' :
                      activity.type === 'listing' ? 'bg-purple-500' :
                      'bg-orange-500'
                    }`} />
                    <span className="text-gray-800">{activity.message}</span>
                  </div>
                  <span className="text-sm text-gray-500">{activity.time}</span>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
