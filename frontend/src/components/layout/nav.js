import {
  LayoutDashboard,
  Megaphone,
  ClipboardList,
  Users,
  Rocket,
  MessageSquareText,
  Settings,
} from 'lucide-react';

export const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/job-posts', label: 'Job Posts', icon: Megaphone },
  { to: '/interview-kits', label: 'Interview Kits', icon: ClipboardList },
  { to: '/candidates', label: 'Candidates', icon: Users, countKey: 'active_candidates' },
  { to: '/onboarding', label: 'Onboarding', icon: Rocket, countKey: 'pending_onboarding_tasks' },
  { to: '/messages', label: 'HR Messages', icon: MessageSquareText },
];

export const SECONDARY_NAV = [{ to: '/settings', label: 'Settings', icon: Settings }];

export const ALL_PAGES = [...NAV_ITEMS, ...SECONDARY_NAV];
