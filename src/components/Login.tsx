import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import './styles/login.css';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/chat');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8082/auth/login', { username, password }, {
        withCredentials: true,
      });

      if (response.status === 200) {
        const userInfoResponse = await axios.get('http://localhost:8082/auth/userinfo', {
          withCredentials: true,
        });
        setUser(userInfoResponse.data);
        navigate('/chat');
      }
    } catch (err) {
      setError('Falha no login. Verifique suas credenciais.');
    }
  };

  const handleRegisterClick = () => {
    navigate('/register');
  };

  return (
    <div className='login-container'>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="text"
            placeholder="Usuário"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSubmit(e);
              }
            }}
            required
          />
        </div>
        <div className="login-buttons">
          <button type="submit">Login</button>
          <button type="button" onClick={handleRegisterClick}>Registrar-se</button>
        </div>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default Login;