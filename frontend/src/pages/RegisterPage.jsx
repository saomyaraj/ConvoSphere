// =============================================================================
// frontend/src/pages/RegisterPage.jsx
// Registration form component
// =============================================================================
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserPlus } from 'lucide-react';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { register, error, loading, clearError } = useAuth();
  const [localError, setLocalError] = useState(''); // For client-side validation like password mismatch
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError(); // Clear backend errors
    setLocalError(''); // Clear frontend errors

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match!');
      return;
    }
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters long.');
      return;
    }
     if (username.length < 3) {
      setLocalError('Username must be at least 3 characters long.');
      return;
    }


    const success = await register(username, password);
    if (success) {
      navigate('/chat'); // Redirect to chat page on successful registration
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-100 via-teal-100 to-cyan-200 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8 space-y-6 animate-fade-in">
        <div className="text-center">
          <UserPlus className="mx-auto h-12 w-auto text-teal-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-teal-600 hover:text-teal-500">
              Sign in
            </Link>
          </p>
        </div>

        {(error || localError) && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error || localError}</span>
             <button onClick={() => { clearError(); setLocalError(''); }} className="absolute top-0 bottom-0 right-0 px-4 py-3">
               <span className="text-red-500 text-xl">×</span>
            </button>
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
              placeholder="Choose a username (min 3 chars)"
            />
          </div>

          <div>
            <label htmlFor="password" required className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
              placeholder="Create a password (min 6 chars)"
            />
          </div>

           <div>
            <label htmlFor="confirm-password" required className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              id="confirm-password"
              name="confirm-password"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
              placeholder="Confirm your password"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition duration-150 ease-in-out ${
                loading
                  ? 'bg-teal-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700'
              }`}
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;