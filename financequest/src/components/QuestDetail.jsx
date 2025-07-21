import { Link, useParams } from 'react-router-dom'
import { FaArrowLeft, FaCheckCircle } from 'react-icons/fa'

function QuestDetail({ t }) {
  const { id } = useParams()
  
  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <Link to="/quests" className="inline-flex items-center gap-2 text-gold-500 hover:text-gold-400 mb-6">
          <FaArrowLeft />
          {t('back')}
        </Link>
        
        <div className="bg-gray-800 p-6 rounded-lg">
          <h1 className="text-3xl font-bold text-white mb-4">
            Quest #{id}: Budget Basics
          </h1>
          
          <div className="space-y-6">
            <div className="bg-gray-700 p-4 rounded-lg">
              <h2 className="text-xl font-semibold text-gold-500 mb-3">
                Step 1: Understanding Budgets
              </h2>
              <p className="text-gray-300 mb-4">
                A budget is a plan for your money. It helps you track income and expenses.
              </p>
              <button className="bg-gold-500 text-gray-900 px-4 py-2 rounded-lg font-semibold hover:bg-gold-400 transition-colors flex items-center gap-2">
                <FaCheckCircle />
                Complete Step
              </button>
            </div>
            
            <div className="bg-gray-700 p-4 rounded-lg opacity-60">
              <h2 className="text-xl font-semibold text-gold-500 mb-3">
                Step 2: Creating Your First Budget
              </h2>
              <p className="text-gray-300">
                Locked until previous step is completed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuestDetail