import { Outlet } from 'react-router-dom';
import Header from './header/Header';

const Layout = () => {
  return (
    <div className="min-h-screen bg-c-bg flex flex-col">
      <Header />
      <main className="flex-1 px-6 py-6">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
