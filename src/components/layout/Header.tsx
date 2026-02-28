import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/auth';
import { ROUTES } from '../../config/constants';
import { UserRole } from '../../types';

export const Header = () => {
  const { user, isAuthenticated, logout } = useAuthStore();

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

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md px-6 lg:px-20 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
        <div className="flex items-center gap-10">
          <Link to={ROUTES.HOME} className="flex items-center gap-2 text-green-600">
            <span className="material-symbols-outlined text-3xl font-bold">directions_bike</span>
            <h2 className="text-slate-900 dark:text-white text-xl font-black tracking-tight">
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
            <Link
              to="#"
              className="text-sm font-semibold hover:text-green-600 transition-colors"
            >
              Xe đã xác thực
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link
                to={getDashboardRoute()}
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <span className="material-symbols-outlined">dashboard</span>
                <span className="text-sm font-medium">Dashboard</span>
              </Link>
              <div className="flex items-center gap-2">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold">{user?.fullName}</p>
                  <p className="text-xs text-slate-500">{user?.role}</p>
                </div>
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.fullName}
                    className="w-10 h-10 rounded-full object-cover border-2 border-green-200"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="material-symbols-outlined text-green-600">person</span>
                  </div>
                )}
                <button
                  onClick={logout}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Đăng xuất"
                >
                  <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">
                    logout
                  </span>
                </button>
              </div>
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
