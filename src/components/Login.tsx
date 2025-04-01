import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import './styles/login.css';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/chat');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', { username, password });

      if (response.status === 200) {
        const userInfoResponse = await api.get('/auth/userinfo');
        setUser(userInfoResponse.data);
        navigate('/chat');
      }
    } catch (err) {
      setError('Falha no login. Verifique suas credenciais.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterClick = () => {
    navigate('/register');
  };

  return (
    <div className='login-container'>
      <div className='login-card'>
        <div className='login-header'>
          <h2>Login</h2>
          <p>Por favor, insira suas credenciais para acessar sua conta.</p>
        </div>

        <form onSubmit={handleSubmit} className='login-form'>
          <div className='input-group'>
            <label htmlFor='username'>Usuário</label>
            <input
              id='username'
              type="text"
              placeholder="Digite seu usuário"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className='input-group'>
            <label htmlFor='password'>Senha</label>
            <input
              id='password'
              type="password"
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className='error-message'>{error}</div>}

          <button
            type="submit"
            className='login-button'
            disabled={isLoading}
          >
            {isLoading ? (
              <span className='spinner'></span>
            ) : 'Entrar'}
          </button>

          <div className='divider'>
            <span>ou</span>
          </div>

          <button
            type="button"
            onClick={handleRegisterClick}
            className='register-button'
          >
            Criar nova conta
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;