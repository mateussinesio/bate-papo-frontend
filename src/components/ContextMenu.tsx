import { useEffect } from 'react';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onDeleteAll: () => void;
}

export default function ContextMenu({ x, y, onClose, onDelete, onEdit, onDeleteAll }: ContextMenuProps) {
  useEffect(() => {
    const handleClick = () => onClose();
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [onClose]);

  return (
    <div 
      className="context-menu"
      style={{
        position: 'fixed',
        left: x,
        top: y,
        zIndex: 1000,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <button onClick={onEdit}>Editar</button>
      <button onClick={onDelete}>Deletar esta mensagem</button>
      <button onClick={onDeleteAll}>Deletar todas minhas mensagens</button>
    </div>
  );
}