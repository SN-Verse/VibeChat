import React, { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ParticleNetwork from '../components/ParticleNetwork';
import assets from '../assets/assets'; // Import your assets

const ProfilePage = () => {
  const { authUser, updateProfile } = useContext(AuthContext);
  const [selectedImg, setSelectedImg] = useState(null);
  const [name, setName] = useState(authUser.fullName);
  const [bio, setBio] = useState(authUser.bio);
  const navigate = useNavigate();

  const handleImgChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImg(e.target.files[0]);
    }
  }; 

  const profilePicSrc = selectedImg
    ? URL.createObjectURL(selectedImg)
    : authUser.profilePic
      ? authUser.profilePic
      : assets.avatar_icon; // Use placeholder if no profilePic

  const handleSubmit = async (e) => {
    e.preventDefault();

    let profilePic = authUser.profilePic;

    if (selectedImg) {
      // Convert image to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        profilePic = reader.result;
        await updateProfile({ fullName: name, bio, profilePic });
        setSelectedImg(null);
        navigate('/');
      };
      reader.readAsDataURL(selectedImg);
    } else {
      await updateProfile({ fullName: name, bio, profilePic });
      navigate('/');
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-900">
      <ParticleNetwork />
      <div className="relative z-10 bg-[#282142]/90 rounded-xl shadow-2xl p-8 w-full max-w-md flex flex-col items-center">
        <h2 className="text-2xl font-bold text-white mb-6">Edit Profile</h2>
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
          <div className="flex flex-col items-center gap-2">
            <img
              src={profilePicSrc}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-4 border-purple-400 shadow"
            />
            <label className="cursor-pointer text-purple-300 hover:underline">
              Change Photo
              <input
                type="file"
                accept="image/*"
                onChange={handleImgChange}
                className="hidden"
              />
            </label>
          </div>
          <div>
            <label className="block text-gray-200 mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
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
              rows={3}
            />
          </div>
          <div className="flex gap-3 mt-4">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-purple-400 to-violet-600 text-white font-semibold py-2 rounded shadow hover:from-purple-500 hover:to-violet-700 transition"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex-1 bg-gray-700 text-gray-200 font-semibold py-2 rounded hover:bg-gray-600 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;

