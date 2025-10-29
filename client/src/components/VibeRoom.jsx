import { useState, useContext, useRef, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { ChatContext } from "../../context/ChatContext";
import { assets } from "../assets/assets";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import YouTube from "react-youtube";

function getYouTubeEmbedUrl(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11
    ? `https://www.youtube.com/embed/${match[2]}`
    : null;
}

const VibeRoom = () => {
  const { authUser, socket } = useContext(AuthContext);
  const { friends, sendMessage: contextSendMessage } = useContext(ChatContext);
  const [videoUrl, setVideoUrl] = useState("");
  const [embedUrl, setEmbedUrl] = useState("");
  const [invitedUsers, setInvitedUsers] = useState([]);
  const [liveChat, setLiveChat] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const scrollEnd = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { roomId } = useParams();
  const playerRef = useRef();
  const isRemoteActionRef = useRef(false); // suppress echo when applying remote actions
  const lastEmitAtRef = useRef(0);
  // Support both legacy `video` (URL-encoded) and new `v` (base64-encoded) params
  const params = new URLSearchParams(location.search);
  const base64Param = params.get("v");
  const legacyParam = params.get("video");
  let videoParam = "";
  try {
    if (base64Param) {
      videoParam = decodeURIComponent(atob(base64Param));
    } else if (legacyParam) {
      // `URLSearchParams` already decodes percent-encoding
      videoParam = legacyParam;
    }
  } catch {
    videoParam = legacyParam || "";
  }

  useEffect(() => {
    if (videoParam) {
      setVideoUrl(videoParam);
      setEmbedUrl(getYouTubeEmbedUrl(videoParam));
    }
  }, [videoParam]);

  useEffect(() => {
    if (!socket) return;
    
    if (roomId) {
      socket.emit("join-viberoom", roomId);
    }
    
    // Listen for video actions
    const handleVideoAction = ({ action, time, state }) => {
      if (!playerRef.current) return;
      const ytPlayer = playerRef.current.internalPlayer;
      isRemoteActionRef.current = true;
      const applySeekIfNeeded = async () => {
        try {
          const current = await ytPlayer.getCurrentTime();
          if (typeof time === 'number' && Math.abs(current - time) > 0.25) {
            await ytPlayer.seekTo(time, true);
          }
        } catch {}
      };
      if (action === "seek") {
        applySeekIfNeeded();
      }
      if (action === "pause") {
        applySeekIfNeeded().then(() => ytPlayer.pauseVideo());
      }
      if (action === "play") {
        applySeekIfNeeded().then(() => ytPlayer.playVideo());
      }
      if (action === "sync") {
        applySeekIfNeeded().then(async () => {
          try {
            const currentState = await ytPlayer.getPlayerState();
            // Host paused => ensure paused; host playing => ensure playing
            if (state === 2 && currentState !== 2) ytPlayer.pauseVideo();
            if (state === 1 && currentState !== 1) ytPlayer.playVideo();
          } catch {}
        });
      }
      // Reset the remote flag shortly after to allow local events again
      setTimeout(() => { isRemoteActionRef.current = false; }, 50);
    };
    
    socket.on("video-action", handleVideoAction);
    
    return () => {
      socket.off("video-action", handleVideoAction);
    };
  }, [roomId, socket]);

  const handleInviteUser = (user) => {
    if (invitedUsers.includes(user._id)) return;
    if (invitedUsers.length >= 5) {
      toast.error("You can invite up to 5 users only.");
      return;
    }
    setInvitedUsers([...invitedUsers, user._id]);
  };

  const handleRemoveUser = (userId) => {
    setInvitedUsers(invitedUsers.filter(id => id !== userId));
  };

  const handleStartVibe = async () => {
    const embed = getYouTubeEmbedUrl(videoUrl);
    if (!embed) {
      toast.error("Please enter a valid YouTube video URL");
      return;
    }
    if (invitedUsers.length === 0) {
      toast.error("Invite at least one user to start the VibeRoom.");
      return;
    }
    setEmbedUrl(embed);
    toast.success("VibeRoom started! Enjoy together.");

    // Generate a unique room ID
    const newRoomId = uuidv4();

    // Send an invite message to each invited user
    for (const userId of invitedUsers) {
      await contextSendMessage({
        text: JSON.stringify({
          type: "viberoom-invite",
          from: authUser._id,
          fromName: authUser.fullName,
          to: userId,
          videoUrl,
          roomId: newRoomId,
        }),
        image: "",
      }, userId); // <-- Pass userId here!
    }

    // Navigate the creator to the room
    // Use base64 in query to avoid breaking on special characters
    const encoded = btoa(encodeURIComponent(videoUrl));
    navigate(`/viberoom/${newRoomId}?v=${encoded}`, { state: { isHost: true } });
  };

  const handleSendLiveChat = () => {
    if (!chatInput.trim()) return;
    setLiveChat([...liveChat, {
      sender: authUser.fullName,
      text: chatInput,
      time: new Date().toISOString(),
    }]);
    setChatInput("");
  };

  // Emit video actions (guard echoes and throttle)
  const handlePlayerStateChange = (event) => {
    if (!roomId || !socket) return;
    if (isRemoteActionRef.current) return;
    const ytPlayer = event.target;
    const state = ytPlayer.getPlayerState();
    const time = ytPlayer.getCurrentTime();
    const now = Date.now();
    if (now - lastEmitAtRef.current < 80) return; // basic debounce against rapid state flips
    lastEmitAtRef.current = now;
    if (state === 1) socket.emit("video-action", { roomId, action: "play", time });
    if (state === 2) socket.emit("video-action", { roomId, action: "pause", time });
  };

  const handlePlayerSeek = (event) => {
    if (!roomId || !socket) return;
    if (isRemoteActionRef.current) return;
    const ytPlayer = event.target;
    const time = ytPlayer.getCurrentTime();
    socket.emit("video-action", { roomId, action: "seek", time });
  };

  // Identify host (creator navigates with state flag)
  const isHost = !!(location.state && location.state.isHost === true);

  // Host heartbeat sync to correct drift
  useEffect(() => {
    if (!socket || !roomId || !isHost) return;
    const interval = setInterval(async () => {
      if (!playerRef.current) return;
      try {
        const ytPlayer = playerRef.current.internalPlayer;
        const time = await ytPlayer.getCurrentTime();
        const state = await ytPlayer.getPlayerState();
        socket.emit("video-action", { roomId, action: "sync", time, state });
      } catch {}
    }, 4000);
    return () => clearInterval(interval);
  }, [socket, roomId, isHost]);

  // Only show invite UI if NOT joining via invite link
  const showInviteUI = !videoParam;

  return (
    <div className="min-h-screen bg-[#1F2937] text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 py-3 px-4 border-b border-stone-500">
        <img
          src={authUser?.profilePic || assets.avatar_icon}
          alt={`${authUser?.fullName || 'User'} avatar`}
          className="w-8 h-8 rounded-full"
        />
        <p className="flex-1 text-lg font-semibold">
          VibeRoom: Watch YouTube Together
        </p>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row gap-4 p-4 overflow-hidden">
        {/* Video & Invite Section */}
        <div className="flex-1 bg-[#111827] rounded-lg p-4 flex flex-col mb-4 md:mb-0">
          {/* Only show invite UI if user is the creator */}
          {showInviteUI && (
            <>
              {/* YouTube Link Input & Invite */}
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium">Paste YouTube video URL:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="flex-1 p-2 bg-gray-800 rounded-lg outline-none text-white"
                  />
                  <button
                    onClick={handleStartVibe}
                    className="bg-violet-500 px-4 py-2 rounded-lg hover:bg-violet-600 whitespace-nowrap"
                  >
                    Start VibeRoom
                  </button>
                </div>
              </div>
              {/* Invite Users */}
              <div className="mb-4">
                <p className="mb-2 text-sm">Invite up to 5 friends:</p>
                <div className="flex flex-wrap gap-2">
                  {friends
                    .filter(u => u._id !== authUser._id)
                    .map(user => (
                      <button
                        key={user._id}
                        className={`px-3 py-1 rounded-full text-sm ${
                          invitedUsers.includes(user._id)
                            ? "bg-violet-500 text-white"
                            : "bg-gray-700 text-gray-300 hover:bg-violet-700"
                        }`}
                        onClick={() =>
                          invitedUsers.includes(user._id)
                            ? handleRemoveUser(user._id)
                            : handleInviteUser(user)
                        }
                      >
                        {user.fullName}
                        {invitedUsers.includes(user._id) && " ✓"}
                      </button>
                    ))}
                </div>
              </div>
            </>
          )}

          {/* Video Player */}
          <div className="flex-1 flex items-center justify-center min-h-[240px]">
            {embedUrl ? (
              <YouTube
                videoId={embedUrl?.split("/embed/")[1]}
                ref={playerRef}
                onStateChange={handlePlayerStateChange}
                onPlaybackRateChange={handlePlayerSeek}
                opts={{
                  width: "100%",
                  height: "400",
                  playerVars: { autoplay: 0 }
                }}
                className="rounded-lg aspect-video w-full max-h-[60vh] bg-black"
              />
            ) : (
              <div className="w-full aspect-video bg-black rounded-lg flex items-center justify-center text-gray-400">
                {showInviteUI
                  ? "Paste a YouTube link and invite friends to start!"
                  : "Waiting for video link..."}
              </div>
            )}
          </div>
        </div>

        {/* Live Chat Section */}
        <div className="w-full md:w-[370px] min-w-[260px] max-w-[400px] bg-[#111827] rounded-lg flex flex-col">
          <div className="flex-1 overflow-y-auto p-4">
            {liveChat.length === 0 && (
              <div className="text-gray-400 text-center mt-10">No messages yet. Start chatting!</div>
            )}
            {liveChat.map((msg, idx) => (
              <div
                key={idx}
                className={`flex items-end gap-2 mb-2 ${
                  msg.sender === authUser.fullName
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div className="relative">
                  <p
                    className={`p-2 max-w-[200px] text-sm font-light rounded-lg break-all ${
                      msg.sender === authUser.fullName
                        ? "bg-violet-500/30 rounded-br-none"
                        : "bg-gray-700 rounded-bl-none"
                    } text-white`}
                  >
                    <span className="font-semibold">{msg.sender}: </span>
                    {msg.text}
                  </p>
                </div>
              </div>
            ))}
            <div ref={scrollEnd}></div>
          </div>
          {/* Chat Input */}
          <div className="p-4 border-t border-gray-800">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendLiveChat()}
                placeholder="Type a message..."
                className="flex-1 bg-gray-800 rounded-full px-4 py-2 outline-none"
              />
              <button
                onClick={handleSendLiveChat}
                className="p-2 rounded-full bg-violet-500 hover:bg-violet-600"
              >
                <img src={assets.send_button} alt="Send" className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VibeRoom;