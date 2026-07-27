import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/logo.jpeg'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('')
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const result = await login(email, password)
    
    if (result.success) {
      navigate('/dashboard')
    } else {
      setError(result.error)
    }
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    // TODO: Implement forgot password functionality
    alert('Password reset link will be sent to your email')
    setShowForgotPassword(false)
    setForgotPasswordEmail('')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4 sm:p-6 lg:p-8">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img 
            src={logo} 
            alt="SIM Technology Institute Logo" 
            className="h-20 sm:h-24 w-auto object-contain"
            onError={(e) => {
              e.target.style.display = 'none'
              console.error('Logo failed to load')
            }}
          />
        </div>
        
        <h1 className="text-xl sm:text-2xl font-bold mb-2 text-center text-blue-800">SIM Technology Institute</h1>
        <h2 className="text-lg sm:text-xl mb-6 text-center text-gray-600">Login</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {!showForgotPassword ? (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12 text-sm sm:text-base"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 text-lg sm:text-xl"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-400 to-purple-500 text-white py-3 px-4 rounded-lg hover:from-blue-500 hover:to-purple-600 transition-all duration-300 font-semibold shadow-md text-sm sm:text-base"
            >
              Login
            </button>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Forgot Password?
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleForgotPassword}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Email
              </label>
              <input
                type="email"
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                placeholder="Enter your email to reset password"
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-400 to-purple-500 text-white py-3 px-4 rounded-lg hover:from-blue-500 hover:to-purple-600 transition-all duration-300 font-semibold shadow-md mb-3 text-sm sm:text-base"
            >
              Send Reset Link
            </button>

            <button
              type="button"
              onClick={() => {
                setShowForgotPassword(false)
                setForgotPasswordEmail('')
              }}
              className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-all duration-300 font-semibold text-sm sm:text-base"
            >
              Back to Login
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default Login
