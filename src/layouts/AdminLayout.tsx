import type { ReactNode } from 'react';
import { Layout, Menu } from 'antd';
import { 
  DashboardOutlined, 
  ShoppingOutlined,
  UserOutlined,
  TagsOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth'; 

const { Header, Sider, Content } = Layout;

interface AdminLayoutProps {
  children: ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const menuItems = [
    {
      key: '/admin/dashboard',
      icon: <DashboardOutlined />,
      label: <Link to="/admin/dashboard">Dashboard</Link>,
    },
    {
      key: '/admin/listings',
      icon: <ShoppingOutlined />,
      label: <Link to="/admin/listings">Listings</Link>,
    },
    {
      key: '/admin/users',
      icon: <UserOutlined />,
      label: <Link to="/admin/users">Users</Link>,
    },
    {
      key: '/admin/catalog',
      icon: <TagsOutlined />,
      label: <Link to="/admin/catalog">Catalog</Link>,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div className="flex items-center gap-2 text-green-600 p-4">
          <span className="material-symbols-outlined text-3xl">directions_bike</span>
          <div className="text-white font-bold text-lg">Admin Panel</div>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
        />
      </Sider>
      <Layout style={{ marginLeft: 200 }}>
        <Header style={{ 
          padding: '0 24px', 
          background: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div />
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="font-semibold">{user?.fullName}</div>
              <div className="text-xs text-slate-500">{user?.role}</div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 rounded hover:bg-slate-100 transition-colors"
            >
              <LogoutOutlined />
              <span>Đăng xuất</span>
            </button>
          </div>
        </Header>
        <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};
