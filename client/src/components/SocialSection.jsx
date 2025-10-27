import React, { useContext, useState } from "react";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";
import assets from "../assets/assets";
import toast from "react-hot-toast";

const SocialSection = () => {
  const {
    allUsers, friends, sentRequests, receivedRequests, getSocialData
  } = useContext(ChatContext);
  const { axios } = useContext(AuthContext);
 
  const [loadingId, setLoadingId] = useState(null);
  const [search, setSearch] = useState("");

  // Users not friends, not sent/received requests
  const notFriends = allUsers.filter(
    u =>
      !friends.some(f => f._id === u._id) &&
      !sentRequests.some(r => r._id === u._id) &&
      !receivedRequests.some(r => r._id === u._id)
  ).filter(u => u.fullName.toLowerCase().includes(search.toLowerCase()));

  const handleAction = async (action, id) => {
    setLoadingId(id);
    try {
      if (action === "send") {
        const { data } = await axios.post("/api/auth/friend-request", { toId: id });
        if (data.success) toast.success("Friend request sent!");
        else toast.error(data.message);
      }
      if (action === "accept") {
        const { data } = await axios.post("/api/auth/friend-request/accept", { fromId: id });
        if (data.success) toast.success("Friend request accepted!");
        else toast.error(data.message);
      }
      if (action === "reject") {
        const { data } = await axios.post("/api/auth/friend-request/reject", { fromId: id });
        if (data.success) toast.success("Friend request rejected!");
        else toast.error(data.message);
      }
      await getSocialData();
    } catch {
      toast.error("Action failed");
    }
    setLoadingId(null);
  };

  return (
    <div className="p-4 min-w-[320px] max-w-[400px]">
      <h2 className="text-xl font-bold mb-3 text-purple-300">Add Friends</h2>
      <input
        type="text"
        placeholder="Search users..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full mb-3 px-3 py-2 rounded bg-[#1a1536] text-white border border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
      />
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {notFriends.length === 0 && (
          <div className="text-gray-400 text-sm">No users found.</div>
        )}
        {notFriends.map(user => (
          <div key={user._id} className="flex items-center gap-2 bg-[#282142] rounded p-2">
            <img src={user.profilePic || assets.avatar_icon} className="w-8 h-8 rounded-full" />
            <span className="flex-1">{user.fullName}</span>
            <button
              disabled={loadingId === user._id}
              onClick={() => handleAction("send", user._id)}
              className="bg-purple-500 px-2 py-1 rounded text-white hover:bg-purple-600 disabled:opacity-60"
            >
              {loadingId === user._id ? "Sending..." : "Add"}
            </button>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-bold mt-6 mb-3 text-purple-300">Friend Requests</h2>
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {receivedRequests.length === 0 && (
          <div className="text-gray-400 text-sm">No friend requests.</div>
        )}
        {receivedRequests.map(user => (
          <div key={user._id} className="flex items-center gap-2 bg-[#282142] rounded p-2">
            <img src={user.profilePic || assets.avatar_icon} className="w-8 h-8 rounded-full" />
            <span className="flex-1">{user.fullName}</span>
            <button
              disabled={loadingId === user._id}
              onClick={() => handleAction("accept", user._id)}
              className="bg-green-500 px-2 py-1 rounded text-white hover:bg-green-600 disabled:opacity-60"
            >
              {loadingId === user._id ? "Accepting..." : "Accept"}
            </button>
            <button
              disabled={loadingId === user._id}
              onClick={() => handleAction("reject", user._id)}
              className="bg-red-500 px-2 py-1 rounded text-white hover:bg-red-600 disabled:opacity-60"
            >
              {loadingId === user._id ? "Rejecting..." : "Reject"}
            </button>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-bold mt-6 mb-3 text-purple-300">Sent Requests</h2>
      <div className="space-y-2 max-h-32 overflow-y-auto">
        {sentRequests.length === 0 && (
          <div className="text-gray-400 text-sm">No sent requests.</div>
        )}
        {sentRequests.map(user => (
          <div key={user._id} className="flex items-center gap-2 bg-[#282142] rounded p-2">
            <img src={user.profilePic || assets.avatar_icon} className="w-8 h-8 rounded-full" />
            <span className="flex-1">{user.fullName}</span>
            <span className="text-gray-400 text-xs">Pending</span>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-bold mt-6 mb-3 text-purple-300">Your Friends</h2>
      <div className="space-y-2 max-h-32 overflow-y-auto">
        {friends.length === 0 && (
          <div className="text-gray-400 text-sm">No friends yet.</div>
        )}
        {friends.map(user => (
          <div key={user._id} className="flex items-center gap-2 bg-[#282142] rounded p-2">
            <img src={user.profilePic || assets.avatar_icon} className="w-8 h-8 rounded-full" />
            <span className="flex-1">{user.fullName}</span>
            <span className="text-green-400 text-xs">Friend</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SocialSection;