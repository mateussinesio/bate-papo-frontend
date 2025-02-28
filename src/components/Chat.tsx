import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import './styles/chat.css';
import './styles/contextMenu.css';

interface Message {
  id: string;
  messageId: string;
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
                msg.messageId === data.messageId
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
              if (!prev.some(msg => msg.messageId === message.messageId)) {
                return [...prev, message];
              }
              return prev;
            });
          }
        };
      } catch (error) {
        console.error('Erro ao carregar mensagens', error);
      }
    };

    loadMessages();

    return () => {
      ws.current?.close();
    };
  }, [user, navigate]);

  const sendMessage = () => {
    if (input.trim() && ws.current && user) {
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
      setContextMenu({ x: e.pageX, y: e.pageY, message });
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
          ...editMessage,
          content: editInput,
        }, { withCredentials: true });

        setMessages((prev) =>
          prev.map(msg =>
            msg.messageId === editMessage.messageId
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
            <div className='messages' key={msg.messageId} onContextMenu={(e) => handleContextMenu(e, msg)}>
              <strong>{msg.sender}:</strong> {editMessage?.messageId === msg.messageId ? (
                <input
                  value={editInput}
                  onChange={(e) => setEditInput(e.target.value)}
                  onBlur={saveEditMessage}
                  autoFocus
                />
              ) : (
                msg.content
              )}
              <em>({new Date(msg.timestamp).toLocaleTimeString()})</em>
            </div>
          ))}
        </div>
        <div className="chat-input">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') sendMessage();
            }}
            placeholder="Digite uma mensagem..."
          />
          <button onClick={sendMessage}>Enviar</button>
        </div>
      </div>

      {contextMenu && (
        <div
          className="context-menu"
          style={{
            top: contextMenu.y,
            left: contextMenu.x,
          }}
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