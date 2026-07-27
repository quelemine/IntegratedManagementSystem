import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';

export default function Inbox() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchMessages();
  }, [token, filter]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const params = filter === 'unread' ? { is_read: 'false' } : {};
      const response = await axios.get('/messages', { params });
      setMessages(response.data.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMessageClick = async (messageId) => {
    try {
      await axios.put(`/messages/${messageId}/read`, {});
      navigate(`/messages/${messageId}`);
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const handleDelete = async (messageId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this message?')) return;

    try {
      await axios.delete(`/messages/${messageId}`);
      fetchMessages();
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center py-3 sm:py-0 sm:h-16 gap-3 sm:gap-0">
            <div className="flex items-center w-full sm:w-auto">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-700 hover:text-gray-900 text-sm sm:text-base"
              >
                ← Back to Dashboard
              </button>
            </div>
            <div className="flex items-center justify-between w-full sm:w-auto gap-3">
              <h1 className="text-lg sm:text-xl font-bold">Inbox</h1>
              <button
                onClick={() => navigate('/messages/compose')}
                className="px-3 py-2 sm:px-4 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm sm:text-base"
              >
                <span className="hidden sm:inline">Compose</span>
                <span className="sm:hidden">New</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-4 flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded ${filter === 'unread' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Unread
          </button>
        </div>

        <div className="bg-white rounded-lg shadow">
          {messages.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No messages found</div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                onClick={() => handleMessageClick(message.id)}
                className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${!message.is_read ? 'bg-blue-50' : ''}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className={`font-medium ${!message.is_read ? 'text-blue-600' : 'text-gray-900'}`}>
                        {message.sender_first_name} {message.sender_last_name}
                      </span>
                      {!message.is_read && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      )}
                    </div>
                    <p className="text-gray-600 mt-1">{message.content.substring(0, 100)}...</p>
                    <p className="text-sm text-gray-400 mt-2">
                      {new Date(message.created_at).toLocaleDateString()} at {new Date(message.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDelete(message.id, e)}
                    className="ml-4 text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
