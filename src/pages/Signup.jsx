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


export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSignup = async (event) => {
    event.preventDefault();
    setMessage('');
    setErrorMsg('');

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
    } else {
      setMessage('Success! Please check your email to confirm your account.');
    }
    setLoading(false);
  };
  
  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
    });
    if (error) {
        setErrorMsg('Error signing up with Google: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-100 p-4">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-5xl w-full grid md:grid-cols-2 gap-0">
        <div className="p-8 md:p-10 lg:p-12">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold mb-2 text-gray-800">Create your account</h1>
            <p className="text-gray-600">Start your journey with us today</p>
          </div>
          
          <form onSubmit={handleSignup} className="space-y-6">
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
            
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input 
                type="password" 
                id="confirm-password" 
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 outline-none transition duration-200" 
                placeholder="••••••••" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            
            {errorMsg && <div className="mt-2 text-sm text-red-600">{errorMsg}</div>}
            {message && <div className="mt-2 text-sm text-green-600">{message}</div>}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 px-6 text-white font-medium rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition duration-200 flex items-center justify-center"
            >
              {loading && !errorMsg ? <LoadingSpinner /> : 'Create account'}
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
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google logo" className="w-5 h-5 mr-2" />
              Sign up with Google
            </button>
          </form>
          
          <p className="mt-8 text-center text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-indigo-600 hover:text-indigo-500 font-medium hover:underline transition duration-200">
              Log in
            </Link>
          </p>
        </div>
        
        <div className="hidden md:block bg-gradient-to-br from-indigo-400 to-purple-600 p-12 relative">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1573164574572-cb89e39749b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')] opacity-20 mix-blend-overlay bg-center bg-cover"></div>
          <div className="relative h-full flex flex-col justify-between text-white">
            <div>
              <h2 className="text-3xl font-bold mb-6">Start your journey with us</h2>
              <p className="text-white/80 mb-8">Join thousands of users who trust our platform for their daily tasks. Experience the difference today.</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="flex items-center mb-4">
                <img src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3MzkyNDZ8MHwxfHNlYXJjaHwxfHx1c2VyJTIwYXZhdGFyfGVufDB8fHx8MTc1NTE5NDY3MXww&ixlib=rb-4.1.0&q=80&w=1080" alt="User avatar" className="w-12 h-12 rounded-full mr-4" />
                <div>
                  <p className="text-white font-medium">Sarah Johnson</p>
                  <p className="text-white/70 text-sm">Product Designer</p>
                </div>
              </div>
              <p className="italic text-white/90">"This platform has completely transformed how I manage my projects. The interface is intuitive and the features are exactly what I needed."</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
