import { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { LockOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../../layouts/MainLayout';
import { userService } from '../../services/user';

export const ChangePasswordPage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (values: any) => {
    try {
      setLoading(true);
      await userService.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      message.success('Đổi mật khẩu thành công');
      form.resetFields();
      setTimeout(() => {
        navigate('/profile');
      }, 1500);
    } catch (error: any) {
      message.error(error.message || 'Lỗi khi đổi mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto px-6 py-12">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/profile')}
          className="mb-6"
        >
          Quay lại hồ sơ
        </Button>

        <Card title="Đổi mật khẩu">
          <p className="text-gray-600 mb-6">
            Để bảo mật tài khoản, vui lòng không chia sẻ mật khẩu cho người khác
          </p>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleChangePassword}
          >
            <Form.Item
              label="Mật khẩu hiện tại"
              name="currentPassword"
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Mật khẩu hiện tại"
                size="large"
              />
            </Form.Item>

            <Form.Item
              label="Mật khẩu mới"
              name="newPassword"
              rules={[
                { required: true, message: 'Vui lòng nhập mật khẩu mới' },
                { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Mật khẩu mới"
                size="large"
              />
            </Form.Item>

            <Form.Item
              label="Xác nhận mật khẩu mới"
              name="confirmPassword"
              dependencies={['newPassword']}
              rules={[
                { required: true, message: 'Vui lòng xác nhận mật khẩu mới' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Mật khẩu xác nhận không khớp'));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Xác nhận mật khẩu mới"
                size="large"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
                block
                danger
              >
                Đổi mật khẩu
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </MainLayout>
  );
};

export default ChangePasswordPage;
