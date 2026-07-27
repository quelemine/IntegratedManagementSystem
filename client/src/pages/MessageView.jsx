import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../utils/axios';

export default function MessageView() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    fetchMessage();
  }, [id, token]);

  const fetchMessage = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/messages/${id}`);
      setMessage(response.data.data);
    } catch (error) {
      console.error('Error fetching message:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    try {
      await axios.post('/messages', {
        receiver_id: message.sender_id,
        content: replyText
      });
      setReplyText('');
      alert('Reply sent successfully');
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('Failed to send reply');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;

    try {
      await axios.delete(`/messages/${id}`);
      navigate('/inbox');
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Failed to delete message');
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!message) return <div className="p-6">Message not found</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center py-3 sm:py-0 sm:h-16 gap-3 sm:gap-0">
            <div className="flex items-center w-full sm:w-auto">
              <button
                onClick={() => navigate('/inbox')}
                className="text-gray-700 hover:text-gray-900 text-sm sm:text-base"
              >
                ← Back to Inbox
              </button>
            </div>
            <div className="flex items-center justify-between w-full sm:w-auto gap-2 sm:gap-3">
              <h1 className="text-lg sm:text-xl font-bold">Message</h1>
              <button
                onClick={handleDelete}
                className="px-3 py-2 sm:px-4 bg-red-500 text-white rounded hover:bg-red-600 text-sm sm:text-base"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-4 pb-4 border-b">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold">
                  From: {message.sender_first_name} {message.sender_last_name}
                </h2>
                <p className="text-gray-600">{message.sender_email}</p>
                <p className="text-sm text-gray-400 mt-1">
                  {new Date(message.created_at).toLocaleString()}
                </p>
              </div>
              {!message.is_read && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  Unread
                </span>
              )}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Message</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{message.content}</p>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Reply</h3>
            <form onSubmit={handleReply}>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="4"
                placeholder="Type your reply here..."
              />
              <div className="mt-4 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Send Reply
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
