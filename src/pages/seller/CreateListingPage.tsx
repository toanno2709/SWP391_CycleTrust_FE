import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../../layouts/MainLayout';
import { listingService } from '../../services/listing';
import { useCatalogStore } from '../../store/catalog';
import { Input, Textarea, Button, Card } from '../../components/ui';
import { ImageUploader } from '../../components/listing/ImageUploader';
import { useForm } from '../../hooks/useForm';
import { useEffect } from 'react';

export const CreateListingPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const { brands, categories, sizes, fetchAll } = useCatalogStore();

  const { values, errors, handleChange } = useForm({
    title: '',
    description: '',
    usageHistory: '',
    locationText: '',
    brandId: '',
    categoryId: '',
    sizeOptionId: '',
    priceAmount: '',
    conditionNote: '',
    yearModel: '',
  });

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (mediaUrls.length === 0) {
      alert('Vui lòng upload ít nhất 1 ảnh');
      return;
    }

    setLoading(true);
    try {
      await listingService.create({
        title: values.title,
        description: values.description,
        usageHistory: values.usageHistory || undefined,
        locationText: values.locationText || undefined,
        brandId: values.brandId ? Number(values.brandId) : undefined,
        categoryId: values.categoryId ? Number(values.categoryId) : undefined,
        sizeOptionId: values.sizeOptionId ? Number(values.sizeOptionId) : undefined,
        priceAmount: Number(values.priceAmount),
        conditionNote: values.conditionNote || undefined,
        yearModel: values.yearModel ? Number(values.yearModel) : undefined,
        mediaUrls,
      });
      
      navigate('/seller/listings');
    } catch (error: any) {
      alert(error.message || 'Tạo listing thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-black mb-2">Đăng bán xe đạp</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Điền thông tin chi tiết để bắt đầu đăng bán
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <Card>
            <h2 className="text-2xl font-bold mb-6">Hình ảnh</h2>
            <ImageUploader onUpload={setMediaUrls} maxFiles={10} />
          </Card>

          <Card>
            <h2 className="text-2xl font-bold mb-6">Thông tin cơ bản</h2>
            <div className="space-y-4">
              <Input
                label="Tiêu đề"
                name="title"
                value={values.title}
                onChange={handleChange}
                error={errors.title}
                placeholder="VD: Specialized Tarmac SL7 2022 - Size 54"
                required
              />

              <Textarea
                label="Mô tả chi tiết"
                name="description"
                value={values.description}
                onChange={handleChange}
                error={errors.description}
                rows={6}
                placeholder="Mô tả chi tiết về xe: cấu hình, tình trạng, lý do bán..."
                required
              />

              <Textarea
                label="Lịch sử sử dụng"
                name="usageHistory"
                value={values.usageHistory}
                onChange={handleChange}
                rows={4}
                placeholder="Đã sử dụng bao lâu, quãng đường, bảo dưỡng..."
              />
            </div>
          </Card>

          <Card>
            <h2 className="text-2xl font-bold mb-6">Thông số kỹ thuật</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Thương hiệu</label>
                <select
                  name="brandId"
                  value={values.brandId}
                  onChange={handleChange}
                  className="block w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-green-600"
                >
                  <option value="">Chọn thương hiệu</option>
                  {brands.map(brand => (
                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Loại xe</label>
                <select
                  name="categoryId"
                  value={values.categoryId}
                  onChange={handleChange}
                  className="block w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-green-600"
                >
                  <option value="">Chọn loại xe</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Size</label>
                <select
                  name="sizeOptionId"
                  value={values.sizeOptionId}
                  onChange={handleChange}
                  className="block w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-green-600"
                >
                  <option value="">Chọn size</option>
                  {sizes.map(size => (
                    <option key={size.id} value={size.id}>{size.label}</option>
                  ))}
                </select>
              </div>

              <Input
                label="Năm sản xuất"
                name="yearModel"
                type="number"
                value={values.yearModel}
                onChange={handleChange}
                placeholder="2022"
              />

              <Input
                label="Tình trạng"
                name="conditionNote"
                value={values.conditionNote}
                onChange={handleChange}
                placeholder="VD: Mới 95%, ít trầy xước"
              />

              <Input
                label="Vị trí"
                name="locationText"
                value={values.locationText}
                onChange={handleChange}
                placeholder="Quận 1, TP.HCM"
              />
            </div>
          </Card>

          <Card>
            <h2 className="text-2xl font-bold mb-6">Giá bán</h2>
            <Input
              label="Giá (VNĐ)"
              name="priceAmount"
              type="number"
              value={values.priceAmount}
              onChange={handleChange}
              error={errors.priceAmount}
              placeholder="50000000"
              required
            />
          </Card>

          <div className="flex gap-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/seller/listings')}
              className="flex-1"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              isLoading={loading}
              className="flex-1"
            >
              Đăng tin
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};
