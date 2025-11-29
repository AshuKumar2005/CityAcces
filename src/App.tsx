import { useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import CitizenDashboard from './components/CitizenDashboard';
import AdminDashboard from './components/AdminDashboard';

function App() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Login />;
  }

  if (profile.role === 'admin') {
    return <AdminDashboard />;
  }

  return <CitizenDashboard />;
}

export default App;
