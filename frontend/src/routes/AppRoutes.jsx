import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from '../pages/Home.jsx';
import CreateForm from '../pages/CreateForm.jsx';
import EditForm from '../pages/EditForm.jsx';
import ViewForm from '../pages/ViewForm.jsx';
import TakeTest from '../pages/TakeTest.jsx';

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/forms/create" element={<CreateForm />} />
        <Route path="/forms/edit/:id" element={<EditForm />} />
        <Route path="/forms/view/:id" element={<ViewForm />} />
        <Route path="/forms/take/:id" element={<TakeTest />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;