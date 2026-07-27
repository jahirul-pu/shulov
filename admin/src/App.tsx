import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AdminLayout } from './components/AdminLayout';
import { DashboardPage } from './pages/DashboardPage';
import { ProductsPage } from './pages/ProductsPage';
import { OrdersPage } from './pages/OrdersPage';
import { CouponsPage } from './pages/CouponsPage';
import { MegaMenuPage } from './pages/MegaMenuPage';

export const App: React.FC = () => {
  return (
    <Router>
      <AdminLayout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/megamenu" element={<MegaMenuPage />} />
          <Route path="/coupons" element={<CouponsPage />} />
        </Routes>
      </AdminLayout>
    </Router>
  );
};
export default App;
