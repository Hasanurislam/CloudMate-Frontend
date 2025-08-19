import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from './supabase';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Trash from './pages/Trash';
import Shared from './pages/Shared'; // Import the new Shared page
import { Toaster } from 'react-hot-toast';


function App() {
  const [session, setSession] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session && location.pathname !== '/signup' && location.pathname !== '/login') {
        navigate('/login');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (session) {
          if (location.pathname === '/login' || location.pathname === '/signup') {
            navigate('/');
          }
        } else {
          if (location.pathname !== '/signup') {
            navigate('/login');
          }
        }
      }
    );
    console.log("API URL 👉", import.meta.env.VITE_API_URL);

    return () => subscription.unsubscribe();
  }, [navigate, location.pathname]);

  return (
    <>
     <Toaster // 2. Add the Toaster component here
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          success: {
            duration: 3000,
          },
          error: {
            duration: 5000,
          },
        }}
      />

    <Routes>
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/" element={session ? <Dashboard /> : <Login />} />
      <Route path="/trash" element={session ? <Trash /> : <Login />} />
      <Route path="/shared" element={session ? <Shared /> : <Login />} /> {/* Add the shared route */}
    </Routes>
    </>
  );
}

export default App;