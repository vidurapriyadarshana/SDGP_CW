import React from 'react';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from '../components/AdminDashboard';
import StudentDashboard from '../components/StudentDashboard';

export default function Dashboard() {
  const { user } = useAuth();

  if (user?.role === 'Admin' || user?.role === 'SuperAdmin') {
    return <AdminDashboard />;
  }

  return <StudentDashboard />;
}
