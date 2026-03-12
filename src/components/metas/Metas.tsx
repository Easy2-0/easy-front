import { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { useBalance } from '../../context/BalanceContext';
import { transacaoService } from '../../services/transacaoService';
import { usuarioService } from '../../services/usuarioService';
import Toast from '../ui/Toast';
import ModalBase from '../ui/ModalBase';

const Metas = () => {
  const { metas, atualizarMeta, adicionarMeta } = usePortfolio();
  const { saldo } = useBalance();
  const [toast, setToast] = useState<{ mensagem: string; tipo: 'erro' | 'sucesso' } | null>(null);
  
  // Controle de Modais
  const [modalMetaAberta, setModalMetaAberta] = useState(false);
  const [modalAporteAberto, setModalAporteAberta] = useState(false);
  const [metaSelecionada, setMetaSelecionada] = useState<any>(null);

  // Estados dos Forms
  const [novaMeta, setNovaMeta] = useState({ nome: '', valorObjetivo: '', cor: '#2bb39a', icone: '🎯' });
  const [valorAporte, setValorAporte] = useState('');
  const [salvando, setSalvando] = useState(false);

  const formatarBrl = (valor: number) => 
    valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const handleCriarMeta = (e: React.FormEvent) => {
    e.preventDefault();
    if (novaMeta.nome && novaMeta.valorObjetivo) {
        adicionarMeta({
            nome: novaMeta.nome,
            valorObjetivo: parseFloat(novaMeta.valorObjetivo),
            cor: novaMeta.cor,
            icone: novaMeta.icone
        });
        setModalMetaAberta(false);
        setNovaMeta({ nome: '', valorObjetivo: '', cor: '#2bb39a', icone: '🎯' });
        setToast({ mensagem: 'Meta criada com sucesso!', tipo: 'sucesso' });
    }
  };

  const handleAportarFinal = async (e: React.FormEvent) => {
    e.preventDefault();
    const valorNum = parseFloat(valorAporte);
    
    if (isNaN(valorNum) || valorNum <= 0) {
        setToast({ mensagem: 'Informe um valor válido.', tipo: 'erro' });
        return;
    }

    if (valorNum > saldo) {
        setToast({ mensagem: 'Saldo insuficiente.', tipo: 'erro' });
        return;
    }

    setSalvando(true);
    try {
        const usuario = usuarioService.getUsuarioLogado();
        const usuarioId = usuario?.id ?? 1;

        await transacaoService.criar({
            nome: `APORTE: ${metaSelecionada.nome.toUpperCase()}`,
            tipo: 'Despesa',
            valor: valorNum,
            data: new Date().toISOString().split('T')[0],
            descricao: `Valor reservado para a meta: ${metaSelecionada.nome}`
        }, usuarioId);

        atualizarMeta(metaSelecionada.id, metaSelecionada.valorAtual + valorNum);
        setToast({ mensagem: `R$ ${valorNum} guardados com sucesso!`, tipo: 'sucesso' });
        setModalAporteAberta(false);
        setValorAporte('');
    } catch (error) {
        setToast({ mensagem: 'Erro ao processar. Tente novamente.', tipo: 'erro' });
    } finally {
        setSalvando(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-10">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-c-text text-xl font-bold">Metas Objetivas</h1>
          <p className="text-c-text/50 text-sm mt-1">Transforme economia em realidade</p>
        </div>
        <button 
            onClick={() => setModalMetaAberta(true)}
            className="w-10 h-10 rounded-xl bg-c-accent text-white flex items-center justify-center shadow-lg shadow-c-accent/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer border-none"
        >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
        </button>
      </div>

      {/* Grid de Metas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {metas.map((meta) => {
            const pct = Math.min(100, (meta.valorAtual / meta.valorObjetivo) * 100);
            return (
                <div key={meta.id} className="bg-c-surface border border-c-border rounded-3xl p-5 flex flex-col gap-5 group hover:border-c-accent/30 transition-all duration-300">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner" style={{ backgroundColor: `${meta.cor}15` }}>
                                {meta.icone}
                            </div>
                            <div>
                                <h3 className="text-c-text font-bold text-base">{meta.nome}</h3>
                                <p className="text-c-text/30 text-[10px] font-bold uppercase tracking-widest">Alvo: {formatarBrl(meta.valorObjetivo)}</p>
                            </div>
                        </div>
                        <span className="text-c-text font-black text-sm" style={{ color: meta.cor }}>{pct.toFixed(0)}%</span>
                    </div>

                    <div className="w-full h-3 bg-c-bg rounded-full overflow-hidden border border-c-border/50">
                        <div className="h-full rounded-full transition-all duration-1000 ease-out relative" style={{ width: `${pct}%`, backgroundColor: meta.cor }}>
                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 to-white/20" />
                        </div>
                    </div>

                    <div className="flex items-center justify-between mt-1">
                        <div>
                            <p className="text-c-text/40 text-[10px] font-bold uppercase tracking-tighter">Acumulado</p>
                            <p className="text-c-text font-bold text-sm">{formatarBrl(meta.valorAtual)}</p>
                        </div>
                        <button 
                            onClick={() => { setMetaSelecionada(meta); setModalAporteAberta(true); }}
                            className="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border border-c-border bg-c-bg text-c-text/60 hover:text-c-accent hover:border-c-accent/30"
                        >
                            Aportar +
                        </button>
                    </div>
                </div>
            );
        })}
      </div>

      {/* ── MODAL: NOVA META ────────────────────────────────────────── */}
      <ModalBase 
        isOpen={modalMetaAberta} 
        onClose={() => setModalMetaAberta(false)}
        titulo="Nova Meta"
        subtitulo="Planejamento"
      >
        <form onSubmit={handleCriarMeta} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
                <label className="text-c-text/40 text-[11px] font-semibold tracking-widest uppercase px-1">Nome do objetivo</label>
                <input 
                    type="text" placeholder="Ex: Reserva de Emergência" required
                    value={novaMeta.nome} onChange={e => setNovaMeta({...novaMeta, nome: e.target.value})}
                    className="w-full h-12 px-4 rounded-2xl bg-c-bg border border-c-border text-c-text outline-none focus:border-c-accent transition-all"
                />
            </div>
            <div className="flex flex-col gap-1.5">
                <label className="text-c-text/40 text-[11px] font-semibold tracking-widest uppercase px-1">Valor alvo (R$)</label>
                <input 
                    type="number" placeholder="0,00" required
                    value={novaMeta.valorObjetivo} onChange={e => setNovaMeta({...novaMeta, valorObjetivo: e.target.value})}
                    className="w-full h-12 px-4 rounded-2xl bg-c-bg border border-c-border text-c-text outline-none focus:border-c-accent transition-all font-bold"
                />
            </div>
            <button 
                type="submit"
                className="w-full h-12 mt-2 rounded-2xl bg-c-accent text-white font-bold shadow-lg shadow-c-accent/30 hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer border-none"
            >
                Criar Meta Financeira
            </button>
        </form>
      </ModalBase>

      {/* ── MODAL: APORTAR VALOR ────────────────────────────────────── */}
      <ModalBase 
        isOpen={modalAporteAberto} 
        onClose={() => setModalAporteAberta(false)}
        titulo={metaSelecionada?.nome || 'Aportar'}
        subtitulo="Adicionar Fundos"
        corDestaque={metaSelecionada?.cor}
      >
        <form onSubmit={handleAportarFinal} className="flex flex-col gap-6">
            <div className="bg-c-bg rounded-2xl p-4 border border-c-border flex flex-col gap-1">
                <p className="text-c-text/40 text-[10px] font-bold uppercase tracking-widest text-center">Saldo Disponível</p>
                <p className="text-c-text text-xl font-black text-center">{formatarBrl(saldo)}</p>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-c-text/40 text-[11px] font-semibold tracking-widest uppercase px-1 text-center">Quanto deseja guardar?</label>
                <div className="flex items-center gap-3 bg-c-bg border border-c-border rounded-2xl px-4 h-16 focus-within:border-c-accent transition-all">
                    <span className="text-c-text/30 text-xl font-bold">R$</span>
                    <input 
                        type="number" step="0.01" placeholder="0,00" autoFocus required
                        value={valorAporte} onChange={e => setValorAporte(e.target.value)}
                        className="bg-transparent border-none outline-none text-c-text text-3xl font-black w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                </div>
            </div>

            <button 
                type="submit" disabled={salvando}
                style={{ backgroundColor: metaSelecionada?.cor || 'var(--color-c-accent)' }}
                className="w-full h-14 rounded-2xl text-white font-bold text-lg shadow-xl hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer border-none disabled:opacity-50"
            >
                {salvando ? 'Processando...' : 'Confirmar Aporte'}
            </button>
            <p className="text-c-text/30 text-[10px] text-center italic">
                * Este valor será descontado do seu saldo e registrado como uma transação.
            </p>
        </form>
      </ModalBase>

      {toast && (
        <Toast mensagem={toast.mensagem} tipo={toast.tipo} onClose={() => setToast(null)} />
      )}

    </div>
  );
};

export default Metas;
