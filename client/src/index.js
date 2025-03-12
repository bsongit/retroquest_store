import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { AppProvider } from './contexts/AppContext';
import reportWebVitals from './reportWebVitals';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { BrowserRouter as Router } from 'react-router-dom';
import Routes from './routes';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
        <CartProvider>
          <AppProvider>
            <Routes />
          </AppProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  </React.StrictMode>
);

reportWebVitals(); 