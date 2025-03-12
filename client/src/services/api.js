import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api'
});

// Interceptor para adicionar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Serviços de Autenticação
// export const authService = {
//   login: (credentials) => api.post('/auth/login', credentials),
//   register: (userData) => api.post('/auth/register', userData),
//   logout: () => {
//     localStorage.removeItem('token');
//     localStorage.removeItem('user');
//   }
// };

// Serviços de Produtos
export const productService = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getByPlatform: (platform) => api.get(`/products/platform/${platform}`),
  search: (query) => api.get(`/products/search?q=${query}`)
};

// Serviços de Carrinho
export const cartService = {
  getCart: () => api.get('/cart'),
  addToCart: (productId, quantity) => api.post('/cart', { productId, quantity }),
  updateQuantity: (productId, quantity) => api.put(`/cart/${productId}`, { quantity }),
  removeFromCart: (productId) => api.delete(`/cart/${productId}`),
  clearCart: () => api.delete('/cart')
};

// Serviços de Lista de Desejos
export const wishlistService = {
  getWishlist: () => api.get('/wishlist'),
  addToWishlist: (productId) => api.post('/wishlist', { productId }),
  removeFromWishlist: (productId) => api.delete(`/wishlist/${productId}`)
};

// Serviços de Pedidos
export const orderService = {
  createOrder: (orderData) => api.post('/orders', orderData),
  getOrders: () => api.get('/orders'),
  getOrderById: (id) => api.get(`/orders/${id}`)
};

// Serviços de Usuário
export const userService = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (userData) => api.put('/users/profile', userData),
  updatePassword: (passwordData) => api.put('/users/password', passwordData)
};

export default api; 