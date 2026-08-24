import React, { useState } from 'react';
import { Modal } from '../UI/Modal';
import api from '../../services/api';
import { MegaphoneIcon } from '@heroicons/react/24/outline';

interface CreateAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateAnnouncementModal: React.FC<CreateAnnouncementModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.post('/communication/announcements', {
        title,
        content,
        is_active: true
      });
      setTitle('');
      setContent('');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao criar anúncio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Criar Novo Anúncio">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg border border-primary/10 mb-2">
          <div className="p-2 bg-primary/10 rounded-full text-primary">
            <MegaphoneIcon className="w-5 h-5" />
          </div>
          <p className="text-xs text-muted-foreground font-medium">
            O seu anúncio será visível para todos os membros da organização imediatamente após a publicação.
          </p>
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-bold text-foreground mb-1.5">
            Título do Anúncio
          </label>
          <input
            type="text"
            id="title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm font-medium"
            placeholder="Ex: Reunião Geral de Sócios"
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-bold text-foreground mb-1.5">
            Conteúdo
          </label>
          <textarea
            id="content"
            required
            rows={5}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm font-medium resize-none"
            placeholder="Descreva os detalhes do anúncio..."
          />
        </div>

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold rounded-lg animate-shake">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : null}
            Publicar Anúncio
          </button>
        </div>
      </form>
    </Modal>
  );
};
