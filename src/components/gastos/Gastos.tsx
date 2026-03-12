import { useState, useEffect } from 'react';
import { useBalance } from '../../context/BalanceContext';
import { transacaoService } from '../../services/transacaoService';
import { categoriaService } from '../../services/categoriaService';
import { usuarioService } from '../../services/usuarioService';
import type { Transacao, TransacaoForm, TipoTransacao, Categoria } from '../../models';
import Toast from '../ui/Toast';

// ---------------------------------------------------------------------------
// Tipos internos
// ---------------------------------------------------------------------------

interface FormState {
  tipo: 'Receita' | 'Despesa';
  nome: string;
  descricao: string;
  valor: string;
  data: string;
  categoriaId: string;
}

interface FormErros {
  nome?: string;
  valor?: string;
  data?: string;
}

const FORM_INICIAL: FormState = {
  tipo: 'Despesa',
  nome: '',
  descricao: '',
  valor: '',
  data: new Date().toISOString().split('T')[0],
  categoriaId: '',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const isReceita = (tipo: TipoTransacao) => tipo === 'Receita';

const formatarValor = (valor: number) =>
  valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const validarForm = (form: FormState): FormErros => {
  const erros: FormErros = {};
  if (!form.nome || form.nome.length < 3) erros.nome = 'Nome obrigatório (mínimo 3 caracteres).';
  if (!form.valor || Number(form.valor) < 0.01) erros.valor = 'Valor obrigatório (mínimo R$ 0,01).';
  if (!form.data) erros.data = 'Data obrigatória.';
  return erros;
};

// ---------------------------------------------------------------------------
// Modal de transação
// ---------------------------------------------------------------------------

interface ModalProps {
  form: FormState;
  setForm: (f: FormState) => void;
  erros: FormErros;
  salvando: boolean;
  editando: Transacao | null;
  categorias: Categoria[];
  onSalvar: (e: React.FormEvent) => void;
  onFechar: () => void;
}

const ModalTransacao = ({ form, setForm, erros, salvando, editando, categorias, onSalvar, onFechar }: ModalProps) => {
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisivel(true), 10);
    return () => clearTimeout(t);
  }, []);

  const fechar = () => {
    setVisivel(false);
    setTimeout(onFechar, 300);
  };

  const isRec = form.tipo === 'Receita';
  const corVar = isRec ? 'var(--color-c-positive)' : 'var(--color-c-negative)';

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center transition-all duration-300 ${visivel ? 'bg-black/60 backdrop-blur-sm' : 'bg-black/0'}`}
      onClick={(e) => e.target === e.currentTarget && fechar()}
    >
      <div
        className={`w-full sm:max-w-[460px] bg-c-surface sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden transition-all duration-300 ${
          visivel ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}
      >
        {/* Header colorido dinâmico */}
        <div
          className="relative px-6 pt-6 pb-8 transition-colors duration-300"
          style={{ backgroundColor: `color-mix(in srgb, ${corVar} 12%, transparent)` }}
        >
          {/* Drag handle — mobile */}
          <div className="sm:hidden w-10 h-1 rounded-full bg-c-border mx-auto mb-4" />

          {/* Fechar */}
          <button
            onClick={fechar}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-c-text/10 hover:bg-c-text/20 flex items-center justify-center transition-all cursor-pointer border-none text-c-text/50 hover:text-c-text"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Toggle tipo */}
          <p className="text-c-text/40 text-xs font-semibold tracking-widest uppercase mb-3">
            {editando ? 'Editar transação' : 'Nova transação'}
          </p>
          <div className="flex gap-2 w-fit p-1 rounded-2xl bg-c-bg border border-c-border">
            {(['Receita', 'Despesa'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setForm({ ...form, tipo: t })}
                style={form.tipo === t ? { backgroundColor: corVar, boxShadow: `0 4px 12px color-mix(in srgb, ${corVar} 35%, transparent)` } : {}}
                className={`px-5 py-2 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer border-none ${
                  form.tipo === t ? 'text-white' : 'text-c-text/40 hover:text-c-text bg-transparent'
                }`}
              >
                {t === 'Receita' ? '↑ Receita' : '↓ Despesa'}
              </button>
            ))}
          </div>

          {/* Valor — hero */}
          <div className="mt-5 flex items-end gap-2">
            <span className="text-c-text/40 text-lg font-bold mb-1">R$</span>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="0,00"
              value={form.valor}
              onChange={(e) => setForm({ ...form, valor: e.target.value })}
              className="flex-1 bg-transparent text-c-text text-4xl font-black outline-none placeholder:text-c-text/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
          {erros.valor && <p className="text-c-negative text-xs mt-1">{erros.valor}</p>}
        </div>

        {/* Formulário */}
        <form onSubmit={onSalvar} className="flex flex-col gap-4 px-6 py-5">

          {/* Nome + Data em linha */}
          <div className="flex gap-3">
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-c-text/40 text-[11px] font-semibold tracking-widest uppercase">Nome</label>
              <input
                type="text"
                placeholder="Ex: Academia"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                className="w-full h-11 px-3.5 rounded-xl bg-c-bg border border-c-border text-c-text text-sm outline-none focus:border-c-accent transition-all"
              />
              {erros.nome && <p className="text-c-negative text-[11px]">{erros.nome}</p>}
            </div>
            <div className="flex flex-col gap-1.5 w-36">
              <label className="text-c-text/40 text-[11px] font-semibold tracking-widest uppercase">Data</label>
              <input
                type="date"
                value={form.data}
                onChange={(e) => setForm({ ...form, data: e.target.value })}
                className="w-full h-11 px-3.5 rounded-xl bg-c-bg border border-c-border text-c-text text-sm outline-none focus:border-c-accent transition-all"
              />
              {erros.data && <p className="text-c-negative text-[11px]">{erros.data}</p>}
            </div>
          </div>

          {/* Descrição */}
          <div className="flex flex-col gap-1.5">
            <label className="text-c-text/40 text-[11px] font-semibold tracking-widest uppercase">Descrição <span className="normal-case font-normal">(opcional)</span></label>
            <input
              type="text"
              placeholder="Ex: Mensalidade de março"
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              className="w-full h-11 px-3.5 rounded-xl bg-c-bg border border-c-border text-c-text text-sm outline-none focus:border-c-accent transition-all"
            />
          </div>

          {/* Categorias como chips */}
          {categorias.length > 0 && (
            <div className="flex flex-col gap-2">
              <label className="text-c-text/40 text-[11px] font-semibold tracking-widest uppercase">Categoria <span className="normal-case font-normal">(opcional)</span></label>
              <div className="flex gap-2 overflow-x-auto overflow-y-hidden pb-1">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, categoriaId: '' })}
                  className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                    !form.categoriaId
                      ? 'text-white border-transparent'
                      : 'bg-c-bg border-c-border text-c-text/50 hover:text-c-text'
                  }`}
                  style={!form.categoriaId ? { backgroundColor: corVar, borderColor: corVar } : {}}
                >
                  Nenhuma
                </button>
                {categorias.map((cat) => {
                  const ativo = form.categoriaId === String(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setForm({ ...form, categoriaId: String(cat.id) })}
                      className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                        ativo
                          ? 'text-white border-transparent'
                          : 'bg-c-bg border-c-border text-c-text/50 hover:text-c-text'
                      }`}
                      style={ativo ? { backgroundColor: corVar, borderColor: corVar } : {}}
                    >
                      {cat.nome}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Botão submit */}
          <button
            type="submit"
            disabled={salvando}
            style={{ backgroundColor: corVar, boxShadow: `0 4px 16px color-mix(in srgb, ${corVar} 35%, transparent)` }}
            className="w-full h-12 rounded-2xl text-white text-sm font-bold tracking-wide transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border-none mt-1 hover:brightness-110 active:scale-[0.98]"
          >
            {salvando ? 'Salvando...' : editando ? 'Salvar alterações' : `Adicionar ${form.tipo}`}
          </button>

        </form>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

