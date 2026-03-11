import { Modal } from 'antd';
import type { Listing } from '../../types';
import { formatDateTime } from '../../utils/format';
import { 
  CHECKLIST_ITEMS, 
  CONDITION_LABELS, 
  CONDITION_COLORS,
  type Checklist 
} from '../../config/inspectionChecklist';

interface InspectionDetailModalProps {
  listing: Listing | null;
  isOpen: boolean;
  onClose: () => void;
}

export const InspectionDetailModal = ({ listing, isOpen, onClose }: InspectionDetailModalProps) => {
  if (!listing || !listing.inspection) return null;

  let checklist: Checklist | null = null;
  try {
    if (listing.inspection.checklistJson) {
      checklist = JSON.parse(listing.inspection.checklistJson as any);
    }
  } catch (e) {
    console.error('Failed to parse checklist JSON:', e);
  }

  return (
    <Modal 
      open={isOpen} 
      onCancel={onClose}
      title={<span className="text-xl font-bold">Chi tiết kiểm định</span>}
      width={900}
      footer={null}
      style={{top: 10}}
    >
      <div className="space-y-6">
        <div className="flex gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
          <img 
            src={listing.media?.[0]?.url || 'https://via.placeholder.com/100'}
            alt={listing.title}
            className="w-24 h-24 rounded-lg object-cover"
          />
          <div>
            <h3 className="font-bold text-lg mb-1">{listing.title}</h3>
            <p className="text-sm text-slate-500">
              {listing.brandName} • {listing.categoryName}
            </p>
            <p className="text-sm text-green-600 font-semibold mt-1">
              {listing.status === 'VERIFIED' ? '✓ Đã xác thực' : listing.status}
            </p>
          </div>
        </div>

        {listing.inspection.inspector && (
          <div className="border-b pb-4">
            <p className="text-sm text-slate-500">Kiểm định viên</p>
            <p className="font-semibold">{listing.inspection.inspector.fullName}</p>
            <p className="text-xs text-slate-500 mt-1">
              {formatDateTime(listing.inspection.createdAt)}
            </p>
          </div>
        )}

        <div>
          <h4 className="font-semibold mb-2">Tóm tắt báo cáo</h4>
          <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line">
            {listing.inspection.summary}
          </p>
        </div>

        {checklist && (
          <div>
            <h4 className="font-semibold mb-3">Checklist chi tiết</h4>
            <div className="space-y-3">
              {CHECKLIST_ITEMS.map(item => {
                const checklistItem = checklist![item.id];
                if (!checklistItem || !checklistItem.condition) return null;

                return (
                  <div 
                    key={item.id}
                    className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h5 className="font-semibold">{item.label}</h5>
                        <p className="text-xs text-slate-500">{item.description}</p>
                      </div>
                      <span 
                        className={`ml-2 px-2 py-1 rounded text-xs font-semibold ${
                          CONDITION_COLORS[checklistItem.condition as keyof typeof CONDITION_COLORS]
                        }`}
                      >
                        {CONDITION_LABELS[checklistItem.condition as keyof typeof CONDITION_LABELS]}
                      </span>
                    </div>
                    {checklistItem.notes && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 pl-2 border-l-2 border-slate-300">
                        {checklistItem.notes}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {listing.inspection.reportUrl && (
          <div>
            <a 
              href={listing.inspection.reportUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <span className="material-symbols-outlined text-lg">description</span>
              Xem báo cáo PDF
            </a>
          </div>
        )}
      </div>
    </Modal>
  );
};
