import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import ScrollToTop from "./components/layout/ScrollToTop";
import RequireAuth from "./components/guards/RequireAuth";
import RequireRole from "./components/guards/RequireRole";
import AdminLayout from "./components/layout/AdminLayout";
import ClientLayout from "./components/layout/ClientLayout";
import Home from "./pages/Home";
import Buy from "./pages/Buy";
import Rent from "./pages/Rent";
import Sell from "./pages/Sell";
import Contact from "./pages/Contact";
import PropertyPage from "./pages/PropertyPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminUserEdit from "./pages/admin/AdminUserEdit";
import AdminProperties from "./pages/admin/AdminProperties";
import AdminPropertyNew from "./pages/admin/AdminPropertyNew";
import AdminPropertyEdit from "./pages/admin/AdminPropertyEdit";
import AdminDocuments from "./pages/admin/AdminDocuments";
import AdminTickets from "./pages/admin/AdminTickets";
import AdminTicketDetail from "./pages/admin/AdminTicketDetail";
import ClientDashboard from "./pages/client/ClientDashboard";
import ClientPropertyDetail from "./pages/client/ClientPropertyDetail";
import ClientDocuments from "./pages/client/ClientDocuments";
import ClientTickets from "./pages/client/ClientTickets";
import ClientTicketNew from "./pages/client/ClientTicketNew";
import ClientTicketDetail from "./pages/client/ClientTicketDetail";

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Public routes */}
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

        <Route element={<RequireAuth />}>
          <Route element={<ClientLayout />}>
            <Route path="/espace-client" element={<ClientDashboard />} />
            <Route
              path="/espace-client/biens/:id"
              element={<ClientPropertyDetail />}
            />
            <Route
              path="/espace-client/documents"
              element={<ClientDocuments />}
            />
            <Route path="/espace-client/tickets" element={<ClientTickets />} />
            <Route
              path="/espace-client/tickets/nouveau"
              element={<ClientTicketNew />}
            />
            <Route
              path="/espace-client/tickets/:id"
              element={<ClientTicketDetail />}
            />
          </Route>
        </Route>

        <Route element={<RequireRole roles={["EMPLOYEE", "ADMINISTRATOR"]} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/users/:id" element={<AdminUserEdit />} />
            <Route path="/admin/properties" element={<AdminProperties />} />
            <Route
              path="/admin/properties/new"
              element={<AdminPropertyNew />}
            />
            <Route
              path="/admin/properties/:id"
              element={<AdminPropertyEdit />}
            />
            <Route path="/admin/documents" element={<AdminDocuments />} />
            <Route path="/admin/tickets" element={<AdminTickets />} />
            <Route path="/admin/tickets/:id" element={<AdminTicketDetail />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
