import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './styles/index.css';
import PublicSite from './components/PublicSite';
import AdminApp from './components/AdminApp';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicSite />} />
        <Route path="/admin" element={<AdminApp />} />
        <Route path="*" element={<PublicSite />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
