import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
      const response = await axios.get(`${API_URL}/messages/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
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
      await axios.post(`${API_URL}/messages`, {
        receiver_id: message.sender_id,
        content: replyText
      }, {
        headers: { Authorization: `Bearer ${token}` }
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
      await axios.delete(`${API_URL}/messages/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
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
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold">Message</h1>
          <div className="space-x-2">
            <button
              onClick={() => navigate('/inbox')}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Back to Inbox
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

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
