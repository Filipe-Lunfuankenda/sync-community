import React, { useState } from 'react';
import { Modal } from '../UI/Modal';
import api from '../../services/api';
import { ChartBarIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

interface CreatePollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreatePollModal: React.FC<CreatePollModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addOption = () => {
    if (options.length < 5) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (options.some(o => !o.trim())) {
      setError('Preencha todas as opções da votação.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.post('/communication/polls', {
        question,
        options: options.map(text => ({ text })),
        is_active: true
      });
      setQuestion('');
      setOptions(['', '']);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao criar votação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nova Votação">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg border border-primary/10 mb-2">
          <div className="p-2 bg-primary/10 rounded-full text-primary">
            <ChartBarIcon className="w-5 h-5" />
          </div>
          <p className="text-xs text-muted-foreground font-medium">
            As votações permitem recolher feedback direto da comunidade de forma estruturada e anónima.
          </p>
        </div>

        <div>
          <label htmlFor="question" className="block text-sm font-bold text-foreground mb-1.5">
            Pergunta
          </label>
          <input
            type="text"
            id="question"
            required
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm font-medium"
            placeholder="Ex: Qual o melhor horário para a reunião?"
          />
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-bold text-foreground mb-1.5">
            Opções de Resposta
          </label>
          {options.map((option, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                required
                value={option}
                onChange={(e) => updateOption(index, e.target.value)}
                className="flex-1 px-4 py-2 bg-muted/50 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm font-medium"
                placeholder={`Opção ${index + 1}`}
              />
              {options.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeOption(index)}
                  className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
          
          {options.length < 5 && (
            <button
              type="button"
              onClick={addOption}
              className="flex items-center gap-2 text-xs font-bold text-primary hover:text-primary/80 transition-colors py-1"
            >
              <PlusIcon className="w-4 h-4" />
              Adicionar Opção
            </button>
          )}
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
            Criar Votação
          </button>
        </div>
      </form>
    </Modal>
  );
};
