import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminDashboard from '@/components/admin/AdminDashboard';
import AdminAnalytics from './AdminAnalytics';
import AdminReports from './AdminReports';
import AdminCMS from './AdminCMS';
import AdminUsers from './AdminUsers';
import AdminLogs from './AdminLogs';
import AdminSettings from './AdminSettings';
import MediaUploadManager from '@/components/admin/MediaUploadManager';

const AdminRoutes = () => {
  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <AdminLayout title="Dashboard Administrativo">
            <AdminDashboard />
          </AdminLayout>
        } 
      />
      <Route 
        path="/analytics" 
        element={
          <AdminLayout title="Analytics">
            <AdminAnalytics />
          </AdminLayout>
        } 
      />
      <Route 
        path="/reports" 
        element={
          <AdminLayout title="Relatórios Executivos">
            <AdminReports />
          </AdminLayout>
        } 
      />
      <Route 
        path="/cms" 
        element={
          <AdminLayout title="Sistema de Gestão de Conteúdo">
            <AdminCMS />
          </AdminLayout>
        } 
      />
      <Route 
        path="/media" 
        element={
          <AdminLayout title="Gerenciamento de Mídia">
            <MediaUploadManager />
          </AdminLayout>
        } 
      />
      <Route 
        path="/users" 
        element={
          <AdminLayout title="Gestão de Usuários">
            <AdminUsers />
          </AdminLayout>
        } 
      />
      <Route 
        path="/logs" 
        element={
          <AdminLayout title="Logs de Atividade">
            <AdminLogs />
          </AdminLayout>
        } 
      />
      <Route 
        path="/settings" 
        element={
          <AdminLayout title="Configurações do Sistema">
            <AdminSettings />
          </AdminLayout>
        } 
      />
    </Routes>
  );
};

export default AdminRoutes;