import { Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import Dashboard from '@/pages/Dashboard';
import ComingSoon from '@/pages/ComingSoon';

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="job-posts" element={<ComingSoon title="Job Post Generator" description="Create recruitment announcements for LinkedIn, Instagram and Facebook." />} />
        <Route path="interview-kits" element={<ComingSoon title="Interview Kits" description="Generate structured interview questions and scorecards." />} />
        <Route path="candidates" element={<ComingSoon title="Candidate Pipeline" description="Track every candidate from application to hire." />} />
        <Route path="onboarding" element={<ComingSoon title="Onboarding" description="Automate role-based onboarding for new employees." />} />
        <Route path="messages" element={<ComingSoon title="HR Messages" description="Personalized, ready-to-send HR communication." />} />
        <Route path="settings" element={<ComingSoon title="Settings" description="Workspace preferences and demo data." />} />
        <Route path="*" element={<ComingSoon title="Page not found" description="The page you’re looking for doesn’t exist." />} />
      </Route>
    </Routes>
  );
}
