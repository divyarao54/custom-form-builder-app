import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import config from '../config.js';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import bgImage from '../assets/yellow-bg.jpg';

function DraggableItem({ id, text }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });
  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : {};

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className="p-2 bg-gray-100 border rounded shadow cursor-grab text-black"
    >
      {text}
    </div>
  );
}

function DroppableCategory({ id, name, children }) {
  const { isOver, setNodeRef } = useDroppable({ id });
  const style = {
    backgroundColor: isOver ? '#bfdbfe' : '#eff6ff'
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="p-4 border rounded min-h-[100px] flex flex-col gap-2"
    >
      <h4 className="font-medium text-blue-800">{name}</h4>
      {children}
    </div>
  );
}

function CategorizeQuestion({ question, questionIndex, handleCategorizeAnswer }) {
  const [items, setItems] = useState(question.itemsToCategorize);
  const [categories, setCategories] = useState(
    question.categories.reduce((acc, cat) => {
      acc[cat.id] = [];
      return acc;
    }, {})
  );

  const handleDragEnd = (event) => {
    const { over, active } = event;
    if (over && over.id && active.id) {
      // Remove from old category
      const oldCategoryId = Object.keys(categories).find(catId =>
        categories[catId].some(item => item.id === active.id)
      );

      if (oldCategoryId) {
        categories[oldCategoryId] = categories[oldCategoryId].filter(item => item.id !== active.id);
      } else {
        // Remove from unassigned items
        setItems(prev => prev.filter(item => item.id !== active.id));
      }

      // Add to new category
      setCategories(prev => ({
        ...prev,
        [over.id]: [...prev[over.id], question.itemsToCategorize.find(i => i.id === active.id)]
      }));

      // Save answer for backend
      handleCategorizeAnswer(questionIndex, active.id, over.id);
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="space-y-4">
        {/* Unassigned Items */}
        <div>
          <h4 className="font-medium mb-2 text-black">Items to Categorize:</h4>
          <div className="flex flex-wrap gap-3">
            {items.map(item => (
              <DraggableItem key={item.id} id={item.id} text={item.text} />
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {question.categories.map(cat => (
            <DroppableCategory key={cat.id} id={cat.id} name={cat.name}>
              {categories[cat.id].map(item => (
                <DraggableItem key={item.id} id={item.id} text={item.text} />
              ))}
            </DroppableCategory>
          ))}
        </div>
      </div>
    </DndContext>
  );
}

const TakeTest = () => {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState({});

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const res = await axios.get(`${config.API_URL}/${id}`);
        setForm(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching form:', err);
        setLoading(false);
      }
    };
    fetchForm();
  }, [id]);

  const handleAnswerChange = (questionIndex, value, optionIndex = null) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: optionIndex !== null ? { value, optionIndex } : value
    }));
  };

  const handleCategorizeAnswer = (questionIndex, itemIndex, categoryId) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: {
        ...prev[questionIndex],
        [itemIndex]: categoryId
      }
    }));
  };

  const checkAnswers = () => {
    const newResults = {};
    let totalScore = 0;
    let maxScore = 0;

    form.questions.forEach((question, questionIndex) => {
      const userAnswer = answers[questionIndex];
      let isCorrect = false;
      let score = 0;
      let feedback = '';

      switch (question.type) {
        case 'mcq':
          if (userAnswer && userAnswer.optionIndex !== undefined) {
            const selectedOption = question.options[userAnswer.optionIndex];
            isCorrect = selectedOption && selectedOption.isCorrect;
            score = isCorrect ? (question.points || 0) : 0;
            feedback = isCorrect ? 'Correct!' : `Incorrect. The correct answer was: ${question.options.find(opt => opt.isCorrect)?.text || 'Not specified'}`;
          } else {
            feedback = 'No answer provided';
          }
          maxScore += question.points || 0;
          break;

        case 'mca':
          if (userAnswer && Array.isArray(userAnswer)) {
            const correctOptions = question.options.filter(opt => opt.isCorrect);
            const userSelectedCorrect = userAnswer.every(selected => 
              question.options[selected.optionIndex]?.isCorrect
            );
            const userSelectedAllCorrect = correctOptions.every(correct => 
              userAnswer.some(selected => selected.optionIndex === question.options.indexOf(correct))
            );
            isCorrect = userSelectedCorrect && userSelectedAllCorrect;
            score = isCorrect ? (question.points || 0) : 0;
            feedback = isCorrect ? 'Correct!' : `Incorrect. Correct answers: ${correctOptions.map(opt => opt.text).join(', ')}`;
          } else {
            feedback = 'No answer provided';
          }
          maxScore += question.points || 0;
          break;

        case 'categorize':
          if (userAnswer && typeof userAnswer === 'object') {
            const correctAnswers = question.categorizationAnswers || [];
            const userAnswers = userAnswer; // This should be {itemId: categoryId} pairs
            
            // Convert correctAnswers to a more accessible format
            const correctMap = {};
            correctAnswers.forEach(ca => {
              correctMap[ca.itemId] = ca.categoryId;
            });

            // Check each user answer against correct answers
            let correctCount = 0;
            const wrongItems = [];
            
            Object.entries(userAnswers).forEach(([itemId, userCategoryId]) => {
              if (correctMap[itemId] === userCategoryId) {
                correctCount++;
              } else {
                const item = question.itemsToCategorize.find(i => i.id === itemId);
                const userCategory = question.categories.find(cat => cat.id === userCategoryId);
                const correctCategory = question.categories.find(cat => cat.id === correctMap[itemId]);
                
                wrongItems.push({
                  item: item?.text || `Item ${itemId}`,
                  userAnswer: userCategory?.name || 'Unknown',
                  correctAnswer: correctCategory?.name || 'Unknown'
                });
              }
            });

            // Calculate score and correctness
            const totalItems = question.itemsToCategorize.length;
            isCorrect = correctCount === totalItems;
            score = isCorrect ? (question.points || 0) : 0;
            
            if (isCorrect) {
              feedback = 'Correct!';
            } else {
              feedback = `Incorrect (${correctCount}/${totalItems} correct). `;
              if (wrongItems.length > 0) {
                feedback += 'Wrong categorizations: ' + 
                  wrongItems.map(w => `${w.item} (you: ${w.userAnswer}, correct: ${w.correctAnswer})`).join(', ');
              }
            }
          } else {
            feedback = 'No answer provided';
          }
          maxScore += question.points || 0;
          break;

        case 'cloze':
          if (userAnswer && userAnswer.optionIndex !== undefined) {
            const selectedOption = question.clozeOptions[userAnswer.optionIndex];
            isCorrect = selectedOption && selectedOption.isCorrect;
            score = isCorrect ? (question.points || 0) : 0;
            
            if (isCorrect) {
              feedback = 'Correct!';
            } else {
              const correctOption = question.clozeOptions.find(opt => opt.isCorrect);
              const originalText = question.clozeSentence?.match(/<u>(.*?)<\/u>/)?.[1] || 'the blank';
              feedback = `Incorrect. The correct answer was: "${correctOption?.text || 'Not specified'}". You were supposed to fill in: "${originalText}"`;
            }
          } else {
            feedback = 'No answer provided';
          }
          maxScore += question.points || 0;
          break;

        default:
          feedback = 'Question type not supported for automatic grading';
          break;
      }

      newResults[questionIndex] = {
        isCorrect,
        score,
        feedback: feedback || question.feedback || 'No feedback available'
      };
      totalScore += score;
    });

    setResults(newResults);
    setSubmitted(true);
  };

  if (loading) {
    return <p className="text-center mt-4 text-black">Loading test...</p>;
  }

  if (!form) {
    return <p className="text-center mt-4 text-red-500">Test not found.</p>;
  }

  return (
    <div className="relative min-h-screen">
      <img className='fixed top-0 left-0 w-full h-full object-cover opacity-100 z-0' src={bgImage}/>
      <div className="max-w-4xl mx-auto p-4 relative z-10 bg-white bg-opacity-90 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-4 text-black">{form.title}</h1>
        
        {form.description && (
          <p className="text-gray-600 mb-6">{form.description}</p>
        )}

        {form.headerImageUrl && (
          <img 
            src={form.headerImageUrl} 
            alt={form.title}
            className="mb-6 w-full max-h-64 object-cover rounded border"
          />
        )}

        {!submitted ? (
          <form onSubmit={(e) => { e.preventDefault(); checkAnswers(); }} className="space-y-6">
            {form.questions && form.questions.length > 0 ? (
              form.questions.map((question, questionIndex) => (
                <div key={questionIndex} className="border p-6 rounded shadow-sm bg-white">
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold mb-2 text-black">
                      Question {questionIndex + 1}: {question.questionText || `Question ${questionIndex + 1}`}
                    </h3>
                    
                    {question.questionImageUrl && (
                      <img 
                        src={question.questionImageUrl} 
                        alt="Question"
                        className="mt-2 w-full max-h-60 object-contain border rounded"
                      />
                    )}
                    
                    <p className="text-sm text-green-600">Points: {question.points}</p>
                  </div>

                  {/* Question Type Specific Rendering */}
                  {(question.type === 'mcq' || question.type === 'mca') && (
                    <div className="space-y-2">
                      {question.options && question.options.map((option, optionIndex) => (
                        <label key={optionIndex} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type={question.type === 'mcq' ? 'radio' : 'checkbox'}
                            name={`question-${questionIndex}`}
                            value={option._id || optionIndex}
                            onChange={(e) => {
                              if (question.type === 'mcq') {
                                handleAnswerChange(questionIndex, e.target.value);
                              } else {
                                // Handle multiple choice answers
                                const currentAnswers = answers[questionIndex] || [];
                                if (e.target.checked) {
                                  handleAnswerChange(questionIndex, [...currentAnswers, { value: option._id || optionIndex, optionIndex }]);
                                } else {
                                  handleAnswerChange(questionIndex, currentAnswers.filter(ans => ans.optionIndex !== optionIndex));
                                }
                              }
                            }}
                            className="text-blue-600"
                          />
                          <span className="text-black">{option.text}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {question.type === 'categorize' && (
                    <CategorizeQuestion 
                      question={question} 
                      questionIndex={questionIndex} 
                      handleCategorizeAnswer={handleCategorizeAnswer} 
                    />
                  )}

                  {question.type === 'cloze' && (
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded">
                        <p className="text-gray-700 whitespace-pre-line">
                          {question.clozeSentence?.replace(/<u>(.*?)<\/u>/g, '______') || ''}
                        </p>
                      </div>
                      <div className="space-y-2">
                        {question.clozeOptions && question.clozeOptions.map((option, optionIndex) => (
                          <label key={optionIndex} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="radio"
                              name={`cloze-${questionIndex}`}
                              value={option._id || optionIndex}
                              onChange={(e) => handleAnswerChange(questionIndex, e.target.value)}
                              className="text-blue-600"
                            />
                            <span className="text-black">{option.text}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {question.type === 'comprehension' && (
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded">
                        <h4 className="font-medium mb-2 text-black">Passage:</h4>
                        <p className="text-gray-700 whitespace-pre-line">{question.comprehensionPassage}</p>
                        {question.comprehensionImageUrl && (
                          <img 
                            src={question.comprehensionImageUrl} 
                            alt="Comprehension"
                            className="mt-2 w-full max-h-60 object-contain border rounded"
                          />
                        )}
                      </div>
                      <p className="text-gray-600 italic">This question requires manual grading.</p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center">This test has no questions.</p>
            )}

            <div className="flex justify-center">
              <button
                type="submit"
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Submit Test
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h2 className="text-xl font-semibold text-blue-800 mb-2">Test Results</h2>
              <p className="text-blue-700">
                You have completed the test. Review your answers and feedback below.
              </p>
            </div>

            {form.questions.map((question, questionIndex) => (
              <div key={questionIndex} className="border p-6 rounded shadow-sm bg-white">
                <div className="mb-4">
                  <h3 className="text-xl font-semibold mb-2 text-black">
                    Question {questionIndex + 1}: {question.questionText || `Question ${questionIndex + 1}`}
                  </h3>
                  <div className={`inline-block px-3 py-1 rounded text-sm font-medium ${
                    results[questionIndex]?.isCorrect 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {results[questionIndex]?.isCorrect ? 'Correct' : 'Incorrect'}
                  </div>
                  {results[questionIndex]?.score > 0 && (
                    <span className="ml-2 text-sm text-green-600">
                      +{results[questionIndex].score} points
                    </span>
                  )}
                </div>

                <div className="bg-gray-50 p-4 rounded">
                  <h4 className="font-medium mb-2 text-black">Feedback:</h4>
                  <p className="text-gray-700">{results[questionIndex]?.feedback}</p>
                </div>
              </div>
            ))}

            <div className="flex justify-center space-x-4">
              <Link
                to="/"
                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Back to Home
              </Link>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setAnswers({});
                  setResults({});
                }}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Retake Test
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
    
  );
};

export default TakeTest;