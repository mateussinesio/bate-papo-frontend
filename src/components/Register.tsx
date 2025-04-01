import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import axios from 'axios';
import { register } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import './styles/register.css';

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/chat');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await register(username, password);
      if (response.status === 201) {
        navigate('/login', { state: { registrationSuccess: true } });
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response && error.response.status === 409) {
          setError('Nome de usuário já está em uso.');
        } else {
          setError('Falha no registro. Por favor, tente novamente.');
        }
      } else {
        setError('Ocorreu um erro inesperado.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='register-container'>
      <div className='register-card'>
        <div className='register-header'>
          <h2>Criar nova conta</h2>
          <p>Preencha os campos abaixo para se registrar.</p>
        </div>

        <form onSubmit={handleSubmit} className='register-form'>
          <div className='input-group'>
            <label htmlFor='username'>Usuário</label>
            <input
              id='username'
              type="text"
              placeholder="Escolha um nome de usuário"
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
              placeholder="Crie uma senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className='input-group'>
            <label htmlFor='confirmPassword'>Confirmar Senha</label>
            <input
              id='confirmPassword'
              type="password"
              placeholder="Digite a senha novamente"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className='error-message'>{error}</div>}

          <button
            type="submit"
            className='register-submit-button'
            disabled={isLoading}
          >
            {isLoading ? (
              <span className='spinner'></span>
            ) : 'Registrar-se'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;