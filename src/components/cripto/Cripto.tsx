import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';

interface Moeda {
  id: string;
  nome: string;
  sigla: string;
  precoBrl: number;
  precoUsd: number;
  variacao: number;
  cor: string;
  logo: string;
  sparkline: any[];
}

const CONFIG_MOEDAS = [
  { id: 'bitcoin', cor: '#f7931a' },
  { id: 'ethereum', cor: '#627eea' },
  { id: 'solana', cor: '#14f195' },
  { id: 'cardano', cor: '#0033ad' },
  { id: 'ripple', cor: '#23292f' },
  { id: 'polkadot', cor: '#e6007a' },
  { id: 'dogecoin', cor: '#c2a633' },
  { id: 'chainlink', cor: '#2a5ada' },
];

const Cripto = () => {
  const [moedas, setMoedas] = useState<Moeda[]>([]);
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<Date>(new Date());
  const [expandida, setExpandida] = useState<string | null>(null);

  const buscarPrecos = async () => {
    try {
      const ids = CONFIG_MOEDAS.map(m => m.id).join(',');
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/coins/markets`, {
          params: {
            vs_currency: 'brl',
            ids: ids,
            order: 'market_cap_desc',
            sparkline: true,
            price_change_percentage: '24h',
            // Adicionamos USD como moeda secundária via conversão simples ou parâmetro extra se suportado
          }
        }
      );

      // Buscamos o preço em USD separadamente para precisão
      const usdResponse = await axios.get(
        `https://api.coingecko.com/api/v3/simple/price`, {
          params: { ids: ids, vs_currencies: 'usd' }
        }
      );

      const dadosFormatados: Moeda[] = response.data.map((item: any) => {
        const prices = item.sparkline_in_7d.price;
        const totalPontos = prices.length;
        const agora = new Date();

        return {
          id: item.id,
          nome: item.name,
          sigla: item.symbol,
          precoBrl: item.current_price,
          precoUsd: usdResponse.data[item.id]?.usd || 0,
          variacao: item.price_change_percentage_24h,
          logo: item.image,
          cor: CONFIG_MOEDAS.find(c => c.id === item.id)?.cor || '#888',
          sparkline: prices.map((p: number, i: number) => {
            // Cada ponto representa aproximadamente 1 hora de intervalo
            const dataPonto = new Date(agora.getTime() - (totalPontos - 1 - i) * 3600000);
            return {
              valor: p,
              timestamp: dataPonto
            };
          })
        };
      });

      setMoedas(dadosFormatados);
      setErro(false);
      setUltimaAtualizacao(new Date());
    } catch (err) {
      console.error('Erro ao buscar criptos:', err);
      setErro(true);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    buscarPrecos();
    const interval = setInterval(buscarPrecos, 60000);
    return () => clearInterval(interval);
  }, []);

  const moedasFiltradas = moedas.filter(m => 
    m.nome.toLowerCase().includes(busca.toLowerCase()) || 
    m.sigla.toLowerCase().includes(busca.toLowerCase())
  );

  const formatarBrl = (valor: number) => 
    valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const formatarUsd = (valor: number) => 
    valor.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  return (
    <div className="flex flex-col gap-6 pb-10">
      
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-c-text text-xl font-bold">Mercado Cripto</h1>
          <p className="text-c-text/50 text-sm mt-1">Cotações ao vivo via CoinGecko</p>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-c-text/30 font-bold uppercase tracking-widest block">Última atualização</span>
          <span className="text-c-text/50 text-xs font-mono">{ultimaAtualizacao.toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Busca */}
      <div className="relative">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-c-text/30" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
        <input 
          type="text" placeholder="Buscar moeda..." value={busca} onChange={(e) => setBusca(e.target.value)}
          className="w-full h-12 pl-12 pr-4 rounded-2xl bg-c-surface border border-c-border text-c-text text-sm outline-none focus:border-c-accent transition-all"
        />
      </div>

      {/* Carregando/Erro omitidos para brevidade se não mudarem drasticamente */}
      {carregando && moedas.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 border-4 border-c-accent/20 border-t-c-accent rounded-full animate-spin" />
          <p className="text-c-text/40 text-xs font-bold tracking-widest uppercase">Consultando mercado...</p>
        </div>
      )}

      {/* Lista de Moedas */}
      <div className="flex flex-col gap-3">
        {moedasFiltradas.map((moeda) => {
          const isExp = expandida === moeda.id;
          return (
            <div 
              key={moeda.id}
              onClick={() => setExpandida(isExp ? null : moeda.id)}
              className={`flex flex-col overflow-hidden rounded-2xl bg-c-surface border transition-all duration-300 cursor-pointer ${
                isExp ? 'border-c-accent/40 shadow-xl' : 'border-c-border hover:border-c-text/20'
              }`}
            >
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center overflow-hidden bg-white shadow-lg p-1.5" style={{ boxShadow: `0 4px 12px ${moeda.cor}30` }}>
                    <img src={moeda.logo} alt={moeda.nome} className="w-full h-full object-contain" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-c-text font-bold text-sm tracking-wide">{moeda.nome}</span>
                    <span className="text-c-text/40 text-[11px] font-bold uppercase tracking-widest">{moeda.sigla}</span>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <span className="text-c-text font-black text-sm">{formatarBrl(moeda.precoBrl)}</span>
                  <span className="text-c-text/30 text-[11px] font-bold">{formatarUsd(moeda.precoUsd)}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md mt-1 ${
                    moeda.variacao >= 0 ? 'bg-c-positive/10 text-c-positive' : 'bg-c-negative/10 text-c-negative'
                  }`}>
                    {moeda.variacao >= 0 ? '▲' : '▼'} {Math.abs(moeda.variacao).toFixed(2)}%
                  </span>
                </div>
              </div>

              {/* Gráfico Expansível */}
              <div className={`transition-all duration-500 ease-in-out ${isExp ? 'max-h-[250px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden bg-c-surface/50`}>
                <div className="px-4 pb-6 pt-2 h-[200px] w-full">
                  <div className="h-px w-full bg-c-border mb-4" />
                  <p className="text-[10px] text-c-text/40 font-bold uppercase tracking-widest mb-4">Tendência 7 dias</p>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={moeda.sparkline}>
                      <defs>
                        <linearGradient id={`color-${moeda.id}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={moeda.cor} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={moeda.cor} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-c-border)" opacity={0.5} />
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload.timestamp as Date;
                            return (
                              <div className="bg-c-surface border border-c-border px-3 py-2 rounded-xl shadow-2xl">
                                <p className="text-[10px] text-c-text/40 font-bold uppercase tracking-widest mb-1">
                                  {data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} • {data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                                <p className="text-c-text font-black text-sm">{formatarBrl(payload[0].value as number)}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area 
                        type="monotone" dataKey="valor" stroke={moeda.cor} strokeWidth={2}
                        fillOpacity={1} fill={`url(#color-${moeda.id})`} 
                        animationDuration={1500}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {!carregando && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <div className="w-1.5 h-1.5 rounded-full bg-c-positive animate-pulse" />
          <p className="text-[10px] text-c-text/30 font-bold uppercase tracking-widest">
            Dados ao vivo atualizados a cada minuto
          </p>
        </div>
      )}

    </div>
  );
};

export default Cripto;
