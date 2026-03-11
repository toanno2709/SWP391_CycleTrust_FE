import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { MainLayout } from '../../layouts/MainLayout';
import { listingService } from '../../services/listing';
import { uploadService } from '../../services/upload';
import type { Listing, CreateInspectionRequest } from '../../types';
import { formatCurrency } from '../../utils/format';
import { Card, Loading, Button } from '../../components/ui';
import { ROUTES } from '../../config/constants';
import { 
  CHECKLIST_ITEMS, 
  CONDITION_LABELS, 
  CONDITION_COLORS,
  type Checklist,
  type ChecklistCondition 
} from '../../config/inspectionChecklist';

export const InspectionFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [summary, setSummary] = useState('');
  const [reportUrl, setReportUrl] = useState('');
  const [reportFile, setReportFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [checklist, setChecklist] = useState<Checklist>(() => {
    const initial: Checklist = {};
    CHECKLIST_ITEMS.forEach(item => {
      initial[item.id] = { condition: '', notes: '' };
    });
    return initial;
  });

  useEffect(() => {
    const fetchListing = async () => {
      try {
        if (!id) return;
        const data = await listingService.getById(Number(id));
        setListing(data);
        
        // If inspection exists, populate form
        if (data.inspection) {
          setSummary(data.inspection.summary);
          setReportUrl(data.inspection.reportUrl || '');
          if (data.inspection.checklistJson) {
            try {
              const parsedChecklist = JSON.parse(data.inspection.checklistJson as any);
              setChecklist(parsedChecklist);
            } catch (e) {
              console.error('Failed to parse checklist');
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch listing:', error);
        toast.error('Không thể tải thông tin listing');
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  const handleChecklistChange = (itemId: string, field: 'condition' | 'notes', value: string) => {
    setChecklist(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value,
      },
    }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type (PDF or images)
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        toast.error('Chỉ chấp nhận file PDF hoặc ảnh (JPG, PNG)');
        return;
      }
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File không được vượt quá 10MB');
        return;
      }
      setReportFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!summary.trim()) {
      toast.error('Vui lòng nhập tóm tắt báo cáo');
      return;
    }

    // Check if all items have condition
    const allItemsChecked = CHECKLIST_ITEMS.every(item => checklist[item.id].condition !== '');
    if (!allItemsChecked) {
      toast.error('Vui lòng đánh giá tình trạng tất cả các mục');
      return;
    }

    try {
      setSubmitting(true);
      
      // Upload file if selected and not already uploaded
      let finalReportUrl = reportUrl;
      if (reportFile) {
        try {
          setUploading(true);
          const uploadedUrl = await uploadService.uploadInspectionReport(reportFile);
          finalReportUrl = uploadedUrl;
          setReportUrl(uploadedUrl);
          setReportFile(null);
          toast.success('Upload file thành công');
        } catch (error) {
          toast.error('Upload file thất bại');
          return;
        } finally {
          setUploading(false);
        }
      }

      const requestData: CreateInspectionRequest = {
        summary: summary.trim(),
        checklistJson: JSON.stringify(checklist),
        reportUrl: finalReportUrl.trim() || undefined,
      };

      // Check if inspection exists to determine create or update
      const isUpdate = !!(listing && listing.status === 'VERIFIED' && listing.inspection);

      if (isUpdate) {
        await listingService.updateInspection(Number(id), requestData);
        toast.success('Cập nhật báo cáo kiểm định thành công!');
      } else {
        await listingService.createInspection(Number(id), requestData);
        toast.success('Tạo báo cáo kiểm định thành công!');
      }
      navigate(ROUTES.INSPECTOR_LISTINGS);
    } catch (error: any) {
      toast.error(error.message || 'Thao tác thất bại');
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

  if (!listing) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-6 py-12">
          <Card>
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">error</span>
              <p className="text-slate-500">Không tìm thấy listing</p>
            </div>
          </Card>
        </div>
      </MainLayout>
    );
  }

  const isReadOnly = false; // Allow editing for inspectors and admins

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-black">
            {listing.inspection ? 'Chỉnh sửa báo cáo kiểm định' : 'Tạo báo cáo kiểm định'}
          </h1>
          <button
            onClick={() => navigate(ROUTES.INSPECTOR_LISTINGS)}
            className="text-green-600 hover:text-green-700 font-semibold flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Quay lại
          </button>
        </div>

        <Card className="mb-6">
          <div className="flex items-center gap-4">
            <img
              src={listing.media?.[0]?.url || 'https://via.placeholder.com/150'}
              alt={listing.title}
              className="w-32 h-32 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h2 className="font-bold text-2xl mb-2">{listing.title}</h2>
              <p className="text-sm text-slate-500 mb-2">
                {listing.brandName} • {listing.categoryName} • {listing.sizeLabel}
              </p>
              <p className="text-green-600 font-bold text-lg">
                {formatCurrency(listing.priceAmount, listing.currency)}
              </p>
            </div>
          </div>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <h3 className="text-xl font-bold mb-4">Checklist kiểm định</h3>
            <div className="space-y-4">
              {CHECKLIST_ITEMS.map(item => (
                <div key={item.id} className="border-b border-slate-200 dark:border-slate-800 pb-4 last:border-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold">{item.label}</h4>
                      <p className="text-sm text-slate-500">{item.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mb-2">
                    {(['excellent', 'good', 'fair', 'poor'] as ChecklistCondition[]).map(condition => (
                      <button
                        key={condition}
                        type="button"
                        disabled={isReadOnly}
                        onClick={() => handleChecklistChange(item.id, 'condition', condition)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                          checklist[item.id].condition === condition
                            ? `${CONDITION_COLORS[condition].bg} text-white`
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                        } ${isReadOnly ? 'cursor-not-allowed opacity-50' : ''}`}
                      >
                        {CONDITION_LABELS[condition]}
                      </button>
                    ))}
                  </div>
                  
                  <textarea
                    value={checklist[item.id].notes}
                    onChange={(e) => handleChecklistChange(item.id, 'notes', e.target.value)}
                    placeholder="Ghi chú thêm..."
                    disabled={isReadOnly}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 dark:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    rows={2}
                  />
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="text-xl font-bold mb-4">Tóm tắt và báo cáo</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block font-semibold mb-2">
                  Tóm tắt đánh giá <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Nhập tóm tắt đánh giá chung về xe..."
                  disabled={isReadOnly}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 dark:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  rows={5}
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-2">
                  File báo cáo chi tiết (tùy chọn)
                </label>
                <p className="text-sm text-slate-500 mb-3">
                  Upload file PDF hoặc ảnh báo cáo kiểm định (tối đa 10MB)
                </p>
                
                <div className="space-y-3">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileSelect}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 dark:bg-slate-900"
                  />
                  {reportFile && !uploading && (
                    <p className="text-sm text-slate-600">
                      <span className="material-symbols-outlined text-sm align-middle">description</span>
                      {reportFile.name} ({(reportFile.size / 1024 / 1024).toFixed(2)} MB)
                      <span className="text-green-600 ml-2">- Sẽ tự động upload khi submit</span>
                    </p>
                  )}
                  {uploading && (
                    <p className="text-sm text-blue-600">
                      <span className="material-symbols-outlined text-sm align-middle animate-spin">sync</span>
                      Đang upload file...
                    </p>
                  )}
                </div>
                
                {reportUrl && !reportFile && (
                  <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <p className="text-sm text-green-800 dark:text-green-300 flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg">check_circle</span>
                      File đã upload thành công
                    </p>
                    <a
                      href={reportUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-green-600 hover:text-green-700 underline mt-1 inline-block"
                    >
                      Xem file báo cáo
                    </a>
                  </div>
                )}
              </div>
            </div>
          </Card>

          <div className="flex gap-4">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={submitting || uploading}
              className="flex-1"
            >
              {listing.inspection ? 'Cập nhật kiểm định' : 'Xác nhận kiểm định'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={() => navigate(ROUTES.INSPECTOR_LISTINGS)}
            >
              Hủy
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};
