import Link from "next/link";
import { 
  ArrowRight, ShoppingBag,Megaphone, AlertTriangle, Search } from "lucide-react";
import Footer from "@/components/Footer/FooterStudent";

export default function Home() {
  return (  
    <div className="min-h-screen bg-linear-to-b from-blue-50 to-white flex flex-col">
      
      {/* 1. NAVBAR */}
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <h1 className="text-2xl font-bold text-blue-700 tracking-tight">
          EchoCampus
        </h1>
        <Link 
          href="/auth/login" 
          className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-full hover:shadow-md transition"
        >
         Login
        </Link>
      </nav>

      {/* 2. HERO SECTION */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 mt-10 mb-20">
        <div className="bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
          🚀 The Ultimate Campus Companion
        </div>
        <h2 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
          Everything your campus <br />
          <span className="text-blue-600">in one place.</span>
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mb-10">
          Connect, trade, and stay updated. EchoCampus bridges the gap between students 
          and faculty with a secure, anonymous, and efficient platform.
        </p>
        
        <div className="flex gap-4">
          <Link 
            href="/auth/login" 
            className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg hover:shadow-blue-500/30"
          >
            Get Started <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </main>

      {/* 3. FEATURES GRID */}
      <section className="bg-white py-20 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <h3 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Why use EchoCampus?
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <FeatureCard 
              icon={<Megaphone className="w-6 h-6 text-blue-600" />}
              title="Announcements"
              desc="Never miss an update. Get official news from faculty instantly."
            />
            {/* Feature 2 */}
            <FeatureCard 
              icon={<ShoppingBag className="w-6 h-6 text-purple-600" />}
              title="Marketplace"
              desc="Buy and sell books, gadgets, and notes securely within campus."
            />
            {/* Feature 3 */}
            <FeatureCard 
              icon={<AlertTriangle className="w-6 h-6 text-orange-500" />}
              title="Anonymous Complaints"
              desc="Voice your concerns safely without revealing your identity."
            />
            {/* Feature 4 */}
            <FeatureCard 
              icon={<Search className="w-6 h-6 text-teal-600" />}
              title="Lost & Found"
              desc="Lost something? Report it and find it faster than ever."
            />
          </div>
        </div>
      </section>

      {/* 4. FOOTER */}
      <Footer/>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition group">
      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition">
        {icon}
      </div>
      <h4 className="text-xl font-bold text-gray-900 mb-2">{title}</h4>
      <p className="text-gray-600 leading-relaxed">{desc}</p>
    </div>
  );
}