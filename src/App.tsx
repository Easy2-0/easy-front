import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';

import { ThemeProvider } from './context/ThemeContext';
import Login from './components/login/Login';
import Cadastro from './components/cadastro/Cadastro';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import Geral from './components/geral/Geral';
import Gastos from './components/gastos/Gastos';
import TelaPlaceholder from './components/tela-placeholder/TelaPlaceholder';
import Saldo from './components/saldo/Saldo';

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
            <Route path="/investimentos" element={<TelaPlaceholder mensagem="Tela de investimentos em construção..." />} />
            <Route path="/calendario" element={<TelaPlaceholder mensagem="Tela de calendário em construção..." />} />
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
