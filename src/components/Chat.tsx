import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import './styles/chat.css';
import './styles/contextMenu.css';

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const { user, setUser } = useAuth();
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, message: Message } | null>(null);
  const [editMessage, setEditMessage] = useState<Message | null>(null);
  const [editInput, setEditInput] = useState('');
  const ws = useRef<WebSocket | null>(null);
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const loadMessages = async () => {
      try {
        const messagesResponse = await api.get('/chat/messages', { withCredentials: true });
        setMessages(messagesResponse.data);

        ws.current = new WebSocket('ws://localhost:8082/ws/chat');

        ws.current.onmessage = (event) => {
          const data = JSON.parse(event.data);

          if (data.action === 'edit') {
            setMessages((prev) =>
              prev.map(msg =>
                msg.id === data.id
                  ? { ...msg, content: data.content }
                  : msg
              )
            );
          } else if (data.action === 'delete') {
            setMessages((prev) => prev.filter(msg => msg.id !== data.id));
          } else if (data.action === 'deleteAll') {
            setMessages((prev) => prev.filter(msg => msg.sender !== data.username));
          } else {
            const message: Message = data;
            setMessages((prev) => {
              if (!prev.some(msg => msg.id === message.id)) {
                return [...prev, message];
              }
              return prev;
            });
          }
        };

        ws.current.onerror = () => {};
        ws.current.onclose = () => {};
        
      } catch (error) {
        console.error('Erro ao carregar mensagens', error);
      }
    };

    loadMessages();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [user, navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    if (input.trim() && ws.current?.readyState === WebSocket.OPEN && user) {
      const messageToSend = {
        sender: user,
        content: input,
        timestamp: new Date().toISOString(),
      };

      ws.current.send(JSON.stringify(messageToSend));
      setInput('');
    }
  };

  const handleContextMenu = (e: React.MouseEvent, message: Message) => {
    e.preventDefault();
    if (message.sender === user) {
      setContextMenu({ x: e.clientX, y: e.clientY, message });
    }
  };

  const deleteMessage = async (id: string) => {
    try {
      await api.delete(`/chat/delete-message/${id}`, { withCredentials: true });
      setMessages((prev) => prev.filter(msg => msg.id !== id));
      setContextMenu(null);
    } catch (error) {
      console.error('Erro ao excluir a mensagem', error);
    }
  };

  const deleteAllMessages = async () => {
    try {
      await api.delete(`/chat/delete-all-messages/${user}`, { withCredentials: true });
      setMessages((prev) => prev.filter(msg => msg.sender !== user));
      setContextMenu(null);
    } catch (error) {
      console.error('Erro ao excluir todas as mensagens', error);
    }
  };

  const startEditMessage = (message: Message) => {
    setEditMessage(message);
    setEditInput(message.content);
    setContextMenu(null);
  };

  const saveEditMessage = async () => {
    if (editMessage) {
      try {
        await api.put(`/chat/edit-message/${editMessage.id}`, {
          content: editInput,
        }, { withCredentials: true });

        setMessages((prev) =>
          prev.map(msg =>
            msg.id === editMessage.id
              ? { ...msg, content: editInput }
              : msg
          )
        );

        setEditMessage(null);
        setEditInput('');
      } catch (error) {
        console.error('Erro ao editar a mensagem', error);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveEditMessage();
    } else if (e.key === 'Escape') {
      setEditMessage(null);
      setEditInput('');
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout', {}, { withCredentials: true });
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout', error);
    }
  };

  return (
    <div className='container' onClick={() => setContextMenu(null)}>
      <button onClick={handleLogout} className="logout-button">Logout</button>
      <div className="chat-container">
        <div className="messages-container">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`message ${msg.sender === user ? 'own-message' : ''}`}
              onContextMenu={(e) => handleContextMenu(e, msg)}
            >
              <span className="message-sender">{msg.sender}:</span>
              {editMessage?.id === msg.id ? (
                <input
                  className="edit-input"
                  value={editInput}
                  onChange={(e) => setEditInput(e.target.value)}
                  onBlur={saveEditMessage}
                  onKeyDown={handleEditKeyDown}
                  autoFocus
                />
              ) : (
                <span className="message-content">{msg.content}</span>
              )}
              <span className="message-time">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="chat-input">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite uma mensagem..."
          />
          <button onClick={sendMessage} disabled={!input.trim()}>
            Enviar
          </button>
        </div>
      </div>

      {contextMenu && (
        <div
          className="context-menu"
          style={{
            top: contextMenu.y,
            left: contextMenu.x,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={() => startEditMessage(contextMenu.message)}>Editar</button>
          <button onClick={() => deleteMessage(contextMenu.message.id)}>
            Excluir
          </button>
          <button onClick={deleteAllMessages}>Excluir todas</button>
        </div>
      )}
    </div>
  );
}