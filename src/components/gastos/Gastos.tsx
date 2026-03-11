import { useState, useEffect } from 'react';
import { useBalance } from '../../context/BalanceContext';
import { transacaoService } from '../../services/transacaoService';
import { usuarioService } from '../../services/usuarioService';
import type { Transacao, TransacaoForm, TipoTransacao } from '../../models';

// ---------------------------------------------------------------------------
// Tipos internos
// ---------------------------------------------------------------------------

interface FormState {
  tipo: 'Receita' | 'Despesa';
  nome: string;
  descricao: string;
  valor: string;
  data: string;
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
// Componente principal
// ---------------------------------------------------------------------------

const Gastos = () => {
  const { setEntrada, setSaida } = useBalance();
  const usuario = usuarioService.getUsuarioLogado();

  const [movimentos, setMovimentos] = useState<Transacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [editando, setEditando] = useState<Transacao | null>(null);
  const [form, setForm] = useState<FormState>(FORM_INICIAL);
  const [erros, setErros] = useState<FormErros>({});
  const [salvando, setSalvando] = useState(false);

  // -------------------------------------------------------------------------
  // Carregar transações
  // -------------------------------------------------------------------------

  useEffect(() => {
    carregarTransacoes();
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

  const abrirModal = () => {
    setEditando(null);
    setForm(FORM_INICIAL);
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
    };

    setSalvando(true);
    try {
      let lista: Transacao[];
      if (editando?.id) {
        const atualizada = await transacaoService.atualizar(editando.id, payload, usuarioId);
        lista = movimentos.map((t) => (t.id === atualizada.id ? atualizada : t));
      } else {
        const nova = await transacaoService.criar(payload, usuarioId);
        lista = [...movimentos, nova];
      }
      setMovimentos(lista);
      atualizarBalance(lista);
      fecharModal();
    } catch {
      // mantém modal aberto em caso de erro
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
    } catch {
      // silencioso
    }
  };

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="flex flex-col gap-6">

      {/* Título */}
      <div>
        <h1 className="text-c-text text-xl font-bold">Transações</h1>
        <p className="text-c-text/50 text-sm mt-1">Gerencie suas entradas e saídas</p>
      </div>

      {/* Carregando */}
      {carregando && (
        <div className="flex items-center justify-center min-h-[40vh]">
          <p className="text-c-text/40 text-sm">Carregando...</p>
        </div>
      )}

      {/* Estado vazio */}
      {!carregando && movimentos.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-c-surface border border-c-border">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-c-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </div>
          <p className="text-c-text/40 text-sm text-center">
            Você ainda não possui nenhuma transação.{' '}
            <button onClick={abrirModal} className="text-c-accent font-semibold hover:text-c-accent/70 transition-colors cursor-pointer bg-transparent border-none">
              Criar aqui
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
              className="flex items-center justify-between bg-c-surface border border-c-border rounded-2xl px-6 py-4"
            >
              {/* Dados */}
              <div className="flex flex-col gap-1">
                <span className="text-c-text font-bold text-base tracking-wide">{t.nome}</span>
                {t.descricao && (
                  <span className="text-c-text/40 text-xs">{t.descricao}</span>
                )}
                <span className="text-c-text/30 text-xs">{new Date(t.data).toLocaleDateString('pt-BR')}</span>
              </div>

              {/* Valor e ações */}
              <div className="flex items-center gap-4">
                <span className={`font-bold text-base ${isReceita(t.tipo) ? 'text-c-positive' : 'text-c-negative'}`}>
                  {isReceita(t.tipo) ? '+' : '-'} {formatarValor(t.valor)}
                </span>

                {/* Editar */}
                <button
                  onClick={() => abrirModalEdicao(t)}
                  title="Editar"
                  className="text-c-text/30 hover:text-c-text transition-colors cursor-pointer bg-transparent border-none"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>

                {/* Remover */}
                <button
                  onClick={() => handleRemover(t)}
                  title="Excluir"
                  className="text-c-negative/50 hover:text-c-negative transition-colors cursor-pointer bg-transparent border-none"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    <path d="M10 11v6M14 11v6" />
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FAB */}
      {!carregando && (
        <button
          onClick={abrirModal}
          title="Nova transação"
          className="fixed right-7 bottom-7 w-14 h-14 rounded-2xl bg-c-accent text-white text-2xl font-bold shadow-lg shadow-c-accent/30 hover:opacity-85 transition-all duration-200 cursor-pointer border-none flex items-center justify-center"
        >
          +
        </button>
      )}

      {/* Modal */}
      {mostrarModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={(e) => e.target === e.currentTarget && fecharModal()}
        >
          <div className="w-full max-w-[440px] bg-c-surface border border-c-border rounded-3xl shadow-2xl overflow-hidden">

            {/* Cabeçalho */}
            <div className="flex items-center justify-between px-8 py-5 border-b border-c-border">
              <h3 className="text-c-text font-bold text-base tracking-widest uppercase">
                {editando ? 'Editar Transação' : 'Nova Transação'}
              </h3>
              <button
                onClick={fecharModal}
                className="text-c-text/40 hover:text-c-text transition-colors text-xl cursor-pointer bg-transparent border-none"
              >
                ×
              </button>
            </div>

            {/* Formulário */}
            <form onSubmit={handleSalvar} className="flex flex-col gap-5 px-8 py-6">

              {/* Tipo */}
              <div className="flex flex-col gap-2">
                <label className="text-c-text/60 text-xs font-semibold tracking-widest uppercase">Tipo</label>
                <select
                  value={form.tipo}
                  onChange={(e) => setForm({ ...form, tipo: e.target.value as FormState['tipo'] })}
                  className="w-full h-[42px] px-4 rounded-xl bg-c-bg border border-c-border text-c-text text-sm outline-none focus:border-c-accent transition-all cursor-pointer"
                >
                  <option value="Despesa">Despesa (saída)</option>
                  <option value="Receita">Receita (entrada)</option>
                </select>
              </div>

              {/* Nome */}
              <div className="flex flex-col gap-2">
                <label className="text-c-text/60 text-xs font-semibold tracking-widest uppercase">Nome</label>
                <input
                  type="text"
                  placeholder="Ex: Academia"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  className="w-full h-[42px] px-4 rounded-xl bg-c-bg border border-c-border text-c-text text-sm outline-none focus:border-c-accent transition-all"
                />
                {erros.nome && <p className="text-c-negative text-xs">{erros.nome}</p>}
              </div>

              {/* Descrição */}
              <div className="flex flex-col gap-2">
                <label className="text-c-text/60 text-xs font-semibold tracking-widest uppercase">Descrição</label>
                <input
                  type="text"
                  placeholder="Ex: Mensalidade"
                  value={form.descricao}
                  onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                  className="w-full h-[42px] px-4 rounded-xl bg-c-bg border border-c-border text-c-text text-sm outline-none focus:border-c-accent transition-all"
                />
              </div>

              {/* Valor */}
              <div className="flex flex-col gap-2">
                <label className="text-c-text/60 text-xs font-semibold tracking-widest uppercase">Valor</label>
                <div className="flex items-center gap-2">
                  <span className="text-c-accent font-bold text-sm px-3 h-[42px] flex items-center rounded-xl bg-c-bg border border-c-border">
                    R$
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0,00"
                    value={form.valor}
                    onChange={(e) => setForm({ ...form, valor: e.target.value })}
                    className="flex-1 h-[42px] px-4 rounded-xl bg-c-bg border border-c-border text-c-text text-sm outline-none focus:border-c-accent transition-all"
                  />
                </div>
                {erros.valor && <p className="text-c-negative text-xs">{erros.valor}</p>}
              </div>

              {/* Data */}
              <div className="flex flex-col gap-2">
                <label className="text-c-text/60 text-xs font-semibold tracking-widest uppercase">Data</label>
                <input
                  type="date"
                  value={form.data}
                  onChange={(e) => setForm({ ...form, data: e.target.value })}
                  className="w-full h-[42px] px-4 rounded-xl bg-c-bg border border-c-border text-c-text text-sm outline-none focus:border-c-accent transition-all"
                />
                {erros.data && <p className="text-c-negative text-xs">{erros.data}</p>}
              </div>

              {/* Botões */}
              <div className="flex gap-3 mt-2">
                <button
                  type="submit"
                  disabled={salvando}
                  className="flex-1 h-[42px] bg-c-accent text-white text-sm font-bold rounded-xl tracking-widest hover:opacity-85 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border-none"
                >
                  {salvando ? 'SALVANDO...' : editando ? 'SALVAR' : 'CRIAR'}
                </button>
                <button
                  type="button"
                  onClick={fecharModal}
                  className="flex-1 h-[42px] bg-c-bg text-c-text/60 text-sm font-semibold rounded-xl border border-c-border hover:text-c-text hover:border-c-text/30 transition-all cursor-pointer"
                >
                  CANCELAR
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Gastos;
