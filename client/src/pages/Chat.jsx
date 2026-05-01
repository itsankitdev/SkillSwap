import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Send, ArrowLeft, MessageCircle, Zap } from "lucide-react";
import api from "../api/axios";
import useAuth from "../hooks/useAuth";
import { useSocket } from "../context/SocketContext";
import { getInitials, formatDate } from "../utils/helpers";
import Loader from "../components/common/Loader";
import toast from "react-hot-toast";
import ScheduleModal from "../components/chat/ScheduleModal";
import SessionCard from "../components/chat/SessionCard";
import { CalendarPlus } from "lucide-react";

const Chat = () => {
  const { conversationId } = useParams();
  const { user } = useAuth();
  const { socket } = useSocket();

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const [typingUser, setTypingUser] = useState("");
  const [activeConvo, setActiveConvo] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [sessions, setSessions] = useState([]);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch conversations list
  useEffect(() => {
    api
      .get("/chat")
      .then(({ data }) => setConversations(data.data.conversations))
      .catch(() => toast.error("Failed to load conversations"))
      .finally(() => setLoading(false));
  }, []);

  // Fetch messages when conversation selected
  useEffect(() => {
    if (!conversationId) return;

    const convo = conversations.find((c) => c._id === conversationId);
    setActiveConvo(convo || null);

    Promise.all([
      api.get(`/chat/${conversationId}`),
      api.get(`/sessions?conversationId=${conversationId}`), // ← add this
    ])
      .then(([msgRes, sessionRes]) => {
        setMessages(msgRes.data.data.messages);
        setSessions(sessionRes.data.data.sessions);
        scrollToBottom();
      })
      .catch(() => toast.error("Failed to load chat"));
  }, [conversationId, conversations]);

  // Socket events
  useEffect(() => {
    if (!socket || !conversationId) return;

    socket.emit("join_conversation", conversationId);

    socket.on("receive_message", (message) => {
      setMessages((prev) => [...prev, message]);
      scrollToBottom();
    });

    socket.on("user_typing", ({ name }) => {
      setTypingUser(name);
      setTyping(true);
    });

    socket.on("user_stop_typing", () => {
      setTyping(false);
      setTypingUser("");
    });

    return () => {
      socket.emit("leave_conversation", conversationId);
      socket.off("receive_message");
      socket.off("user_typing");
      socket.off("user_stop_typing");
    };
  }, [socket, conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle typing indicator
  const handleTyping = (e) => {
    setText(e.target.value);
    if (!socket || !conversationId) return;

    socket.emit("typing", conversationId);
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", conversationId);
    }, 1500);
  };

  // Send message
  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || sending) return;

    setSending(true);
    try {
      const { data } = await api.post(`/chat/${conversationId}`, { text });
      const newMessage = data.data.message;

      setMessages((prev) => [...prev, newMessage]);
      setText("");
      scrollToBottom();

      // Emit to other user via socket
      socket?.emit("send_message", {
        conversationId,
        ...newMessage,
      });

      socket?.emit("stop_typing", conversationId);
    } catch {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  // Get the other participant
  const getOtherParticipant = (convo) => {
    return convo?.participants?.find((p) => p._id !== user._id);
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex gap-5 h-[calc(100vh-140px)]">
        {/* ── Conversations Sidebar ── */}
        <div className="w-80 shrink-0 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-50">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <MessageCircle size={18} className="text-indigo-600" />
              Messages
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="text-center py-12 px-4">
                <MessageCircle
                  size={36}
                  className="text-gray-200 mx-auto mb-3"
                />
                <p className="text-sm text-gray-500 font-medium">
                  No conversations yet
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Accept a swap request to start chatting
                </p>
              </div>
            ) : (
              conversations.map((convo) => {
                const other = getOtherParticipant(convo);
                const isActive = convo._id === conversationId;
                const isUnread = !convo.lastMessage?.seenBy?.includes(user._id);

                return (
                  <Link
                    key={convo._id}
                    to={`/chat/${convo._id}`}
                    className={`flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 ${
                      isActive
                        ? "bg-indigo-50 border-l-2 border-l-indigo-600"
                        : ""
                    }`}
                  >
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-500 text-white font-bold flex items-center justify-center text-sm shrink-0">
                      {getInitials(other?.name)}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p
                          className={`text-sm font-semibold truncate ${isActive ? "text-indigo-700" : "text-gray-800"}`}
                        >
                          {other?.name}
                        </p>
                        {isUnread && (
                          <span className="w-2 h-2 bg-indigo-600 rounded-full shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-gray-400 truncate mt-0.5">
                        {convo.lastMessage?.text || "No messages yet"}
                      </p>
                      {/* Skill swap context */}
                      {convo.swapRequest && (
                        <p className="text-xs text-indigo-500 truncate mt-0.5">
                          {convo.swapRequest.offeredSkill?.title} ↔{" "}
                          {convo.swapRequest.wantedSkill?.title}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* ── Chat Window ── */}
        <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
          {!conversationId ? (
            /* No conversation selected */
            <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
                <MessageCircle size={28} className="text-indigo-400" />
              </div>
              <h3 className="font-bold text-gray-700 mb-2">
                Select a conversation
              </h3>
              <p className="text-sm text-gray-400 max-w-xs">
                Choose a conversation from the left to start chatting with your
                skill swap partner
              </p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="flex items-center gap-3 p-4 border-b border-gray-50">
                <Link
                  to="/chat"
                  className="md:hidden text-gray-400 hover:text-gray-600"
                >
                  <ArrowLeft size={18} />
                </Link>
                {activeConvo && (
                  <>
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-500 text-white font-bold flex items-center justify-center text-sm">
                      {getInitials(getOtherParticipant(activeConvo)?.name)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">
                        {getOtherParticipant(activeConvo)?.name}
                      </p>
                      {activeConvo.swapRequest && (
                        <p className="text-xs text-gray-400">
                          {activeConvo.swapRequest.offeredSkill?.title} ↔{" "}
                          {activeConvo.swapRequest.wantedSkill?.title}
                        </p>
                      )}
                    </div>
                  </>
                )}

                {/* Schedule button */}
                <button
                  onClick={() => setShowScheduleModal(true)}
                  className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-semibold px-3 py-2 rounded-xl transition-colors border border-indigo-100"
                >
                  <CalendarPlus size={14} /> Schedule
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                {messages.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                    <p className="text-gray-400 text-sm">No messages yet</p>
                    <p className="text-gray-300 text-xs mt-1">
                      Say hi to get started! 👋
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe =
                      msg.sender?._id === user._id || msg.sender === user._id;
                    const isSystem = msg.type === "system";

                    if (isSystem) {
                      // Check if it's a session message
                      const sessionId = msg.metadata?.sessionId;
                      const relatedSession = sessions.find(
                        (s) => s._id === sessionId?.toString(),
                      );

                      if (
                        relatedSession &&
                        msg.metadata?.type === "session_proposed"
                      ) {
                        return (
                          <div key={msg._id} className="px-2">
                            <SessionCard
                              session={relatedSession}
                              onUpdated={(updatedSession) => {
                                setSessions((prev) =>
                                  prev.map((s) =>
                                    s._id === updatedSession._id
                                      ? updatedSession
                                      : s,
                                  ),
                                );
                                // Refresh messages to get new system message
                                api
                                  .get(`/chat/${conversationId}`)
                                  .then(({ data }) =>
                                    setMessages(data.data.messages),
                                  );
                              }}
                            />
                          </div>
                        );
                      }

                      return (
                        <div key={msg._id} className="flex justify-center">
                          <span className="text-xs bg-indigo-50 text-indigo-500 px-3 py-1.5 rounded-full font-medium">
                            {msg.text}
                          </span>
                        </div>
                      );
                    }

                    // Regular message — same as before
                    return (
                      <div
                        key={msg._id}
                        className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}
                      >
                        {!isMe && (
                          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-400 to-violet-500 text-white font-bold flex items-center justify-center text-xs shrink-0">
                            {getInitials(msg.sender?.name)}
                          </div>
                        )}
                        <div
                          className={`max-w-[70%] flex flex-col gap-1 ${isMe ? "items-end" : "items-start"}`}
                        >
                          <div
                            className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                              isMe
                                ? "bg-indigo-600 text-white rounded-br-sm"
                                : "bg-gray-100 text-gray-800 rounded-bl-sm"
                            }`}
                          >
                            {msg.text}
                          </div>
                          <span className="text-xs text-gray-400 px-1">
                            {new Date(msg.createdAt).toLocaleTimeString(
                              "en-IN",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}

                {/* Typing indicator */}
                {typing && (
                  <div className="flex items-end gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-400 to-violet-500 text-white font-bold flex items-center justify-center text-xs">
                      {typingUser[0]}
                    </div>
                    <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm">
                      <div className="flex gap-1">
                        <span
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        />
                        <span
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        />
                        <span
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-50">
                <form onSubmit={handleSend} className="flex gap-2">
                  <input
                    value={text}
                    onChange={handleTyping}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!text.trim() || sending}
                    className="w-11 h-11 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-2xl flex items-center justify-center transition-all shadow-sm shadow-indigo-200 shrink-0"
                  >
                    {sending ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Send size={16} />
                    )}
                  </button>
                </form>
              </div>

              <ScheduleModal
                isOpen={showScheduleModal}
                onClose={() => setShowScheduleModal(false)}
                conversationId={conversationId}
                swapRequest={activeConvo?.swapRequest}
                onScheduled={(newSession) => {
                  setSessions((prev) => [...prev, newSession]);
                  // Also add system message in chat
                  api
                    .get(`/chat/${conversationId}`)
                    .then(({ data }) => setMessages(data.data.messages));
                }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
