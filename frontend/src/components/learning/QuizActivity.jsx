import React, { useState } from 'react';
import { Sparkles, CheckCircle2, XCircle } from 'lucide-react';

export const QuizActivity = ({ content = {}, onComplete }) => {
  const questions = content.questions || [
    {
      question: 'Which animal can fly in the sky? 🕊️',
      options: ['Bird', 'Cat', 'Turtle'],
      answer: 'Bird',
    },
    {
      question: 'What do bees make? 🐝',
      options: ['Honey', 'Milk', 'Bread'],
      answer: 'Honey',
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(null);

  const currentQ = questions[currentIndex] || questions[0];

  const handleSelect = (opt) => {
    setSelectedOption(opt);
    const correct = opt === currentQ.answer;
    setIsAnswerCorrect(correct);

    if (correct) {
      setCorrectCount((prev) => prev + 1);
    }

    setTimeout(() => {
      if (currentIndex + 1 >= questions.length) {
        onComplete({
          correct_count: correct ? correctCount + 1 : correctCount,
          total_count: questions.length,
        });
      } else {
        setCurrentIndex((prev) => prev + 1);
        setSelectedOption(null);
        setIsAnswerCorrect(null);
      }
    }, 1000);
  };

  return (
    <div className="text-center space-y-6 max-w-lg mx-auto py-2">
      <div className="space-y-1">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-100 text-brand-900 text-xs font-black uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-brand-600" />
          <span>
            Question {currentIndex + 1} of {questions.length}
          </span>
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900">{currentQ.question}</h2>
      </div>

      <div className="space-y-3 pt-2">
        {currentQ.options.map((opt, i) => {
          const isSelected = selectedOption === opt;
          return (
            <button
              key={i}
              onClick={() => handleSelect(opt)}
              disabled={selectedOption !== null}
              className={`
                w-full p-4 rounded-2xl font-black text-base border-3 transition-all flex items-center justify-between active:scale-98
                ${isSelected && isAnswerCorrect === true
                  ? 'bg-emerald-500 border-emerald-600 text-white shadow-md'
                  : isSelected && isAnswerCorrect === false
                  ? 'bg-rose-100 border-rose-400 text-rose-900'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'}
              `}
            >
              <span>{opt}</span>
              {isSelected && isAnswerCorrect === true && (
                <CheckCircle2 className="w-5 h-5 text-white" />
              )}
              {isSelected && isAnswerCorrect === false && (
                <XCircle className="w-5 h-5 text-rose-600" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
