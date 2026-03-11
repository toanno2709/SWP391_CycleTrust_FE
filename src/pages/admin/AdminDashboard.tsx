import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Select, DatePicker, Space, Badge } from 'antd';
import { 
  ShoppingOutlined, 
  UserOutlined, 
  DollarOutlined, 
  RiseOutlined,
  FallOutlined,
  BellOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
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
import { analyticsService, type DashboardData } from '../../services/analytics';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const { Option } = Select;
const { RangePicker } = DatePicker;

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [dateRange, setDateRange] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, [period, dateRange]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const fromDate = dateRange?.[0] ? format(dateRange[0].toDate(), 'yyyy-MM-dd') : undefined;
      const toDate = dateRange?.[1] ? format(dateRange[1].toDate(), 'yyyy-MM-dd') : undefined;
      
      const data = await analyticsService.getDashboard(period, fromDate, toDate);
      setDashboardData(data);
    } catch (error: any) {
      toast.error(error.message || 'Lỗi khi tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (!dashboardData) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen">
        <div className="text-xl">Đang tải dữ liệu...</div>
      </div>
    );
  }

  const { summary, revenueData, orderStatusData, userGrowthData, topListings, recentActivities } = dashboardData;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Space>
          <Badge count={0} showZero={false}>
            <BellOutlined 
              className="text-2xl cursor-pointer hover:text-blue-600 transition"
              onClick={() => navigate('/notifications')}
            />
          </Badge>
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
              value={summary.totalRevenue}
              suffix="VND"
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#3f8600', fontSize: '20px' }}
              loading={loading}
            />
            <div className="flex items-center gap-1 mt-2 text-sm">
              {summary.revenueGrowth >= 0 ? (
                <>
                  <RiseOutlined style={{ color: '#3f8600' }} />
                  <span style={{ color: '#3f8600' }}>+{summary.revenueGrowth}%</span>
                </>
              ) : (
                <>
                  <FallOutlined style={{ color: '#cf1322' }} />
                  <span style={{ color: '#cf1322' }}>{summary.revenueGrowth}%</span>
                </>
              )}
              <span className="text-gray-500">so với kỳ trước</span>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng đơn hàng"
              value={summary.totalOrders}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: '#1890ff', fontSize: '20px' }}
              loading={loading}
            />
            <div className="flex items-center gap-1 mt-2 text-sm">
              {summary.orderGrowth >= 0 ? (
                <>
                  <RiseOutlined style={{ color: '#3f8600' }} />
                  <span style={{ color: '#3f8600' }}>+{summary.orderGrowth}%</span>
                </>
              ) : (
                <>
                  <FallOutlined style={{ color: '#cf1322' }} />
                  <span style={{ color: '#cf1322' }}>{summary.orderGrowth}%</span>
                </>
              )}
              <span className="text-gray-500">so với kỳ trước</span>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng người dùng"
              value={summary.totalUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#722ed1', fontSize: '20px' }}
              loading={loading}
            />
            <div className="flex items-center gap-1 mt-2 text-sm">
              {summary.userGrowth >= 0 ? (
                <>
                  <RiseOutlined style={{ color: '#3f8600' }} />
                  <span style={{ color: '#3f8600' }}>+{summary.userGrowth}%</span>
                </>
              ) : (
                <>
                  <FallOutlined style={{ color: '#cf1322' }} />
                  <span style={{ color: '#cf1322' }}>{summary.userGrowth}%</span>
                </>
              )}
              <span className="text-gray-500">so với kỳ trước</span>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Giá trị đơn TB"
              value={summary.averageOrderValue}
              suffix="VND"
              valueStyle={{ color: '#faad14', fontSize: '20px' }}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} className="mb-6">
        <Col xs={24} lg={16}>
          <Card title="Biểu đồ Doanh thu" className="h-full">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1890ff" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#1890ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
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
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {orderStatusData.map((entry, index) => (
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
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
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
              <BarChart data={topListings} layout="vertical">
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
              {recentActivities.map((activity) => (
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
};
