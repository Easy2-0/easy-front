import { Navigate, Outlet } from 'react-router-dom';
import { usuarioService } from '../services/usuarioService';

const PrivateRoute = () => {
  const autenticado = usuarioService.isAutenticado();
  return autenticado ? <Outlet /> : <Navigate to="/" replace />;
};

export default PrivateRoute;
