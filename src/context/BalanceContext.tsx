import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface BalanceContextData {
  entrada: number;
  saida: number;
  saldo: number;
  setEntrada: (valor: number) => void;
  setSaida: (valor: number) => void;
}

const BalanceContext = createContext({} as BalanceContextData);

export const BalanceProvider = ({ children }: { children: ReactNode }) => {
  const [entrada, setEntradaState] = useState(0);
  const [saida, setSaidaState] = useState(0);

  const setEntrada = (valor: number) => setEntradaState(Number(valor) || 0);
  const setSaida = (valor: number) => setSaidaState(Number(valor) || 0);

  const saldo = entrada - saida;

  return (
    <BalanceContext.Provider value={{ entrada, saida, saldo, setEntrada, setSaida }}>
      {children}
    </BalanceContext.Provider>
  );
};

export const useBalance = () => useContext(BalanceContext);
