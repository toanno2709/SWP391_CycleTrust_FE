import { Link, useNavigate } from 'react-router-dom';
import { Dropdown, Avatar } from 'antd';
import type { MenuProps } from 'antd';
import { DownOutlined, UserOutlined, DashboardOutlined, LogoutOutlined, ShoppingOutlined, HeartOutlined, FileTextOutlined, WarningOutlined, InboxOutlined, IdcardOutlined } from '@ant-design/icons';
import { useAuthStore } from '../../store/auth';
import { ROUTES } from '../../config/constants';
import { UserRole } from '../../types';
import { NotificationBell } from '../notifications/NotificationBell';

export const Header = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  const getDashboardRoute = () => {
    switch (user?.role) {
      case UserRole.BUYER:
        return ROUTES.BUYER_DASHBOARD;
      case UserRole.SELLER:
        return ROUTES.SELLER_DASHBOARD;
      case UserRole.ADMIN:
        return ROUTES.ADMIN_DASHBOARD;
      case UserRole.INSPECTOR:
        return ROUTES.INSPECTOR_DASHBOARD;
      default:
        return ROUTES.HOME;
    }
  };

  const getProfileMenuItems = (): MenuProps['items'] => {
    const commonItems: MenuProps['items'] = [
      {
        key: 'dashboard',
        label: 'Dashboard',
        icon: <DashboardOutlined />,
        onClick: () => navigate(getDashboardRoute()),
      },
      {
        key: 'profile',
        label: 'Hồ sơ của tôi',
        icon: <IdcardOutlined />,
        onClick: () => navigate('/profile'),
      },
    ];

    let roleSpecificItems: MenuProps['items'] = [];

    switch (user?.role) {
      case UserRole.BUYER:
        roleSpecificItems = [
          {
            key: 'orders',
            label: 'Đơn hàng',
            icon: <ShoppingOutlined />,
            onClick: () => navigate(ROUTES.BUYER_ORDERS),
          },
          {
            key: 'wishlist',
            label: 'Yêu thích',
            icon: <HeartOutlined />,
            onClick: () => navigate('/buyer/wishlist'),
          },
          {
            key: 'disputes',
            label: 'Tranh chấp',
            icon: <WarningOutlined />,
            onClick: () => navigate('/buyer/disputes'),
          },
        ];
        break;

      case UserRole.SELLER:
        roleSpecificItems = [       
          {
            key: 'orders',
            label: 'Đơn hàng',
            icon: <ShoppingOutlined />,
            onClick: () => navigate(ROUTES.SELLER_ORDERS),
          },
          {
            key: 'create',
            label: 'Đăng tin mới',
            icon: <FileTextOutlined />,
            onClick: () => navigate(ROUTES.SELLER_CREATE_LISTING),
          },
        ];
        break;

      case UserRole.INSPECTOR:
        roleSpecificItems = [
          {
            key: 'listings',
            label: 'Listings kiểm định',
            icon: <InboxOutlined />,
            onClick: () => navigate('/inspector/listings'),
          },
        ];
        break;

      case UserRole.ADMIN:
        roleSpecificItems = [];
        break;
    }

    return [
      ...commonItems,
      ...roleSpecificItems,
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
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md px-6 lg:px-20 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
        <div className="flex items-center gap-10">
          <Link to={ROUTES.HOME} className="flex items-center gap-2 text-green-600">
            <span className="material-symbols-outlined text-3xl font-bold">directions_bike</span>
            <h2 className="!mb-0 text-slate-900 dark:text-white text-xl font-black tracking-tight">
              CycleTrust
            </h2>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link
              to={ROUTES.SEARCH}
              className="text-sm font-semibold hover:text-green-600 transition-colors"
            >
              Mua xe
            </Link>
            {user?.role === UserRole.SELLER && (
              <Link
                to={ROUTES.SELLER_CREATE_LISTING}
                className="text-sm font-semibold hover:text-green-600 transition-colors"
              >
                Đăng bán
              </Link>
            )}
           
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <NotificationBell />
              <Dropdown menu={{ items: getProfileMenuItems() }} trigger={['click']} placement="bottomRight">
                <div className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 px-3 py-2 rounded-lg transition-colors">
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.fullName}
                      className="w-8 h-8 rounded-full object-cover border-2 border-green-200"
                    />
                  ) : (
                    <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#10b981' }}>
                      {user?.fullName?.[0]}
                    </Avatar>
                  )}
                  <div className="text-left hidden sm:block">
                    <p className="text-sm font-semibold mb-0!">{user?.fullName}</p>
                    <p className="text-xs text-slate-500 mb-0!">{user?.role}</p>
                  </div>
                  <DownOutlined style={{ fontSize: '10px' }} />
                </div>
              </Dropdown>
            </>
          ) : (
            <>
              <Link
                to={ROUTES.LOGIN}
                className="px-6 py-2 text-sm font-semibold hover:text-green-600 transition-colors"
              >
                Đăng nhập
              </Link>
              <Link
                to={ROUTES.REGISTER}
                className="px-6 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors"
              >
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
