import React from 'react';
import RealDataDashboard from './RealDataDashboard';
import MediaUploadManager from './MediaUploadManager';

const AdminDashboard = () => {
  return (
    <div className="space-y-6">
      <RealDataDashboard />
      
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Gerenciamento de Mídia</h3>
        <MediaUploadManager />
      </div>
    </div>
  );
};

export default AdminDashboard;