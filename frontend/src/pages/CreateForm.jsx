import React, { useState } from 'react';
import axios from 'axios';
import FieldEditor from '../components/FormBuilder/FieldEditor';
import { useNavigate } from 'react-router-dom';
import bgImage from '../assets/yellow-bg.jpg';

const CreateForm = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    description: '',
    headerImageUrl: '',
    questions: []
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addQuestion = () => {
    setForm({
      ...form,
      questions: [
        ...form.questions,
        {
          type: 'categorize', // default question type
          questionText: '',
          questionImageUrl: '',
          clozeSentence: '',
          clozeOptions: [],
          clozeFeedback: '',
          clozePoints: 0,
          categories: [],
          itemsToCategorize: [],
          categorizationAnswers: [],
          comprehensionPassage: '',
          comprehensionImageUrl: '',
          linkedQuestions: [],
          options: [],
          multipleAnswersAllowed: false,
          feedback: '',
          points: 0,
          order: form.questions.length
        }
      ]
    });
  };

  const updateQuestion = (index, updatedQuestion) => {
    const updatedQuestions = [...form.questions];
    updatedQuestions[index] = updatedQuestion;
    setForm({ ...form, questions: updatedQuestions });
  };

  const removeQuestion = (index) => {
    setForm({
      ...form,
      questions: form.questions.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clean and validate form data before submission
    const cleanedForm = {
      ...form,
      questions: form.questions.map((question, index) => ({
        ...question,
        order: index,
        options: (question.options || []).map((option, optIndex) => ({
          ...option,
          order: optIndex,
          text: option.text || '',
          isCorrect: option.isCorrect || false
        })),
        clozeOptions: (question.clozeOptions || []).map((option, optIndex) => ({
          ...option,
          order: optIndex,
          text: option.text || '',
          isCorrect: option.isCorrect || false
        })),
        categories: (question.categories || []).map((cat, catIndex) => ({
          ...cat,
          id: cat.id || `cat_${catIndex}`
        })),
        itemsToCategorize: (question.itemsToCategorize || []).map((item, itemIndex) => ({
          ...item,
          id: item.id || `item_${itemIndex}`
        })),
        categorizationAnswers: question.categorizationAnswers || [],
        linkedQuestions: question.linkedQuestions || []
      }))
    };

    try {
      setError('');
      setIsSubmitting(true);
      console.log('Submitting form data:', cleanedForm);
      await axios.post('http://localhost:5000/api/forms', cleanedForm);
      navigate('/');
    } catch (err) {
      console.error('Error creating form:', err);
      setError(err.response?.data?.message || 'Failed to create form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <img className='fixed top-0 left-0 w-full h-full object-cover opacity-100 z-0' src={bgImage} alt="Background" />
      <div className="p-6 max-w-3xl mx-auto bg-white bg-opacity-90 rounded-lg shadow-lg relative z-10">
        <h1 className="text-2xl font-bold mb-4">Create Form</h1>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <label className="block">
            Title:
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="border rounded w-full p-2 mt-1"
              required
            />
          </label>

          {/* Description */}
          <label className="block">
            Description:
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="border rounded w-full p-2 mt-1"
            />
          </label>

          {/* Header Image URL */}
          <label className="block">
            Header Image URL:
            <input
              type="text"
              value={form.headerImageUrl}
              onChange={(e) =>
                setForm({ ...form, headerImageUrl: e.target.value })
              }
              className="border rounded w-full p-2 mt-1"
            />
          </label>

          {/* Questions */}
          <div>
            <h2 className="text-xl font-semibold mb-2">Questions</h2>
            {form.questions.map((q, index) => (
              <FieldEditor
                key={index}
                field={q}
                onChange={(updated) => updateQuestion(index, updated)}
                onRemove={() => removeQuestion(index)}
              />
            ))}
            <button
              type="button"
              onClick={addQuestion}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              + Add Question
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-green-600 text-white rounded disabled:bg-gray-400"
          >
            {isSubmitting ? 'Saving...' : 'Save Form'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateForm;
