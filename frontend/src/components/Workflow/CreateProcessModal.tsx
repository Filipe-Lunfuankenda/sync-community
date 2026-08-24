import React, { useState, useEffect } from 'react';
import { Modal } from '../UI/Modal';
import api from '../../services/api';
import { ClipboardDocumentCheckIcon, SparklesIcon } from '@heroicons/react/24/outline';

interface Template {
  id: string;
  name: string;
  description: string;
}

interface CreateProcessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateProcessModal: React.FC<CreateProcessModalProps> = ({ isOpen, onClose, onSuccess }: CreateProcessModalProps) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [areas, setAreas] = useState<any[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [selectedAreaId, setSelectedAreaId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    setFetchingData(true);
    try {
      const [templatesRes, areasRes] = await Promise.all([
        api.get('/workflows/templates'),
        api.get('/management')
      ]);
      
      setTemplates(templatesRes.data);
      if (templatesRes.data.length > 0) {
        setSelectedTemplateId(templatesRes.data[0].id);
      }
      
      setAreas(areasRes.data);
      if (areasRes.data.length > 0) {
        setSelectedAreaId(areasRes.data[0].id);
      }
    } catch (err) {
      setError('Falha ao carregar dados iniciais');
    } finally {
      setFetchingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplateId) {
      setError('Por favor, selecione um template.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.post('/workflows/instances', {
        template_id: selectedTemplateId,
        management_area_id: selectedAreaId || null,
        title,
        description
      });
      setTitle('');
      setDescription('');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao iniciar processo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Iniciar Novo Processo" maxWidth="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center gap-4 p-4 bg-indigo-500/5 rounded-xl border border-indigo-500/10">
          <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500">
            <ClipboardDocumentCheckIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">Fluxo de Trabalho Estruturado</p>
            <p className="text-xs text-muted-foreground">Escolha um modelo para garantir que todas as etapas de aprovação são seguidas.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-bold text-foreground mb-2">
              Escolher Modelo (Template)
            </label>
            {fetchingData ? (
              <div className="h-12 bg-muted/20 animate-pulse rounded-lg" />
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {templates.map((template) => (
                  <label
                    key={template.id}
                    className={`relative flex flex-col p-4 cursor-pointer rounded-xl border-2 transition-all ${
                      selectedTemplateId === template.id
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-border bg-background hover:bg-accent/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="template"
                      value={template.id}
                      checked={selectedTemplateId === template.id}
                      onChange={() => setSelectedTemplateId(template.id)}
                      className="sr-only"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-foreground">{template.name}</span>
                      {selectedTemplateId === template.id && (
                        <SparklesIcon className="w-4 h-4 text-primary animate-pulse" />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground mt-1">{template.description}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-bold text-foreground mb-2">
              Título do Processo
            </label>
            <input
              type="text"
              id="title"
              required
              value={title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm font-medium"
              placeholder="Ex: Aquisição de Computador Portátil"
            />
          </div>

          <div>
            <label htmlFor="area" className="block text-sm font-bold text-foreground mb-2 text-accent-foreground">
              Área de Gestão / Categoria
            </label>
            <select
              id="area"
              value={selectedAreaId}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedAreaId(e.target.value)}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm font-medium"
            >
                <option value="">Nenhuma (Geral)</option>
                {areas.map((area: any) => (
                    <option key={area.id} value={area.id}>{area.name} ({area.type})</option>
                ))}
            </select>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-bold text-foreground mb-2">
              Descrição / Justificação
            </label>
            <textarea
              id="description"
              required
              rows={3}
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm font-medium resize-none"
              placeholder="Descreva o motivo deste pedido..."
            />
          </div>
        </div>

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold rounded-lg animate-shake">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-6 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || fetchingData || !selectedTemplateId}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : null}
            Iniciar Processo
          </button>
        </div>
      </form>
    </Modal>
  );
};
