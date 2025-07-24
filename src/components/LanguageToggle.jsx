import { FaGlobe } from 'react-icons/fa'

function LanguageToggle({ lang, setLang, t }) {
  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={() => setLang(lang === 'en' ? 'fr' : 'en')}
        className="bg-gold-500 text-gray-900 px-4 py-2 rounded-full flex items-center gap-2 hover:bg-gold-400 transition-colors"
      >
        <FaGlobe />
        {lang.toUpperCase()}
      </button>
    </div>
  );
}

export default LanguageToggle;