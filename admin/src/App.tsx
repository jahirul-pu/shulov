import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AdminLayout } from './components/AdminLayout';
import { DashboardPage } from './pages/DashboardPage';
import { ProductsPage } from './pages/ProductsPage';
import { OrdersPage } from './pages/OrdersPage';
import { CouponsPage } from './pages/CouponsPage';
import { MegaMenuPage } from './pages/MegaMenuPage';
import { UsersPage } from './pages/UsersPage';
import { DeliverySettingsPage } from './pages/DeliverySettingsPage';
import { PopupsPage } from './pages/PopupsPage';

export const App: React.FC = () => {
  return (
    <Router>
      <AdminLayout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/megamenu" element={<MegaMenuPage />} />
          <Route path="/delivery-settings" element={<DeliverySettingsPage />} />
          <Route path="/coupons" element={<CouponsPage />} />
          <Route path="/popups" element={<PopupsPage />} />
        </Routes>
      </AdminLayout>
    </Router>
  );
};
export default App;
