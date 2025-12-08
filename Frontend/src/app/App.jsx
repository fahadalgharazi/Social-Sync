import { Outlet } from "react-router-dom";
import { Toaster } from "sonner";
import Navbar from "../components/NavBar.jsx";
import Footer from "../components/Footer.jsx";

export default function App() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
      <Toaster position="top-right" richColors />
    </>
  );
}
