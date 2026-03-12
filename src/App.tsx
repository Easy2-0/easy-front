import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';

import { ThemeProvider } from './context/ThemeContext';
import Login from './components/login/Login';
import Cadastro from './components/cadastro/Cadastro';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import Geral from './components/geral/Geral';
import Gastos from './components/gastos/Gastos';
import Saldo from './components/saldo/Saldo';
import Cripto from './components/cripto/Cripto';
import TelaPlaceholder from './components/tela-placeholder/TelaPlaceholder';
import Calculadora from './components/investimentos/Calculadora';
import Calendario from './components/calendario/Calendario';

function App() {
  return (
    <ThemeProvider>
    <BrowserRouter>
      <Routes>
        {/* Rotas públicas */}
        <Route path="/" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />

        {/* Rotas protegidas */}
        <Route element={<PrivateRoute />}>
          <Route element={<Layout />}>
            <Route path="/geral" element={<Geral />} />
            <Route path="/gastos" element={<Gastos />} />
            <Route path="/saldo" element={<Saldo />} />
            <Route path="/cripto" element={<Cripto />} />
            <Route path="/investimentos" element={<Calculadora />} />
            <Route path="/calendario" element={<Calendario />} />
          </Route>
        </Route>

        {/* Rota não encontrada */}
        <Route path="*" element={<TelaPlaceholder mensagem="Página não encontrada." />} />
      </Routes>
    </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
