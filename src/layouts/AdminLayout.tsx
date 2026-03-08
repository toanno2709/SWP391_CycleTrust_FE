import type { ReactNode } from "react";
import { Layout, Menu, Dropdown, Avatar } from "antd";
import type { MenuProps } from "antd";
import {
  DashboardOutlined,
  ShoppingOutlined,
  UserOutlined,
  TagsOutlined,
  LogoutOutlined,
  TransactionOutlined,
  WarningOutlined,
  DollarOutlined,
  DownOutlined,
} from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/auth";
import { ROUTES } from "../config/constants";

const { Header, Sider, Content } = Layout;

interface AdminLayoutProps {
  children: ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const menuItems = [
    {
      key: ROUTES.ADMIN_DASHBOARD,
      icon: <DashboardOutlined />,
      label: <Link to={ROUTES.ADMIN_DASHBOARD}>Dashboard</Link>,
    },
    {
      key: ROUTES.ADMIN_LISTINGS,
      icon: <ShoppingOutlined />,
      label: <Link to={ROUTES.ADMIN_LISTINGS}>Listings</Link>,
    },
    {
      key: ROUTES.ADMIN_USERS,
      icon: <UserOutlined />,
      label: <Link to={ROUTES.ADMIN_USERS}>Users</Link>,
    },
    {
      key: ROUTES.ADMIN_CATALOG,
      icon: <TagsOutlined />,
      label: <Link to={ROUTES.ADMIN_CATALOG}>Catalog</Link>,
    },
    {
      key: ROUTES.ADMIN_TRANSACTIONS,
      icon: <TransactionOutlined />,
      label: <Link to={ROUTES.ADMIN_TRANSACTIONS}>Giao dịch</Link>,
    },
    {
      key: ROUTES.ADMIN_DISPUTES,
      icon: <WarningOutlined />,
      label: <Link to={ROUTES.ADMIN_DISPUTES}>Tranh chấp</Link>,
    },
    {
      key: ROUTES.ADMIN_DEPOSIT_POLICY,
      icon: <DollarOutlined />,
      label: <Link to={ROUTES.ADMIN_DEPOSIT_POLICY}>Chính sách cọc</Link>,
    },
  ];

  const profileMenuItems: MenuProps['items'] = [
    {
      key: 'dashboard',
      label: <Link to={ROUTES.ADMIN_DASHBOARD}>Dashboard</Link>,
      icon: <DashboardOutlined />,
    },
    {
      key: 'listings',
      label: <Link to={ROUTES.ADMIN_LISTINGS}>Quản lý Listings</Link>,
      icon: <ShoppingOutlined />,
    },
    {
      key: 'users',
      label: <Link to={ROUTES.ADMIN_USERS}>Quản lý Users</Link>,
      icon: <UserOutlined />,
    },
    {
      key: 'transactions',
      label: <Link to={ROUTES.ADMIN_TRANSACTIONS}>Giao dịch</Link>,
      icon: <TransactionOutlined />,
    },
    {
      key: 'disputes',
      label: <Link to={ROUTES.ADMIN_DISPUTES}>Tranh chấp</Link>,
      icon: <WarningOutlined />,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: 'Đăng xuất',
      icon: <LogoutOutlined />,
      danger: true,
      onClick: logout,
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        style={{
          overflow: "auto",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div className="flex items-center gap-2 text-green-600 p-4">
          <span className="material-symbols-outlined text-3xl">
            directions_bike
          </span>
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
        <Header
          style={{
            padding: "0 24px",
            background: "#fff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div />
          <Dropdown menu={{ items: profileMenuItems }} trigger={['click']}>
            <div className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 px-3 py-2 rounded">
              <Avatar icon={<UserOutlined />}>{user?.fullName?.[0]}</Avatar>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold mb-0!">{user?.fullName}</p>
                <p className="text-xs text-slate-500 mb-0!">{user?.role}</p>
              </div>
              <DownOutlined />
            </div>
          </Dropdown>
        </Header>
        <Content style={{ margin: "24px 16px 0", overflow: "initial" }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};
