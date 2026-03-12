import React, { createContext, useContext, useState, useEffect } from 'react';

interface PosicaoCripto {
  id: string; // ID do CoinGecko (ex: bitcoin)
  quantidade: number;
}

interface PosicaoInvestimento {
  id: string; // ID do investimento (ex: cdb)
  valorAplicado: number;
}

interface Meta {
  id: string;
  nome: string;
  valorObjetivo: number;
  valorAtual: number;
  cor: string;
  icone: string;
}

interface PortfolioContextType {
  criptos: PosicaoCripto[];
  investimentos: PosicaoInvestimento[];
  metas: Meta[];
  adicionarCripto: (id: string, qtd: number) => void;
  adicionarInvestimento: (id: string, valor: number) => void;
  adicionarMeta: (meta: Omit<Meta, 'id' | 'valorAtual'>) => void;
  atualizarMeta: (id: string, valor: number) => void;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [criptos, setCriptos] = useState<PosicaoCripto[]>(() => {
    const saved = localStorage.getItem('easy_portfolio_criptos');
    return saved ? JSON.parse(saved) : [];
  });

  const [investimentos, setInvestimentos] = useState<PosicaoInvestimento[]>(() => {
    const saved = localStorage.getItem('easy_portfolio_investimentos');
    return saved ? JSON.parse(saved) : [];
  });

  const [metas, setMetas] = useState<Meta[]>(() => {
    const saved = localStorage.getItem('easy_metas');
    return saved ? JSON.parse(saved) : [
        { id: '1', nome: 'Reserva de Emergência', valorObjetivo: 10000, valorAtual: 2500, cor: '#2bb39a', icone: '🛡️' },
        { id: '2', nome: 'Viagem 2026', valorObjetivo: 5000, valorAtual: 1200, cor: '#a78bfa', icone: '✈️' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('easy_portfolio_criptos', JSON.stringify(criptos));
  }, [criptos]);

  useEffect(() => {
    localStorage.setItem('easy_portfolio_investimentos', JSON.stringify(investimentos));
  }, [investimentos]);

  useEffect(() => {
    localStorage.setItem('easy_metas', JSON.stringify(metas));
  }, [metas]);

  const adicionarCripto = (id: string, qtd: number) => {
    setCriptos(prev => {
      const exist = prev.find(p => p.id === id);
      if (exist) return prev.map(p => p.id === id ? { ...p, quantidade: qtd } : p);
      return [...prev, { id, quantidade: qtd }];
    });
  };

  const adicionarInvestimento = (id: string, valor: number) => {
    setInvestimentos(prev => {
      const exist = prev.find(p => p.id === id);
      if (exist) return prev.map(p => p.id === id ? { ...p, valorAplicado: valor } : p);
      return [...prev, { id, valorAplicado: valor }];
    });
  };

  const adicionarMeta = (meta: Omit<Meta, 'id' | 'valorAtual'>) => {
    const nova: Meta = { ...meta, id: Date.now().toString(), valorAtual: 0 };
    setMetas(prev => [...prev, nova]);
  };

  const atualizarMeta = (id: string, valor: number) => {
    setMetas(prev => prev.map(m => m.id === id ? { ...m, valorAtual: valor } : m));
  };

  return (
    <PortfolioContext.Provider value={{ 
        criptos, investimentos, metas, 
        adicionarCripto, adicionarInvestimento, adicionarMeta, atualizarMeta 
    }}>
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context) throw new Error('usePortfolio deve ser usado dentro de um PortfolioProvider');
  return context;
};
