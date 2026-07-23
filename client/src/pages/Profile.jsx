import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Modal } from '@/components/ui/modal'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { User, Lock, ArrowLeft } from 'lucide-react'

function Profile() {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  
  const [profileData, setProfileData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
    profile_image: user?.profile_image || ''
  })
  
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  })

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      const token = localStorage.getItem('token')
      const response = await axios.put('/api/auth/profile', profileData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      updateUser(response.data.data)
      setSuccess('Profile updated successfully')
      setIsProfileModalOpen(false)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile')
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (passwordData.new_password !== passwordData.confirm_password) {
      setError('New passwords do not match')
      return
    }

    if (passwordData.new_password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    try {
      const token = localStorage.getItem('token')
      await axios.post('/api/auth/change-password', {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      setSuccess('Password changed successfully')
      setIsPasswordModalOpen(false)
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' })
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to change password')
    }
  }

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center text-gray-700 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Dashboard
            </button>
            <h1 className="text-xl font-bold">Profile</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert variant="success" className="mb-4">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>First Name</Label>
                  <p className="text-gray-900 font-medium">{user.first_name}</p>
                </div>
                <div>
                  <Label>Last Name</Label>
                  <p className="text-gray-900 font-medium">{user.last_name}</p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p className="text-gray-900 font-medium">{user.email}</p>
                </div>
                <div>
                  <Label>Role</Label>
                  <p className="text-gray-900 font-medium capitalize">{user.role}</p>
                </div>
                <div>
                  <Label>Phone</Label>
                  <p className="text-gray-900 font-medium">{user.phone || 'Not set'}</p>
                </div>
                <div className="pt-4">
                  <Button onClick={() => setIsProfileModalOpen(true)}>
                    Edit Profile
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lock className="h-5 w-5 mr-2" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Password</Label>
                  <p className="text-gray-900 font-medium">••••••••</p>
                </div>
                <div>
                  <Label>Last Login</Label>
                  <p className="text-gray-900 font-medium">
                    {user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}
                  </p>
                </div>
                <div className="pt-4">
                  <Button onClick={() => setIsPasswordModalOpen(true)}>
                    Change Password
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Modal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        title="Edit Profile"
        size="lg"
      >
        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div>
            <Label htmlFor="first_name">First Name</Label>
            <Input
              id="first_name"
              value={profileData.first_name}
              onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="last_name">Last Name</Label>
            <Input
              id="last_name"
              value={profileData.last_name}
              onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={profileData.phone}
              onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
            />
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsProfileModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Update Profile</Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title="Change Password"
        size="lg"
      >
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <Label htmlFor="current_password">Current Password</Label>
            <Input
              id="current_password"
              type="password"
              value={passwordData.current_password}
              onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="new_password">New Password</Label>
            <Input
              id="new_password"
              type="password"
              value={passwordData.new_password}
              onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
              required
              minLength={8}
            />
          </div>
          <div>
            <Label htmlFor="confirm_password">Confirm New Password</Label>
            <Input
              id="confirm_password"
              type="password"
              value={passwordData.confirm_password}
              onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
              required
              minLength={8}
            />
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsPasswordModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Change Password</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Profile
