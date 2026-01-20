import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/NavBar/NavBarAdmin";
import Footer from "@/components/Footer/FooterAdmin";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="h-screen flex flex-col">
        <Navbar />
        <main>{children}</main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}

