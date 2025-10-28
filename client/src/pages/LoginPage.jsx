import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import ParticleNetwork from '../components/ParticleNetwork';
import assets from '../assets/assets'; // For logo or avatar

const LoginPage = () => {
  const [currState, setCurrState] = useState('Login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [bio, setBio] = useState('');
  const [isDataSubmitted, setIsDataSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useContext(AuthContext);

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (currState === 'Sign up' && !isDataSubmitted) {
      setIsDataSubmitted(true);
      return;
    }
    try {
      await login(currState === 'Sign up' ? 'signup' : 'login', {
        fullName, 
        email,
        password,
        bio,
      });
      // handle navigation after login if needed
    } catch {
      // handle error (show toast or message)
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-900">
      <ParticleNetwork />
      <div className="relative z-10 bg-[#1b1637]/70 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl p-12 w-full max-w-xl flex flex-col items-center">
      <img src={assets.logo_icon} alt="Logo" className="w-20 mb-3" />
  <h1 className="text-4xl font-extrabold text-fuchsia-300 mb-2 tracking-wide">Vibe Chat</h1>
  <h2 className="text-3xl font-bold text-white mb-8">
  {currState === 'Sign up' ? 'Create Account' : 'Welcome Back'}
  </h2>
        <form onSubmit={onSubmitHandler} className="w-full flex flex-col gap-6">
          {currState === 'Sign up' && (
            <>
              <div>
                <label className="block text-gray-200 mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full px-5 py-3 rounded-lg bg-[#120e25] text-white text-lg border border-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                  placeholder="Enter your name"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-200 mb-1">Bio</label>
                <textarea
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  className="w-full px-5 py-3 rounded-lg bg-[#120e25] text-white text-lg border border-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                  placeholder="Tell us about yourself"
                  rows={3}
                />
              </div>
            </>
          )}
          <div>
            <label className="block text-gray-200 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-5 py-3 rounded-lg bg-[#1a1536] text-white text-lg border border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="relative">
            <label className="block text-gray-200 mb-1">Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-5 py-3 rounded-lg bg-[#120e25] text-white text-lg border border-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 pr-14"
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(p => !p)}
              className="absolute right-3 top-9 text-sm text-fuchsia-300 hover:text-fuchsia-200"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-fuchsia-500 to-indigo-600 text-white font-semibold py-3 rounded-lg shadow-lg hover:from-fuchsia-600 hover:to-indigo-700 transition text-lg"
          >
            {currState === 'Sign up' ? 'Sign Up' : 'Login'}
          </button>
        </form>
        <div className="mt-6 text-gray-300 text-sm">
          {currState === 'Sign up' ? (
            <>
              Already have an account?{' '}
              <button
                className="text-purple-400 hover:underline"
                onClick={() => setCurrState('Login')}
              >
                Login
              </button>
            </>
          ) : (
            <>
              Don't have an account?{' '}
              <button
                className="text-purple-400 hover:underline"
                onClick={() => setCurrState('Sign up')}
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;