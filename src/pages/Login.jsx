import React, { useState } from 'react';
import { supabase } from '../supabase';
import { Link } from 'react-router-dom';

// Simple SVG for a loading spinner
const LoadingSpinner = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

// Simple SVG icon for Google
const GoogleIcon = () => (
    <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039L38.802 9.92C34.553 6.08 29.63 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path>
        <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039L38.802 9.92C34.553 6.08 29.63 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path>
        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"></path>
        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.012 36.494 44 30.836 44 24c0-1.341-.138-2.65-.389-3.917z"></path>
    </svg>
);

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
    }
    // The onAuthStateChange in App.jsx will handle the redirect
    setLoading(false);
  };
  
  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
    });
    if (error) {
        setErrorMsg('Error logging in with Google: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-100 p-4">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-5xl w-full grid md:grid-cols-2 gap-0">
        <div className="p-8 md:p-10 lg:p-12">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold mb-2 text-gray-800">Welcome Back</h1>
            <p className="text-gray-600">Please enter your details to log in</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
              <input 
                type="email" 
                id="email" 
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 outline-none transition duration-200" 
                placeholder="name@company.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input 
                type="password" 
                id="password" 
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 outline-none transition duration-200" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            {errorMsg && <div className="mt-2 text-sm text-red-600">{errorMsg}</div>}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 px-6 text-white font-medium rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition duration-200 flex items-center justify-center"
            >
              {loading ? <LoadingSpinner /> : 'Log In'}
            </button>
            
            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-gray-300 flex-grow"></div>
              <span className="bg-white px-3 text-gray-500 text-sm flex-shrink">or continue with</span>
              <div className="border-t border-gray-300 flex-grow"></div>
            </div>
            
            <button 
              type="button" 
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-3 px-6 flex items-center justify-center bg-white border border-gray-300 rounded-lg shadow-sm hover:shadow-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transform hover:-translate-y-0.5 transition duration-200"
            >
              <GoogleIcon />
              Log in with Google
            </button>
          </form>
          
          <p className="mt-8 text-center text-gray-600">
            Don't have an account?{" "}
            <Link to="/signup" className="text-indigo-600 hover:text-indigo-500 font-medium hover:underline transition duration-200">
              Sign up
            </Link>
          </p>
        </div>
        
        <div className="hidden md:block bg-gradient-to-br from-indigo-400 to-purple-600 p-12 relative">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1573164574572-cb89e39749b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')] opacity-20 mix-blend-overlay bg-center bg-cover"></div>
          <div className="relative h-full flex flex-col justify-between text-white">
            <div>
              <h2 className="text-3xl font-bold mb-6">Welcome Back!</h2>
              <p className="text-white/80 mb-8">Log in to access your files and continue where you left off. We're glad to see you again.</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="flex items-center mb-4">
                <img src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3MzkyNDZ8MHwxfHNlYXJjaHwxfHx1c2VyJTIwYXZhdGFyfGVufDB8fHx8MTc1NTE5NDY3MXww&ixlib=rb-4.1.0&q=80&w=1080" alt="User avatar" className="w-12 h-12 rounded-full mr-4" />
                <div>
                  <p className="text-white font-medium">Alex Rivera</p>
                  <p className="text-white/70 text-sm">Lead Developer</p>
                </div>
              </div>
              <p className="italic text-white/90">"The seamless login process is one of my favorite things about this platform. It's quick, secure, and gets me right to work."</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}