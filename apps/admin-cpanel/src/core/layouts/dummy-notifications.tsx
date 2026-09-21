import type { NotificationItemProps } from '@teachedo/ui/legacy'

export const dummyNotifications: NotificationItemProps[] = [
  {
    variant: 'success',
    title: 'انضم معلم جديد',
    description: 'أنشأ أ. محمد عبدالله حسابه وبدأ باستخدام الخطة المجانية.',
    timestamp: 'منذ 5 دقائق',
    read: false,
  },
  {
    variant: 'warning',
    title: 'اقتراب من حد التخزين',
    description: 'وصل مستأجر "أكاديمية النور" إلى 9.2GB من أصل 10GB في الخطة المجانية.',
    timestamp: 'منذ ساعة',
    read: false,
    actions: [{ label: 'عرض التفاصيل', onClick: () => {} }],
  },
  {
    variant: 'info',
    title: 'دفعة جديدة مستحقة',
    description: '312 طالبًا نشطًا هذا الشهر — إجمالي 3,120 ج.م بحسب نظام الـ 10 ج.م لكل طالب.',
    timestamp: 'اليوم، 9:40 ص',
    read: true,
  },
  {
    variant: 'default',
    title: 'تحديث النظام مجدول',
    description: 'صيانة قصيرة يوم الخميس الساعة 2 صباحًا بتوقيت القاهرة.',
    timestamp: 'أمس',
    read: true,
  },
]