import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { MainLayout } from '../../layouts/MainLayout';
import { listingService } from '../../services/listing';
import { useCatalogStore } from '../../store/catalog';
import { Input, Textarea, Button, Card, Loading } from '../../components/ui';
import { ImageUploader } from '../../components/listing/ImageUploader';
import { VideoUploader } from '../../components/listing/VideoUploader';
import { useForm } from '../../hooks/useForm';

export const EditListingPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const { brands, categories, sizes, fetchAll } = useCatalogStore();

  const { values, errors, handleChange, setValues } = useForm({
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

  useEffect(() => {
    const fetchListing = async () => {
      if (!id) return;
      
      try {
        const data = await listingService.getById(Number(id));
        
        // Check if listing is editable (only DRAFT can be edited)
        if (data.status !== 'DRAFT') {
          toast.error('Chỉ có thể sửa listing ở trạng thái bản nháp');
          navigate('/seller/listings');
          return;
        }
        
        setValues({
          title: data.title,
          description: data.description,
          usageHistory: data.usageHistory || '',
          locationText: data.locationText || '',
          brandId: data.brandId?.toString() || '',
          categoryId: data.categoryId?.toString() || '',
          sizeOptionId: data.sizeOptionId?.toString() || '',
          priceAmount: data.priceAmount.toString(),
          conditionNote: data.conditionNote || '',
          yearModel: data.yearModel?.toString() || '',
        });
        
        // Load images and video
        const images = data.media?.filter(m => m.type === 'IMAGE').map(m => m.url) || [];
        const video = data.media?.find(m => m.type === 'VIDEO');
        
        setMediaUrls(images);
        setVideoUrl(video?.url || null);
      } catch (error: any) {
        toast.error(error.message || 'Không thể tải listing');
        navigate('/seller/listings');
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id, navigate, setValues]);

  const handleSaveDraft = async () => {
    if (!id) return;
    
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

      await listingService.update(Number(id), {
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
      
      toast.success('Đã cập nhật bản nháp');
      navigate('/seller/listings');
    } catch (error: any) {
      toast.error(error.message || 'Cập nhật thất bại');
    } finally {
      setSavingDraft(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!id) return;
    
    if (mediaUrls.length === 0) {
      toast.error('Vui lòng upload ít nhất 1 ảnh');
      return;
    }

    setSubmitting(true);
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

      await listingService.update(Number(id), {
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
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <Loading fullScreen />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-black mb-2">Chỉnh sửa tin đăng</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Cập nhật thông tin và đăng tin
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <Card>
            <h2 className="text-2xl font-bold mb-6">Hình ảnh</h2>
            <ImageUploader onUpload={setMediaUrls} maxFiles={10} />
            {mediaUrls.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-4">
                {mediaUrls.map((url, index) => (
                  <img key={index} src={url} alt={`Preview ${index + 1}`} className="w-full h-32 object-cover rounded" />
                ))}
              </div>
            )}
          </Card>

          <Card>
            <h2 className="text-2xl font-bold mb-6">Video (tùy chọn)</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Tải lên video giới thiệu xe đạp (tối đa 100MB)
            </p>
            <VideoUploader onUpload={setVideoUrl} existingUrl={videoUrl || undefined} />
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
            >
              Hủy
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleSaveDraft}
              isLoading={savingDraft}
              disabled={submitting}
            >
              💾 Lưu bản nháp
            </Button>
            <Button
              type="submit"
              isLoading={submitting}
              disabled={savingDraft}
              className="flex-1"
            >
              📤 Đăng tin
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};
