import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '../../services/auth';
import { useAuthStore } from '../../store/auth';
import { ROUTES } from '../../config/constants';
import { Input, Button } from '../../components/ui';
import { useForm } from '../../hooks/useForm';

export const LoginPage = () => {
  const navigate = useNavigate();
  const setUser = useAuthStore(state => state.setUser);
  const [loading, setLoading] = useState(false);
  
  const { values, errors, handleChange, setFieldError } = useForm({
    emailOrPhone: '',
    password: '',
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authService.login(values);
      setUser(response.user);
      toast.success('Đăng nhập thành công!');
      navigate(ROUTES.HOME);
    } catch (error: any) {
      const errorMsg = error.message || 'Đăng nhập thất bại';
      toast.error(errorMsg);
      setFieldError('password', errorMsg);
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
          <h2 className="text-2xl font-bold">Đăng nhập</h2>
          <p className="text-slate-500 mt-2">Chào mừng bạn quay trở lại!</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email hoặc Số điện thoại"
              name="emailOrPhone"
              type="text"
              value={values.emailOrPhone}
              onChange={handleChange}
              error={errors.emailOrPhone}
              icon="person"
              required
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

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={loading}
              className="w-full"
            >
              Đăng nhập
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Chưa có tài khoản?{' '}
              <Link to={ROUTES.REGISTER} className="text-green-600 font-semibold hover:underline">
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
