import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import FieldEditor from '../components/FormBuilder/FieldEditor.jsx';
import bgImage from '../assets/yellow-bg.jpg';

const EditForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [headerImageUrl, setHeaderImageUrl] = useState('');
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch the form data
    useEffect(() => {
        axios
            .get(`http://localhost:5000/api/forms/${id}`)
            .then((res) => {
                const data = res.data;
                setTitle(data.title || '');
                setDescription(data.description || '');
                setHeaderImageUrl(data.headerImageUrl || '');
                setQuestions(data.questions || []);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, [id]);

    const addQuestion = () => {
        setQuestions([
            ...questions,
            {
                type: 'categorize',
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
                order: questions.length
            },
        ]);
    };

    const updateQuestion = (index, updatedQuestion) => {
        const updatedQuestions = [...questions];
        updatedQuestions[index] = updatedQuestion;
        setQuestions(updatedQuestions);
    };

    const removeQuestion = (index) => {
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Clean and validate form data before submission
        const cleanedForm = {
            title,
            description,
            headerImageUrl,
            questions: questions.map((question, index) => ({
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

        setError('');
        setIsSubmitting(true);
        console.log('Submitting updated form data:', cleanedForm);
        axios
            .put(`http://localhost:5000/api/forms/${id}`, cleanedForm)
            .then(() => {
                navigate('/');
            })
            .catch((err) => {
                console.error(err);
                setError(err.response?.data?.message || 'Failed to update form. Please try again.');
            })
            .finally(() => {
                setIsSubmitting(false);
            });
    };

    if (loading) return <p>Loading form...</p>;

    return (
        <div>
            <img className='fixed top-0 left-0 w-full h-full object-cover opacity-100 z-0' src={bgImage} alt="Background" />
            <div className="max-w-3xl mx-auto p-4 relative z-10 bg-white bg-opacity-90 rounded-lg shadow-lg">
                <h1 className="text-2xl font-bold mb-4">Edit Form</h1>
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <label className="block">
                        Title:
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="border rounded w-full p-2 mt-1"
                            required
                        />
                    </label>

                    <label className="block">
                        Description:
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="border rounded w-full p-2 mt-1"
                        />
                    </label>

                    <label className="block">
                        Header Image URL:
                        <input
                            type="text"
                            value={headerImageUrl}
                            onChange={(e) => setHeaderImageUrl(e.target.value)}
                            className="border rounded w-full p-2 mt-1"
                        />
                    </label>

                    <div>
                        <h2 className="text-xl font-semibold mb-2">Questions</h2>
                        {questions.map((question, index) => (
                            <FieldEditor
                                key={index}
                                field={question}
                                onChange={(updated) => updateQuestion(index, updated)}
                                onRemove={() => removeQuestion(index)}
                            />
                        ))}
                        <button
                            type="button"
                            onClick={addQuestion}
                            className="mt-2 px-4 py-2 bg-green-500 text-white rounded"
                        >
                            + Add Question
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
                    >
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditForm;
