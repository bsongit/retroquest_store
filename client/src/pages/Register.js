import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, MapPin, AlertCircle } from 'lucide-react';
import AuthContext from '../contexts/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: {
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: ''
    }
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  // Validadores
  const validators = {
    name: (value) => {
      if (!value) return 'Nome é obrigatório';
      if (value.length < 3) return 'Nome deve ter pelo menos 3 caracteres';
      if (!/^[a-zA-ZÀ-ÿ\s]*$/.test(value)) return 'Nome deve conter apenas letras';
      return null;
    },
    email: (value) => {
      if (!value) return 'Email é obrigatório';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Email inválido';
      return null;
    },
    password: (value) => {
      if (!value) return 'Senha é obrigatória';
      if (value.length < 6) return 'Senha deve ter pelo menos 6 caracteres';
      if (!/(?=.*[a-z])/.test(value)) return 'Senha deve conter pelo menos uma letra minúscula';
      if (!/(?=.*[A-Z])/.test(value)) return 'Senha deve conter pelo menos uma letra maiúscula';
      if (!/(?=.*\d)/.test(value)) return 'Senha deve conter pelo menos um número';
      return null;
    },
    confirmPassword: (value, formData) => {
      if (!value) return 'Confirmação de senha é obrigatória';
      if (value !== formData.password) return 'As senhas não coincidem';
      return null;
    },
    phone: (value) => {
      if (!value) return null; // Telefone é opcional
      if (!/^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(value)) return 'Telefone inválido. Use o formato (99) 99999-9999';
      return null;
    },
    'address.zipCode': (value) => {
      if (!value) return 'CEP é obrigatório';
      if (!/^\d{5}-\d{3}$/.test(value)) return 'CEP inválido. Use o formato 99999-999';
      return null;
    },
    'address.street': (value) => {
      if (!value) return 'Rua é obrigatória';
      return null;
    },
    'address.number': (value) => {
      if (!value) return 'Número é obrigatório';
      return null;
    },
    'address.neighborhood': (value) => {
      if (!value) return 'Bairro é obrigatório';
      return null;
    },
    'address.city': (value) => {
      if (!value) return 'Cidade é obrigatória';
      return null;
    },
    'address.state': (value) => {
      if (!value) return 'Estado é obrigatório';
      if (!/^[A-Z]{2}$/.test(value)) return 'Use a sigla do estado (ex: SP)';
      return null;
    }
  };

  const formatPhone = (value) => {
    if (!value) return value;
    value = value.replace(/\D/g, '');
    value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
    value = value.replace(/(\d)(\d{4})$/, '$1-$2');
    return value;
  };

  const formatCep = (value) => {
    if (!value) return value;
    value = value.replace(/\D/g, '');
    value = value.replace(/^(\d{5})(\d)/, '$1-$2');
    return value;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Aplica formatação específica para alguns campos
    if (name === 'phone') {
      formattedValue = formatPhone(value);
    } else if (name === 'address.zipCode') {
      formattedValue = formatCep(value);
    } else if (name === 'address.state') {
      formattedValue = value.toUpperCase();
    }

    // Atualiza o valor no formData
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: formattedValue
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }));
    }

    // Valida o campo
    validateField(name, formattedValue);
  };

  const validateField = (name, value) => {
    const validator = validators[name];
    if (validator) {
      const error = validator(value, formData);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
      return !error;
    }
    return true;
  };

  const validateStep1 = () => {
    const step1Fields = ['name', 'email', 'password', 'confirmPassword'];
    const step1Errors = {};
    let isValid = true;

    step1Fields.forEach(field => {
      const error = validators[field](formData[field], formData);
      if (error) {
        step1Errors[field] = error;
        isValid = false;
      }
    });

    setErrors(prev => ({ ...prev, ...step1Errors }));
    return isValid;
  };

  const validateStep2 = () => {
    const step2Fields = [
      'address.zipCode',
      'address.street',
      'address.number',
      'address.neighborhood',
      'address.city',
      'address.state'
    ];
    const step2Errors = {};
    let isValid = true;

    step2Fields.forEach(field => {
      const value = field.includes('.')
        ? formData.address[field.split('.')[1]]
        : formData[field];
      const error = validators[field](value, formData);
      if (error) {
        step2Errors[field] = error;
        isValid = false;
      }
    });

    if (formData.phone) {
      const phoneError = validators.phone(formData.phone);
      if (phoneError) {
        step2Errors.phone = phoneError;
        isValid = false;
      }
    }

    setErrors(prev => ({ ...prev, ...step2Errors }));
    return isValid;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep2()) {
      return;
    }

    setLoading(true);

    try {
      const userData = {
        ...formData,
        confirmPassword: undefined
      };
      const result = await register(...userData);
      if (result.success) {
        navigate('/', { replace: true });
      } else {
        setErrors(prev => ({
          ...prev,
          submit: result.error
        }));
      }
    } catch (err) {
      setErrors(prev => ({
        ...prev,
        submit: 'Ocorreu um erro ao criar sua conta. Tente novamente.'
      }));
    } finally {
      setLoading(false);
    }
  };

  const renderError = (fieldName) => {
    const error = errors[fieldName];
    if (!error) return null;

    return (
      <p className="mt-1 text-sm text-red-600">
        {error}
      </p>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Crie sua conta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ou{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
              faça login se já tiver uma conta
            </Link>
          </p>
        </div>

        {errors.submit && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <p className="ml-3 text-sm text-red-700">{errors.submit}</p>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {step === 1 ? (
            <div className="space-y-6">
              <div className="relative">
                <label htmlFor="name" className="sr-only">
                  Nome completo
                </label>
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className={`appearance-none rounded-md relative block w-full px-12 py-3 border ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm`}
                  placeholder="Nome completo"
                />
                {renderError('name')}
              </div>

              <div className="relative">
                <label htmlFor="email" className="sr-only">
                  Email
                </label>
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={`appearance-none rounded-md relative block w-full px-12 py-3 border ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm`}
                  placeholder="Seu email"
                />
                {renderError('email')}
              </div>

              <div className="relative">
                <label htmlFor="password" className="sr-only">
                  Senha
                </label>
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`appearance-none rounded-md relative block w-full px-12 py-3 border ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm`}
                  placeholder="Senha (mínimo 6 caracteres)"
                />
                {renderError('password')}
              </div>

              <div className="relative">
                <label htmlFor="confirmPassword" className="sr-only">
                  Confirme sua senha
                </label>
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`appearance-none rounded-md relative block w-full px-12 py-3 border ${
                    errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                  } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm`}
                  placeholder="Confirme sua senha"
                />
                {renderError('confirmPassword')}
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Próximo
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="relative">
                <label htmlFor="phone" className="sr-only">
                  Telefone
                </label>
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`appearance-none rounded-md relative block w-full px-12 py-3 border ${
                    errors.phone ? 'border-red-300' : 'border-gray-300'
                  } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm`}
                  placeholder="Telefone"
                />
                {renderError('phone')}
              </div>

              <div className="relative">
                <label htmlFor="address.zipCode" className="sr-only">
                  CEP
                </label>
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  id="address.zipCode"
                  name="address.zipCode"
                  type="text"
                  value={formData.address.zipCode}
                  onChange={handleChange}
                  className={`appearance-none rounded-md relative block w-full px-12 py-3 border ${
                    errors['address.zipCode'] ? 'border-red-300' : 'border-gray-300'
                  } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm`}
                  placeholder="CEP"
                />
                {renderError('address.zipCode')}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <input
                    id="address.street"
                    name="address.street"
                    type="text"
                    value={formData.address.street}
                    onChange={handleChange}
                    className={`appearance-none rounded-md relative block w-full px-3 py-3 border ${
                      errors['address.street'] ? 'border-red-300' : 'border-gray-300'
                    } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm`}
                    placeholder="Rua"
                  />
                  {renderError('address.street')}
                </div>
                <div className="relative">
                  <input
                    id="address.number"
                    name="address.number"
                    type="text"
                    value={formData.address.number}
                    onChange={handleChange}
                    className={`appearance-none rounded-md relative block w-full px-3 py-3 border ${
                      errors['address.number'] ? 'border-red-300' : 'border-gray-300'
                    } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm`}
                    placeholder="Número"
                  />
                  {renderError('address.number')}
                </div>
              </div>

              <div className="relative">
                <input
                  id="address.complement"
                  name="address.complement"
                  type="text"
                  value={formData.address.complement}
                  onChange={handleChange}
                  className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder="Complemento"
                />
              </div>

              <div className="relative">
                <input
                  id="address.neighborhood"
                  name="address.neighborhood"
                  type="text"
                  value={formData.address.neighborhood}
                  onChange={handleChange}
                  className={`appearance-none rounded-md relative block w-full px-3 py-3 border ${
                    errors['address.neighborhood'] ? 'border-red-300' : 'border-gray-300'
                  } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm`}
                  placeholder="Bairro"
                />
                {renderError('address.neighborhood')}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <input
                    id="address.city"
                    name="address.city"
                    type="text"
                    value={formData.address.city}
                    onChange={handleChange}
                    className={`appearance-none rounded-md relative block w-full px-3 py-3 border ${
                      errors['address.city'] ? 'border-red-300' : 'border-gray-300'
                    } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm`}
                    placeholder="Cidade"
                  />
                  {renderError('address.city')}
                </div>
                <div className="relative">
                  <input
                    id="address.state"
                    name="address.state"
                    type="text"
                    maxLength="2"
                    value={formData.address.state}
                    onChange={handleChange}
                    className={`appearance-none rounded-md relative block w-full px-3 py-3 border ${
                      errors['address.state'] ? 'border-red-300' : 'border-gray-300'
                    } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm`}
                    placeholder="Estado (UF)"
                  />
                  {renderError('address.state')}
                </div>
              </div>

              <div className="flex items-center justify-between space-x-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="group relative w-1/2 flex justify-center py-3 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`group relative w-1/2 flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                    loading
                      ? 'bg-primary-400 cursor-not-allowed'
                      : 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
                  }`}
                >
                  {loading ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    'Criar conta'
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Register; 