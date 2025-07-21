import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Home from './components/Home'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard'
import QuestList from './components/QuestList'
import QuestDetail from './components/QuestDetail'
import LanguageToggle from './components/LanguageToggle'
import translations from './lang.json'

function App() {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('language') || 'en'
  })

  const t = (key) => translations[lang][key] || key

  useEffect(() => {
    localStorage.setItem('language', lang)
  }, [lang])

  return (
    <Router>
      <div className="min-h-screen bg-gray-900">
        <LanguageToggle lang={lang} setLang={setLang} t={t} />
        <Routes>
          <Route path="/" element={<Home t={t} />} />
          <Route path="/login" element={<Login t={t} />} />
          <Route path="/register" element={<Register t={t} />} />
          <Route path="/dashboard" element={<Dashboard t={t} />} />
          <Route path="/quests" element={<QuestList t={t} />} />
          <Route path="/quests/:id" element={<QuestDetail t={t} />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App