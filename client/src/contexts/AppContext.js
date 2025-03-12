import React, { createContext, useContext, useState } from 'react';
import api from '../services/api';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp deve ser usado dentro de um AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    platform: '',
    genre: '',
    priceRange: [0, 1000],
    condition: '',
    sortBy: 'relevance'
  });

  const handleSearch = async (term) => {
    try {
      setLoading(true);
      setSearchTerm(term);
      const response = await api.get(`/products/search?q=${term}`);
      return response.data;
    } catch (error) {
      setError('Erro ao realizar busca');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({
      platform: '',
      genre: '',
      priceRange: [0, 1000],
      condition: '',
      sortBy: 'relevance'
    });
  };

  const value = {
    loading,
    error,
    searchTerm,
    filters,
    handleSearch,
    updateFilters,
    clearFilters,
    setError
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContext; 