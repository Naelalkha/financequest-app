import { Link } from 'react-router-dom'
import { FaArrowLeft } from 'react-icons/fa'

function Login({ t }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <Link to="/" className="absolute top-4 left-4 text-gold-500 hover:text-gold-400">
        <FaArrowLeft className="text-2xl" />
      </Link>
      
      <div className="w-full max-w-md">
        <h2 className="text-3xl font-bold text-gold-500 mb-8 text-center">
          {t('login')}
        </h2>
        
        <form className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('email')}
            </label>
            <input
              type="email"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-gold-500"
              placeholder="your@email.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('password')}
            </label>
            <input
              type="password"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-gold-500"
              placeholder="••••••••"
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-gold-500 text-gray-900 py-3 rounded-lg font-semibold hover:bg-gold-400 transition-colors"
          >
            {t('login')}
          </button>
        </form>
        
        <p className="mt-6 text-center text-gray-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-gold-500 hover:text-gold-400">
            {t('register')}
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login