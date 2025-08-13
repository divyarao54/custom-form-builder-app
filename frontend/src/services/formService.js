import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/forms';

export const getForms = () => axios.get(API_BASE);
export const getFormById = (id) => axios.get(`${API_BASE}/${id}`);
export const createForm = (formData) => axios.post(API_BASE, formData);
export const updateForm = (id, formData) => axios.put(`${API_BASE}/${id}`, formData);
export const deleteForm = (id) => axios.delete(`${API_BASE}/${id}`);