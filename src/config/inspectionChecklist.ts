export const CHECKLIST_ITEMS = [
  { id: 'frame', label: 'Khung xe', description: 'Kiểm tra tình trạng khung xe, vết trầy, rỉ sét' },
  { id: 'wheels', label: 'Bánh xe', description: 'Kiểm tra mâm, nan hoa, lốp xe' },
  { id: 'brakes', label: 'Phanh', description: 'Kiểm tra cơ cấu phanh trước và sau' },
  { id: 'gears', label: 'Hệ thống chuyển số', description: 'Kiểm tra đĩa, líp, móc xe' },
  { id: 'chain', label: 'Xích', description: 'Kiểm tra độ mòn và căng của xích' },
  { id: 'saddle', label: 'Yên xe', description: 'Kiểm tra tình trạng yên và trụ yên' },
  { id: 'handlebars', label: 'Ghi đông', description: 'Kiểm tra ghi đông và tay cầm' },
  { id: 'accessories', label: 'Phụ kiện', description: 'Kiểm tra đèn, chuông, giá đỡ' },
] as const;

export type ChecklistItemId = typeof CHECKLIST_ITEMS[number]['id'];

export type ChecklistCondition = 'excellent' | 'good' | 'fair' | 'poor';

export const CONDITION_LABELS: Record<ChecklistCondition, string> = {
  excellent: 'Tuyệt vời',
  good: 'Tốt',
  fair: 'Khá',
  poor: 'Kém',
};

export const CONDITION_COLORS: Record<ChecklistCondition, { bg: string; text: string }> = {
  excellent: { bg: 'bg-green-600', text: 'text-green-600' },
  good: { bg: 'bg-blue-600', text: 'text-blue-600' },
  fair: { bg: 'bg-orange-600', text: 'text-orange-600' },
  poor: { bg: 'bg-red-600', text: 'text-red-600' },
};

export type ChecklistItem = {
  condition: ChecklistCondition | '';
  notes: string;
};

export type Checklist = Record<string, ChecklistItem>;
