import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { MainLayout } from '../../layouts/MainLayout';
import { listingService } from '../../services/listing';
import { useCatalogStore } from '../../store/catalog';
import { Input, Textarea, Button, Card } from '../../components/ui';
import { ImageUploader } from '../../components/listing/ImageUploader';
import { VideoUploader } from '../../components/listing/VideoUploader';
import { useForm } from '../../hooks/useForm';
import { useEffect } from 'react';

// Format price with dot separators
const formatPrice = (value: string): string => {
  // Remove all non-digit characters
  const numbers = value.replace(/\D/g, '');
  if (!numbers) return '';
  // Add dot separators
  return Number(numbers).toLocaleString('vi-VN');
};

// Parse price to number
const parsePrice = (value: string): number => {
  const numbers = value.replace(/\D/g, '');
  return numbers ? Number(numbers) : 0;
};

export const CreateListingPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [displayPrice, setDisplayPrice] = useState('');
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

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const formatted = formatPrice(inputValue);
    setDisplayPrice(formatted);
    // Update actual value
    handleChange({
      target: {
        name: 'priceAmount',
        value: parsePrice(inputValue).toString(),
      },
    } as any);
  };

  const handleSaveDraft = async () => {
    if (!values.title || !values.description) {
      toast.error('Vui lòng nhập tiêu đề và mô tả');
      return;
    }

    setSavingDraft(true);
    try {
      // Build media array
      const media = [
        ...mediaUrls.map((url, index) => ({
          type: 'IMAGE' as const,
          url,
          sortOrder: index,
        })),
        ...(videoUrl
          ? [{ type: 'VIDEO' as const, url: videoUrl, sortOrder: mediaUrls.length }]
          : []),
      ];

      await listingService.create({
        title: values.title,
        description: values.description,
        usageHistory: values.usageHistory || undefined,
        locationText: values.locationText || undefined,
        brandId: values.brandId ? Number(values.brandId) : undefined,
        categoryId: values.categoryId ? Number(values.categoryId) : undefined,
        sizeOptionId: values.sizeOptionId ? Number(values.sizeOptionId) : undefined,
        priceAmount: values.priceAmount ? Number(values.priceAmount) : 0,
        conditionNote: values.conditionNote || undefined,
        yearModel: values.yearModel ? Number(values.yearModel) : undefined,
        media,
        status: 'DRAFT',
      });
      
      toast.success('Đã lưu bản nháp');
      navigate('/seller/listings');
    } catch (error: any) {
      toast.error(error.message || 'Lưu bản nháp thất bại');
    } finally {
      setSavingDraft(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (mediaUrls.length === 0) {
      toast.error('Vui lòng upload ít nhất 1 ảnh');
      return;
    }

    setLoading(true);
    try {
      // Build media array
      const media = [
        ...mediaUrls.map((url, index) => ({
          type: 'IMAGE' as const,
          url,
          sortOrder: index,
        })),
        ...(videoUrl
          ? [{ type: 'VIDEO' as const, url: videoUrl, sortOrder: mediaUrls.length }]
          : []),
      ];

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
        media,
        status: 'PENDING_APPROVAL',
      });
      
      toast.success('Đã gửi tin đăng, chờ admin duyệt');
      navigate('/seller/listings');
    } catch (error: any) {
      toast.error(error.message || 'Đăng tin thất bại');
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
            <h2 className="text-2xl font-bold mb-6">Video (tùy chọn)</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Tải lên video giới thiệu xe đạp (tối đa 100MB)
            </p>
            <VideoUploader onUpload={setVideoUrl} />
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
                min="1"
                max="2027"
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
              type="text"
              value={displayPrice}
              onChange={handlePriceChange}
              error={errors.priceAmount}
              placeholder="50.000.000"
              required
            />
          </Card>

          <div className="flex gap-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/seller/listings')}
            >
              Hủy
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleSaveDraft}
              isLoading={savingDraft}
              disabled={loading}
            >
              Lưu bản nháp
            </Button>
            <Button
              type="submit"
              isLoading={loading}
              disabled={savingDraft}
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
