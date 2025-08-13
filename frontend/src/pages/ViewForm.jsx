import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import config from '../config.js';
import bgImage from '../assets/yellow-bg.jpg';


const ViewForm = () => {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <p className="text-center mt-4">Loading form...</p>;
  }

  if (!form) {
    return <p className="text-center mt-4 text-red-500">Form not found.</p>;
  }

  return (
    <div>
    <img className='fixed top-0 left-0 w-full h-full object-cover opacity-100 z-0' src={bgImage}/>
    
      <div className="max-w-3xl mx-auto p-4 relative z-10 bg-white bg-opacity-90 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-4">{form.title}</h1>
        {form.headerImageUrl && (
          <img
            src={form.headerImageUrl}
            alt={form.title}
            className="mb-6 w-full max-h-64 object-cover rounded border"
          />
        )}

        {form.questions && form.questions.length > 0 ? (
          <ul className="space-y-4">
            {form.questions.map((question, index) => (
              <li
                key={question._id || index}
                className="border p-4 rounded shadow-sm bg-white"
              >
                {/* Question header */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-lg">{question.questionText || `Question ${index + 1}`}</p>
                    <p className="text-sm text-gray-500">Type: {question.type}</p>
                  </div>
                  {typeof question.points === 'number' && question.points > 0 && (
                    <span className="text-sm text-green-700 font-medium">Points: {question.points}</span>
                  )}
                </div>

                {/* Question image */}
                {question.questionImageUrl && (
                  <img
                    src={question.questionImageUrl}
                    alt={question.questionText || `Question ${index + 1}`}
                    className="mt-2 w-full max-h-60 object-contain border rounded"
                  />
                )}

                {/* Type-specific rendering */}
                {(question.type === 'mcq' || question.type === 'mca') && (
                  <div className="mt-3">
                    <p className="font-medium">Options:</p>
                    {Array.isArray(question.options) && question.options.length > 0 ? (
                      <ul className="ml-5 list-disc text-gray-700">
                        {question.options.map((opt, i) => (
                          <li key={opt._id || i} className="flex items-center gap-2">
                            <span>{opt.text || `Option ${i + 1}`}</span>
                            {opt.isCorrect ? (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Correct</span>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">No options.</p>
                    )}
                  </div>
                )}

                {question.type === 'cloze' && (
                  <div className="mt-3">
                    <p className="font-medium">Cloze Sentence:</p>
                    <p className="text-gray-700 whitespace-pre-line">{question.clozeSentence || '—'}</p>
                    <p className="font-medium mt-2">Options:</p>
                    {Array.isArray(question.clozeOptions) && question.clozeOptions.length > 0 ? (
                      <ul className="ml-5 list-disc text-gray-700">
                        {question.clozeOptions.map((opt, i) => (
                          <li key={opt._id || i} className="flex items-center gap-2">
                            <span>{opt.text || `Option ${i + 1}`}</span>
                            {opt.isCorrect ? (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Correct</span>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">No cloze options.</p>
                    )}
                  </div>
                )}

                {question.type === 'comprehension' && (
                  <div className="mt-3">
                    <p className="font-medium">Passage:</p>
                    <p className="text-gray-700 whitespace-pre-line">{question.comprehensionPassage || '—'}</p>
                    {question.comprehensionImageUrl && (
                      <img
                        src={question.comprehensionImageUrl}
                        alt="Passage"
                        className="mt-2 w-full max-h-60 object-contain border rounded"
                      />
                    )}
                  </div>
                )}

                {question.type === 'categorize' && (
                  <div className="mt-3">
                    {/* Categories */}
                    {Array.isArray(question.categories) && question.categories.length > 0 && (
                      <div className="mb-4">
                        <p className="font-medium">Categories:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
                          {question.categories.map((cat, catIndex) => (
                            <div key={catIndex} className="bg-blue-100 border border-blue-300 rounded p-2 text-center">
                              <span className="font-medium text-blue-800">{cat.name || `Category ${catIndex + 1}`}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                                      {/* Items to Categorize */}
                    {Array.isArray(question.itemsToCategorize) && question.itemsToCategorize.length > 0 && (
                      <div className="mb-4">
                        <p className="font-medium">Items to Categorize:</p>
                        <div className="space-y-2 mt-2">
                          {question.itemsToCategorize.map((item, itemIndex) => {
                            // Try to find the answer using the item's ID or fallback to index-based ID
                            const itemId = item.id || `item_${itemIndex}`;
                            const answer = Array.isArray(question.categorizationAnswers) 
                              ? question.categorizationAnswers.find(ans => ans.itemId === itemId || ans.itemId === `item_${itemIndex}`)
                              : null;
                            
                            // Try to find the category using the answer's categoryId or fallback to index-based ID
                            const correctCategory = answer 
                              ? question.categories.find(cat => cat.id === answer.categoryId || cat.id === answer.categoryId?.replace('cat_', ''))
                              : null;
                            
                            return (
                              <div key={itemIndex} className="flex items-center gap-3 p-2 bg-gray-50 border rounded">
                                <span className="font-medium flex-1">{item.text || `Item ${itemIndex + 1}`}</span>
                                <span className="text-gray-500">→</span>
                                <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm">
                                  {correctCategory ? correctCategory.name : 'Uncategorized'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                                      {/* Categorization Answers Summary */}
                    {Array.isArray(question.categorizationAnswers) && question.categorizationAnswers.length > 0 && (
                      <div className="mt-3 p-3 bg-gray-50 border rounded">
                        <p className="font-medium text-sm text-gray-700 mb-2">Correct Categorizations:</p>
                        <div className="space-y-1">
                          {question.categorizationAnswers.map((answer, index) => {
                            // Try to find the item using the answer's itemId or fallback to index-based ID
                            const item = question.itemsToCategorize.find(item => 
                              item.id === answer.itemId || 
                              item.id === `item_${answer.itemId?.replace('item_', '')}`
                            );
                            
                            // Try to find the category using the answer's categoryId or fallback to index-based ID
                            const category = question.categories.find(cat => 
                              cat.id === answer.categoryId || 
                              cat.id === `cat_${answer.categoryId?.replace('cat_', '')}`
                            );
                            
                            return (
                              <div key={index} className="text-sm text-gray-600">
                                <span className="font-medium">{item?.text || 'Unknown item'}</span>
                                <span className="mx-2">→</span>
                                <span className="text-blue-600">{category?.name || 'Unknown category'}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Feedback */}
                {question.feedback && (
                  <p className="text-sm text-blue-600 mt-3">Feedback: {question.feedback}</p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">This form has no questions.</p>
        )}

        <div className="mt-6 flex space-x-4">
          <Link
            to={`/forms/edit/${form._id}`}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            Edit Form
          </Link>
          <Link
            to="/"
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ViewForm;
