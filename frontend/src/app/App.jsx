import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AppShell } from '../layouts/AppShell';
import { ParentShell } from '../layouts/ParentShell';
import { KidShell } from '../layouts/KidShell';
import { AuthLayout } from '../layouts/AuthLayout';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { SchoolsPage } from '../pages/SchoolsPage';
import { UsersPage } from '../pages/UsersPage';
import { ChildrenPage } from '../pages/ChildrenPage';
import { ChildProfilePage } from '../pages/ChildProfilePage';
import { ParentsPage } from '../pages/ParentsPage';
import { TeachersPage } from '../pages/TeachersPage';
import { ClassesPage } from '../pages/ClassesPage';
import { AttendancePage } from '../pages/AttendancePage';
import { FeesPage } from '../pages/FeesPage';
import { PaymentsPage } from '../pages/PaymentsPage';
import { ActivitiesPage } from '../pages/ActivitiesPage';
import { PickupPage } from '../pages/PickupPage';
import { AnnouncementsPage } from '../pages/AnnouncementsPage';
import { ReportsPage } from '../pages/ReportsPage';
import { ParentPortalPage } from '../pages/ParentPortalPage';
import { KidModePage } from '../pages/KidModePage';
import { SettingsPage } from '../pages/SettingsPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { LoadingState } from '../components/ui';

const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingState message="Authenticating session..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export const App = () => {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* School Management Experience */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="children" element={<ChildrenPage />} />
        <Route path="children/:id" element={<ChildProfilePage />} />
        <Route path="parents" element={<ParentsPage />} />
        <Route path="teachers" element={<TeachersPage />} />
        <Route path="classes" element={<ClassesPage />} />
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="fees" element={<FeesPage />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="activities" element={<ActivitiesPage />} />
        <Route path="pickup" element={<PickupPage />} />
        <Route path="communication" element={<AnnouncementsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="schools" element={<SchoolsPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Mobile-First Parent Portal Experience */}
      <Route
        path="/parent"
        element={
          <ProtectedRoute>
            <ParentShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<ParentPortalPage />} />
        <Route path="activities" element={<ParentPortalPage />} />
        <Route path="attendance" element={<ParentPortalPage />} />
        <Route path="fees" element={<ParentPortalPage />} />
        <Route path="pickup" element={<ParentPortalPage />} />
        <Route path="notices" element={<ParentPortalPage />} />
        <Route path="messages" element={<ParentPortalPage />} />
        <Route path="profile" element={<ParentPortalPage />} />
      </Route>

      {/* Safe Kid Mode Sandbox */}
      <Route
        path="/kid"
        element={
          <ProtectedRoute>
            <KidShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<KidModePage />} />
      </Route>

      {/* Root Redirection */}
      <Route path="/" element={<Navigate to="/app" replace />} />

      {/* 404 Catch-All */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
