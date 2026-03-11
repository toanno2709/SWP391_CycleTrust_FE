import { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Upload, Avatar } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, LockOutlined, UploadOutlined } from '@ant-design/icons';
import type { RcFile } from 'antd/es/upload/interface';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../../layouts/MainLayout';
import { useAuthStore } from '../../store/auth';
import { userService } from '../../services/user';

export const ProfilePage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [profileForm] = Form.useForm();
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(user?.avatarUrl);

  useEffect(() => {
    if (user) {
      profileForm.setFieldsValue({
        fullName: user.fullName,
        email: user.email,
        phone: user.phone || '',
      });
      setAvatarUrl(user.avatarUrl);
    }
  }, [user, profileForm]);

  const handleAvatarUpload = async (file: RcFile) => {
    try {
      setUploadingAvatar(true);
      const updatedUser = await userService.uploadAvatar(file);
      setAvatarUrl(updatedUser.avatarUrl);
      message.success('Cập nhật ảnh đại diện thành công');
      return false; // Prevent default upload behavior
    } catch (error: any) {
      message.error(error.message || 'Lỗi khi tải ảnh lên');
      return false;
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleUpdateProfile = async (values: any) => {
    try {
      setLoadingProfile(true);
      await userService.updateProfile({
        fullName: values.fullName,
        phone: values.phone,
      });
      message.success('Cập nhật thông tin thành công');
    } catch (error: any) {
      message.error(error.message || 'Lỗi khi cập nhật thông tin');
    } finally {
      setLoadingProfile(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-8">Thông tin cá nhân</h1>

        <Card className="mb-6">
          <div className="flex flex-col items-center">
            <Avatar
              size={120}
              src={avatarUrl}
              icon={!avatarUrl && <UserOutlined />}
              className="mb-4"
            />
            <Upload
              beforeUpload={handleAvatarUpload}
              showUploadList={false}
              accept="image/*"
            >
              <Button
                icon={<UploadOutlined />}
                loading={uploadingAvatar}
              >
                {avatarUrl ? 'Thay đổi ảnh đại diện' : 'Tải ảnh đại diện lên'}
              </Button>
            </Upload>
            <p className="text-gray-500 text-sm mt-2">
              JPG, PNG hoặc GIF. Tối đa 5MB.
            </p>
          </div>
        </Card>

        <Card title="Thông tin tài khoản" className="mb-6">
          <Form
            form={profileForm}
            layout="vertical"
            onFinish={handleUpdateProfile}
          >
            <Form.Item
              label="Họ và tên"
              name="fullName"
              rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Họ và tên" />
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="Email"
                disabled
                className="bg-gray-100"
              />
            </Form.Item>

            <Form.Item
              label="Số điện thoại"
              name="phone"
              rules={[
                { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ' }
              ]}
            >
              <Input prefix={<PhoneOutlined />} placeholder="Số điện thoại" />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loadingProfile}
                className="w-full md:w-auto"
              >
                Cập nhật thông tin
              </Button>
            </Form.Item>
          </Form>
        </Card>

        <Card title="Bảo mật">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold mb-1">Mật khẩu</h3>
              <p className="text-sm text-gray-500">Thay đổi mật khẩu để bảo mật tài khoản</p>
            </div>
            <Button
              icon={<LockOutlined />}
              onClick={() => navigate('/change-password')}
            >
              Đổi mật khẩu
            </Button>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};

export default ProfilePage;
