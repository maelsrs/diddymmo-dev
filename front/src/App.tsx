import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ScrollToTop from './components/layout/ScrollToTop';
import Home from './pages/Home';
import Buy from './pages/Buy';
import Rent from './pages/Rent';
import Sell from './pages/Sell';
import Contact from './pages/Contact';
import PropertyPage from './pages/PropertyPage';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/acheter" element={<Buy />} />
          <Route path="/louer" element={<Rent />} />
          <Route path="/vendre" element={<Sell />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/bien/:id" element={<PropertyPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify" element={<VerifyEmail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
