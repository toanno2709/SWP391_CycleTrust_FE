import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '../../services/auth';
import { useAuthStore } from '../../store/auth';
import { ROUTES } from '../../config/constants';
import { UserRole } from '../../types';
import { Input, Button } from '../../components/ui';
import { useForm } from '../../hooks/useForm';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const setUser = useAuthStore(state => state.setUser);
  const [loading, setLoading] = useState(false);
  
  const { values, errors, handleChange, setFieldValue, setFieldError } = useForm<{
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    fullName: string;
    role: UserRole;
  }>({
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    role: UserRole.BUYER,
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (values.password !== values.confirmPassword) {
      toast.error('Mật khẩu không khớp');
      setFieldError('confirmPassword', 'Mật khẩu không khớp');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.register({
        email: values.email || undefined,
        phone: values.phone || undefined,
        password: values.password,
        fullName: values.fullName,
        role: values.role,
      });

      // If registering as SELLER, they need admin approval
      if (values.role === UserRole.SELLER) {
        toast.success('Đăng ký thành công! Tài khoản của bạn đang chờ admin phê duyệt.', {
          duration: 5000,
        });
        navigate(ROUTES.LOGIN);
        return;
      }

      // For other roles (BUYER), login immediately
      setUser(response.user);
      toast.success('Đăng ký thành công!');
      
      // Navigate based on role
      switch (response.user.role) {
        case UserRole.ADMIN:
          navigate(ROUTES.ADMIN_DASHBOARD);
          break;
        case UserRole.BUYER:
          navigate(ROUTES.BUYER_DASHBOARD);
          break;
        case UserRole.INSPECTOR:
          navigate(ROUTES.INSPECTOR_DASHBOARD);
          break;
        default:
          navigate(ROUTES.HOME);
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Đăng ký thất bại';
      toast.error(errorMsg);
      setFieldError('email', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-slate-50 dark:bg-background-dark">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link to={ROUTES.HOME} className="inline-flex items-center gap-2 text-green-600 mb-6">
            <span className="material-symbols-outlined text-4xl">directions_bike</span>
            <h1 className="text-3xl font-black">CycleTrust</h1>
          </Link>
          <h2 className="text-2xl font-bold">Đăng ký tài khoản</h2>
          <p className="text-slate-500 mt-2">Tham gia cộng đồng CycleTrust ngay hôm nay</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Họ và tên"
              name="fullName"
              type="text"
              value={values.fullName}
              onChange={handleChange}
              error={errors.fullName}
              icon="person"
              required
            />

            <Input
              label="Email"
              name="email"
              type="email"
              value={values.email}
              onChange={handleChange}
              error={errors.email}
              icon="mail"
            />

            <Input
              label="Số điện thoại"
              name="phone"
              type="tel"
              value={values.phone}
              onChange={handleChange}
              error={errors.phone}
              icon="phone"
              placeholder="0123456789"
            />

            <Input
              label="Mật khẩu"
              name="password"
              type="password"
              value={values.password}
              onChange={handleChange}
              error={errors.password}
              icon="lock"
              required
            />

            <Input
              label="Xác nhận mật khẩu"
              name="confirmPassword"
              type="password"
              value={values.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              icon="lock"
              required
            />

            <div>
              <label className="block text-sm font-semibold mb-2">Bạn muốn</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFieldValue('role', UserRole.BUYER)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    values.role === UserRole.BUYER
                      ? 'border-green-600 bg-green-50'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  <span className="material-symbols-outlined text-green-600 text-2xl block mb-1">
                    shopping_cart
                  </span>
                  <div className="font-semibold">Mua xe</div>
                  <div className="text-xs text-slate-500">Người mua</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFieldValue('role', UserRole.SELLER)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    values.role === UserRole.SELLER
                      ? 'border-green-600 bg-green-50'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  <span className="material-symbols-outlined text-green-600 text-2xl block mb-1">
                    sell
                  </span>
                  <div className="font-semibold">Bán xe</div>
                  <div className="text-xs text-slate-500">Người bán</div>
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={loading}
              className="w-full"
            >
              Đăng ký
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Đã có tài khoản?{' '}
              <Link to={ROUTES.LOGIN} className="text-green-600 font-semibold hover:underline">
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
