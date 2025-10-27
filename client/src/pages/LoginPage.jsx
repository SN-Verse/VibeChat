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
      <div className="relative z-10 bg-[#282142]/90 rounded-xl shadow-2xl p-8 w-full max-w-md flex flex-col items-center">
      <img src={assets.logo_icon} alt="Logo" className="w-16 mb-2" />
  <h1 className="text-3xl font-extrabold text-purple-300 mb-1 tracking-wide">Vibe Chat</h1>
  <h2 className="text-2xl font-bold text-white mb-6">
  {currState === 'Sign up' ? 'Create Account' : 'Welcome Back'}
  </h2>
        <form onSubmit={onSubmitHandler} className="w-full flex flex-col gap-5">
          {currState === 'Sign up' && (
            <>
              <div>
                <label className="block text-gray-200 mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full px-4 py-2 rounded bg-[#1a1536] text-white border border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter your name"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-200 mb-1">Bio</label>
                <textarea
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  className="w-full px-4 py-2 rounded bg-[#1a1536] text-white border border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Tell us about yourself"
                  rows={2}
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
              className="w-full px-4 py-2 rounded bg-[#1a1536] text-white border border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter your email"
              required
            />
          </div>
          <div>
            <label className="block text-gray-200 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded bg-[#1a1536] text-white border border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter your password"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-gradient-to-r from-purple-400 to-violet-600 text-white font-semibold py-2 rounded shadow hover:from-purple-500 hover:to-violet-700 transition"
          >
            {currState === 'Sign up' ? 'Sign Up' : 'Login'}
          </button>
        </form>
        <div className="mt-4 text-gray-300">
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