import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import GroupDetailPage from './pages/GroupDetailPage.jsx';
import Navbar from './components/Navbar.jsx';
import { useAuth } from './context/AuthContext.jsx';

function App() {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        {user && <Navbar />}
        <main className="flex-1 bg-gray-50 p-4 md:p-8">
          <Routes>
            <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
            <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/" />} />
            <Route path="/" element={user ? <DashboardPage /> : <Navigate to="/login" />} />
            <Route path="/groups/:id" element={user ? <GroupDetailPage /> : <Navigate to="/login" />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