const Gastos = () => {
  const { setEntrada, setSaida } = useBalance();
  const usuario = usuarioService.getUsuarioLogado();

  const [movimentos, setMovimentos] = useState<Transacao[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [editando, setEditando] = useState<Transacao | null>(null);
  const [form, setForm] = useState<FormState>(FORM_INICIAL);
  const [erros, setErros] = useState<FormErros>({});
  const [salvando, setSalvando] = useState(false);
  const [toast, setToast] = useState<{ mensagem: string; tipo: 'erro' | 'sucesso' | 'aviso' | 'info' } | null>(null);

  // -------------------------------------------------------------------------
  // Carregar transações
  // -------------------------------------------------------------------------

  useEffect(() => {
    carregarTransacoes();
    categoriaService.buscarTodas().then(setCategorias).catch(() => {});
  }, []);

  const carregarTransacoes = async () => {
    setCarregando(true);
    try {
      const todas = await transacaoService.buscarTodas();
      const filtradas = usuario
        ? todas.filter((t) => t.usuario?.id === usuario.id)
        : todas;
      setMovimentos(filtradas);
      atualizarBalance(filtradas);
    } catch {
      setMovimentos([]);
    } finally {
      setCarregando(false);
    }
  };

  // -------------------------------------------------------------------------
  // Balance
  // -------------------------------------------------------------------------

  const atualizarBalance = (lista: Transacao[]) => {
    const entradas = lista.filter((t) => isReceita(t.tipo)).reduce((s, t) => s + t.valor, 0);
    const saidas = lista.filter((t) => !isReceita(t.tipo)).reduce((s, t) => s + t.valor, 0);
    setEntrada(entradas);
    setSaida(saidas);
  };

  // -------------------------------------------------------------------------
  // Modal
  // -------------------------------------------------------------------------

  const abrirModal = (tipo?: 'Receita' | 'Despesa') => {
    setEditando(null);
    setForm({ ...FORM_INICIAL, ...(tipo ? { tipo } : {}) });
    setErros({});
    setMostrarModal(true);
  };

  const abrirModalEdicao = (transacao: Transacao) => {
    setEditando(transacao);
    setForm({
      tipo: transacao.tipo,
      nome: transacao.nome,
      descricao: transacao.descricao,
      valor: String(transacao.valor),
      data: transacao.data,
      categoriaId: transacao.categoriaId ? String(transacao.categoriaId) : '',
    });
    setErros({});
    setMostrarModal(true);
  };

  const fecharModal = () => {
    setMostrarModal(false);
    setEditando(null);
  };

  // -------------------------------------------------------------------------
  // Salvar
  // -------------------------------------------------------------------------

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    const novosErros = validarForm(form);
    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros);
      return;
    }

    const usuarioId = usuario?.id ?? 1;
    const payload: TransacaoForm = {
      tipo: form.tipo,
      nome: form.nome.toUpperCase(),
      descricao: form.descricao,
      valor: Number(form.valor),
      data: form.data,
      ...(form.categoriaId ? { categoriaId: Number(form.categoriaId) } : {}),
    };

    setSalvando(true);
    try {
      let lista: Transacao[];
      if (editando?.id) {
        const atualizada = await transacaoService.atualizar(editando.id, payload, usuarioId);
        lista = movimentos.map((t) => (t.id === atualizada.id ? atualizada : t));
        setToast({ mensagem: 'Transação atualizada com sucesso!', tipo: 'sucesso' });
      } else {
        const nova = await transacaoService.criar(payload, usuarioId);
        lista = [...movimentos, nova];
        const label = nova.tipo === 'Receita' ? 'Receita' : 'Despesa';
        setToast({ mensagem: `${label} adicionada com sucesso!`, tipo: 'sucesso' });
      }
      setMovimentos(lista);
      atualizarBalance(lista);
      fecharModal();
    } catch {
      setToast({ mensagem: 'Erro ao salvar transação. Tente novamente.', tipo: 'erro' });
    } finally {
      setSalvando(false);
    }
  };

  // -------------------------------------------------------------------------
  // Remover
  // -------------------------------------------------------------------------

  const handleRemover = async (transacao: Transacao) => {
    if (!transacao.id) return;
    try {
      await transacaoService.deletar(transacao.id);
      const lista = movimentos.filter((t) => t.id !== transacao.id);
      setMovimentos(lista);
      atualizarBalance(lista);
      setToast({ mensagem: 'Transação removida.', tipo: 'sucesso' });
    } catch {
      setToast({ mensagem: 'Erro ao remover transação. Tente novamente.', tipo: 'erro' });
    }
  };

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="flex flex-col gap-6 pb-6">

      {/* Header com Título e Botão (Adaptado para todos os tamanhos) */}
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h1 className="text-c-text text-lg sm:text-xl font-bold truncate">Transações</h1>
          <p className="text-c-text/50 text-[11px] sm:text-sm mt-0.5 sm:mt-1 truncate">Gerencie suas entradas e saídas</p>
        </div>

        {/* Botão Nova Transação - Redimensionado no Mobile */}
        <button
          onClick={() => abrirModal()}
          className="flex items-center justify-center gap-1.5 sm:gap-2.5 px-3 sm:px-6 h-9 sm:h-11 rounded-xl sm:rounded-2xl bg-c-accent text-white active:scale-95 cursor-pointer border-none transition-all duration-300 shrink-0"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="sm:w-[18px] sm:h-[18px]">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span className="text-[11px] sm:text-sm font-bold tracking-wide whitespace-nowrap">Nova transação</span>
        </button>
      </div>

      {/* Carregando */}
      {carregando && (
        <div className="flex items-center justify-center min-h-[40vh]">
          <p className="text-c-text/40 text-sm">Carregando...</p>
        </div>
      )}

      {/* Estado vazio */}
      {!carregando && movimentos.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 px-4 text-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-c-surface border border-c-border">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-c-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </div>
          <p className="text-c-text/40 text-sm">
            Você ainda não possui nenhuma transação.<br />
            <button onClick={() => abrirModal()} className="text-c-accent font-semibold hover:text-c-accent/70 transition-colors cursor-pointer bg-transparent border-none mt-2">
              Clique para adicionar a primeira
            </button>
          </p>
        </div>
      )}

      {/* Lista de transações */}
      {!carregando && movimentos.length > 0 && (
        <div className="flex flex-col gap-3">
          {movimentos.map((t) => (
            <div
              key={t.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between bg-c-surface border border-c-border rounded-2xl px-5 py-4 gap-3"
            >
              <div className="flex items-center justify-between sm:justify-start gap-4 flex-1">
                {/* Dados */}
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-c-text font-bold text-base tracking-wide truncate">{t.nome}</span>
                  {t.descricao && (
                    <span className="text-c-text/40 text-xs truncate max-w-[200px] sm:max-w-none">{t.descricao}</span>
                  )}
                  <span className="text-c-text/30 text-[10px] mt-0.5">{new Date(t.data).toLocaleDateString('pt-BR')}</span>
                </div>

                {/* Valor (visível no mobile à direita do nome) */}
                <span className={`sm:hidden font-bold text-base whitespace-nowrap ${isReceita(t.tipo) ? 'text-c-positive' : 'text-c-negative'}`}>
                  {isReceita(t.tipo) ? '+' : '-'} {formatarValor(t.valor)}
                </span>
              </div>

              {/* Valor e ações (Desktop) / Ações (Mobile) */}
              <div className="flex items-center justify-between sm:justify-end gap-4 border-t border-c-border/50 sm:border-none pt-3 sm:pt-0">
                {/* Valor - Apenas Desktop */}
                <span className={`hidden sm:block font-bold text-base whitespace-nowrap ${isReceita(t.tipo) ? 'text-c-positive' : 'text-c-negative'}`}>
                  {isReceita(t.tipo) ? '+' : '-'} {formatarValor(t.valor)}
                </span>

                <div className="flex items-center gap-5 sm:gap-4 ml-auto sm:ml-0">
                  {/* Editar */}
                  <button
                    onClick={() => abrirModalEdicao(t)}
                    className="p-2 sm:p-0 text-c-text/30 hover:text-c-text transition-colors cursor-pointer bg-transparent border-none flex items-center gap-1.5"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    <span className="sm:hidden text-xs font-semibold">Editar</span>
                  </button>

                  {/* Remover */}
                  <button
                    onClick={() => handleRemover(t)}
                    className="p-2 sm:p-0 text-c-negative/50 hover:text-c-negative transition-colors cursor-pointer bg-transparent border-none flex items-center gap-1.5"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      <path d="M10 11v6M14 11v6" />
                      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                    </svg>
                    <span className="sm:hidden text-xs font-semibold">Excluir</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {toast && (
        <Toast mensagem={toast.mensagem} tipo={toast.tipo} onClose={() => setToast(null)} />
      )}

      {mostrarModal && (
        <ModalTransacao
          form={form}
          setForm={setForm}
          erros={erros}
          salvando={salvando}
          editando={editando}
          categorias={categorias}
          onSalvar={handleSalvar}
          onFechar={fecharModal}
        />
      )}

    </div>
  );
};

export default Gastos;
