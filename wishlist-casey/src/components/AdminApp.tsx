import { useAuth } from '../hooks/useAuth';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';

export default function AdminApp() {
  const { isAuthed, loading } = useAuth();

  if (loading) return <div className="aShell" />;
  return <div className="aShell">{isAuthed ? <AdminDashboard /> : <AdminLogin />}</div>;
}
