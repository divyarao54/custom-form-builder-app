import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import config from '../config.js';
import FieldList from '../components/FormBuilder/FieldList.jsx';
import heroVideo from '../assets/abstract-2.mp4';

const Home = () => {
    const [forms, setForms] = useState([]);

    useEffect(() => {
        const fetchForms = async () => {
            try {
                const res = await axios.get(`${config.API_URL}`);
                setForms(res.data);
            } catch (err) {
                console.error('Error fetching forms:', err.message);
            }
        };
        fetchForms();
    }, []);

    if (forms.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <h1 className="text-2xl font-bold mb-4">No Forms Available</h1>
                <Link 
                    to="/forms/create" 
                    className="
                        bg-blue-500 text-white px-4 py-2 rounded no-underline 
                        hover:bg-blue-600 active:bg-blue-700 
                        hover:shadow-lg active:shadow-sm
                        hover:scale-105 active:scale-95
                        transition-all duration-200 ease-in-out
                        visited:text-white"
                >
                    Create a Form
                </Link>
                <div className="mt-4 text-gray-500">
                    <p>It seems you haven't created any forms yet. Click the button above to get started!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen">
            {/* Video Background */}
            <video 
                className="fixed top-0 left-0 w-full h-full object-cover opacity-100 z-0"
                src={heroVideo}
                autoPlay
                loop
                muted
            />
            
            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
                <div className="bg-white bg-opacity-90 p-8 rounded-lg shadow-xl max-w-2xl w-full">
                    <h1 className="text-2xl font-bold mb-4 text-center">Available Forms</h1>
                    <FieldList forms={forms} />
                    
                    <div className="mt-6 text-center">
                        <Link 
                            to="/forms/create" 
                            className="
                                bg-blue-500 text-white px-4 py-2 rounded no-underline 
                                hover:bg-blue-600 active:bg-blue-700 
                                hover:shadow-lg active:shadow-sm
                                hover:scale-105 active:scale-95
                                transition-all duration-200 ease-in-out
                                visited:text-white
                                inline-block"
                        >
                            Create a Form
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;