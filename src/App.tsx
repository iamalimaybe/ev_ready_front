import { Outlet } from 'react-router-dom';
import Layout from './components/Layout';
import RouteMeta from './components/RouteMeta';

export default function App() {
  return (
    <Layout>
      <RouteMeta />
      <Outlet />
    </Layout>
  );
}
