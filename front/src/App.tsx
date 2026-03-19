import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ScrollToTop from './components/layout/ScrollToTop';
import Home from './pages/Home';
import Buy from './pages/Buy';
import Rent from './pages/Rent';
import Sell from './pages/Sell';
import Contact from './pages/Contact';
import PropertyPage from './pages/PropertyPage';

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
          <Route path="/connexion" element={<Placeholder title="Connexion" />} />
          <Route path="/inscription" element={<Placeholder title="Inscription" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

function Placeholder({ title }: { title: string }) {
  return (
    <div style={{ paddingTop: 200, textAlign: 'center', minHeight: '60vh' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: 12 }}>
        {title}
      </h1>
      <p style={{ color: 'var(--text-muted)' }}>Cette page sera disponible prochainement.</p>
    </div>
  );
}
