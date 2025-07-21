import { Link, useParams } from 'react-router-dom';
import { FaArrowLeft, FaCheckCircle } from 'react-icons/fa';
import { useState } from 'react';
import quests from '../data/quests.json';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

function QuestDetail({ t }) {
  const { id } = useParams();
  const quest = quests.find(q => q.id === parseInt(id));
  const { user } = useAuth();
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(0);

  if (!quest) return <div>Quest not found</div>;

  const lang = (user && user.lang) || 'en';
  const title = lang === 'fr' ? quest.titleFR : quest.titleEN;

  const handleAnswer = (stepIndex, value) => {
    setAnswers(prev => ({...prev, [stepIndex]: value}));
  };

  const handleSubmit = async () => {
    if (!user) return;

    let newScore = 0;
    quest.steps.forEach((step, index) => {
      if (step.type === 'quiz' && answers[index] === step.correct) newScore += 50;
      if (step.type === 'checklist' && answers[index] === step.items.length) newScore += 30;
      if (step.type === 'challenge' && answers[index]) newScore += 20;
    });
    setScore(newScore);

    // Update Firestore
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      points: user.points + newScore,
      // Ajoute logic level up si newScore > threshold, ex. if (user.points + newScore > 100) level: 'Intermediate'
    });
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <Link to="/quests" className="inline-flex items-center gap-2 text-gold-500 hover:text-gold-400 mb-6">
          <FaArrowLeft />
          {t('back')}
        </Link>
        
        <div className="bg-gray-800 p-6 rounded-lg">
          <h1 className="text-3xl font-bold text-white mb-4">
            {title}
          </h1>
          
          <div className="space-y-6">
            {quest.steps.map((step, index) => {
              const q = lang === 'fr' ? step.questionFR : step.questionEN;
              const options = lang === 'fr' ? step.optionsFR : step.optionsEN;
              const items = lang === 'fr' ? step.itemsFR : step.itemsEN;
              const desc = lang === 'fr' ? step.descriptionFR : step.descriptionEN;

              return (
                <div key={index} className="bg-gray-700 p-4 rounded-lg">
                  <h2 className="text-xl font-semibold text-gold-500 mb-3">
                    Step {index + 1}
                  </h2>
                  {step.type === 'quiz' && (
                    <div>
                      <p className="text-gray-300 mb-4">{q}</p>
                      {options.map((opt, optIndex) => (
                        <label key={optIndex} className="block mb-2">
                          <input
                            type="radio"
                            name={`quiz${index}`}
                            onChange={() => handleAnswer(index, optIndex)}
                            className="mr-2"
                          />
                          {opt}
                        </label>
                      ))
                      }
                    </div>
                  )}
                  {step.type === 'checklist' && (
                    <div>
                      <p className="text-gray-300 mb-4">Complete these:</p>
                      {items.map((item, itemIndex) => (
                        <label key={itemIndex} className="block mb-2">
                          <input
                            type="checkbox"
                            onChange={(e) => {
                              let count = answers[index] || 0;
                              if (e.target.checked) count += 1;
                              else count -= 1;
                              handleAnswer(index, count);
                            }}
                            className="mr-2"
                          />
                          {item}
                        </label>
                      ))}
                    </div>
                  )}
                  {step.type === 'challenge' && (
                    <div>
                      <p className="text-gray-300 mb-4">{desc}</p>
                      <textarea
                        onChange={(e) => handleAnswer(index, e.target.value)}
                        className="w-full p-2 bg-gray-800 border border-gray-700 rounded"
                        placeholder="Your note..."
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <button
            onClick={handleSubmit}
            className="mt-6 w-full bg-gold-500 text-gray-900 py-3 rounded-lg font-semibold hover:bg-gold-400 transition-colors"
          >
            Submit Quest
          </button>
          {score > 0 && <p className="mt-4 text-center text-green-500">Score: {score} points!</p>}
        </div>
      </div>
    </div>
  );
}

export default QuestDetail;