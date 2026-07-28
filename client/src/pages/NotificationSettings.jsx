import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../utils/axios';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, Mail, ArrowLeft, Save } from 'lucide-react';

export default function NotificationSettings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [preferences, setPreferences] = useState({
    helpdesk_notifications: true,
    fee_notifications: true,
    payment_notifications: true,
    attendance_notifications: true,
    grade_notifications: true,
    announcement_notifications: true,
    system_alerts: true,
    email_notifications: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await axios.get('/notifications/preferences');
      setPreferences(response.data.data);
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put('/notifications/preferences', preferences);
      alert('Notification preferences saved successfully');
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      alert('Failed to save notification preferences');
    } finally {
      setSaving(false);
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
                onClick={() => navigate('/notifications')}
                className="text-gray-700 hover:text-gray-900 text-sm sm:text-base"
              >
                <ArrowLeft className="h-4 w-4 inline mr-2" />
                Back to Notifications
              </button>
            </div>
            <div className="flex items-center justify-between w-full sm:w-auto gap-3">
              <h1 className="text-lg sm:text-xl font-bold">Notification Settings</h1>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              In-App Notifications
            </CardTitle>
            <CardDescription>
              Choose which types of notifications you want to receive in the application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <Label htmlFor="helpdesk" className="font-medium">HelpDesk Notifications</Label>
                <p className="text-sm text-gray-500">Messages and updates from HelpDesk</p>
              </div>
              <Switch
                id="helpdesk"
                checked={preferences.helpdesk_notifications}
                onCheckedChange={() => handleToggle('helpdesk_notifications')}
              />
            </div>

            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <Label htmlFor="fees" className="font-medium">Fee Notifications</Label>
                <p className="text-sm text-gray-500">Fee reminders and payment due alerts</p>
              </div>
              <Switch
                id="fees"
                checked={preferences.fee_notifications}
                onCheckedChange={() => handleToggle('fee_notifications')}
              />
            </div>

            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <Label htmlFor="payments" className="font-medium">Payment Notifications</Label>
                <p className="text-sm text-gray-500">Payment confirmations and receipts</p>
              </div>
              <Switch
                id="payments"
                checked={preferences.payment_notifications}
                onCheckedChange={() => handleToggle('payment_notifications')}
              />
            </div>

            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <Label htmlFor="attendance" className="font-medium">Attendance Notifications</Label>
                <p className="text-sm text-gray-500">Attendance updates and alerts</p>
              </div>
              <Switch
                id="attendance"
                checked={preferences.attendance_notifications}
                onCheckedChange={() => handleToggle('attendance_notifications')}
              />
            </div>

            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <Label htmlFor="grades" className="font-medium">Grade Notifications</Label>
                <p className="text-sm text-gray-500">Grade updates and report cards</p>
              </div>
              <Switch
                id="grades"
                checked={preferences.grade_notifications}
                onCheckedChange={() => handleToggle('grade_notifications')}
              />
            </div>

            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <Label htmlFor="announcements" className="font-medium">Announcement Notifications</Label>
                <p className="text-sm text-gray-500">School announcements and news</p>
              </div>
              <Switch
                id="announcements"
                checked={preferences.announcement_notifications}
                onCheckedChange={() => handleToggle('announcement_notifications')}
              />
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <Label htmlFor="system" className="font-medium">System Alerts</Label>
                <p className="text-sm text-gray-500">System updates and maintenance alerts</p>
              </div>
              <Switch
                id="system"
                checked={preferences.system_alerts}
                onCheckedChange={() => handleToggle('system_alerts')}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Notifications
            </CardTitle>
            <CardDescription>
              Receive notifications via email (feature coming soon)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between py-3">
              <div>
                <Label htmlFor="email" className="font-medium">Email Notifications</Label>
                <p className="text-sm text-gray-500">Get notified via email for important updates</p>
              </div>
              <Switch
                id="email"
                checked={preferences.email_notifications}
                onCheckedChange={() => handleToggle('email_notifications')}
                disabled
              />
            </div>
            <p className="text-sm text-gray-400 mt-2">
              Email notifications will be available in a future update
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
