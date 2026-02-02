"use client";
import { useState } from "react";
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { usePathname } from "next/navigation"; 
import { Menu, X, Home, User, MessageSquare, Mic, BookUser, ShieldAlert, Store, BellRing, LogOut } from "lucide-react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const navLinks = [
    { name: "Dashboard", href: "/main/faculty/dashboard", icon: Home },
    { name: "Annoucements", href: "/main/faculty/announcements", icon: BellRing },
    { name: "Directory", href: "/main/faculty/directory", icon: BookUser },
    { name: "Lost & Found", href: "/main/faculty/lost-found", icon: ShieldAlert },
    { name: "Profile", href: "/main/faculty/profile", icon: User },
  ];

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleLogout = async () => {
    // 1. Supabase Sign Out
    await supabase.auth.signOut();

    // 2. Clear Local Storage
    sessionStorage.removeItem('userSessionCode');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');

    // 3. Close Menu & Redirect
    setIsMenuOpen(false);
    router.push('/auth/login');
  };

  return (
    <>
      <nav className="bg-white shadow-lg border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo Container */}
            <div className="flex items-center">
              <div className="shrink-0 flex items-center">
                <span className="text-xl font-bold text-gray-900 tracking-tight">
                  Echo<span className="text-blue-600">Campus</span>
                </span>
              </div>
            </div>

            {/* Hamburger Menu Button */}
            <div className="flex items-center">
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-3 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 z-50"
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6 transform transition-transform duration-300" />
                ) : (
                  <Menu className="h-6 w-6 transform transition-transform duration-300" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Side Menu Overlay */}
      <div 
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
      >
        <div 
          className={`absolute inset-0 bg-black transition-opacity duration-300 ${isMenuOpen ? 'opacity-50' : 'opacity-0'}`}
          onClick={toggleMenu}
        />
        
        {/* Slide-out Panel */}
        <div 
          className={`absolute top-0 right-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          {/* 1. Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <span className="text-xl font-bold text-gray-900">
              Echo<span className="text-blue-600">Campus</span>
            </span>
            <button onClick={toggleMenu} className="p-2 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* 2. Scrollable Links Area */}
          <div className="flex-1 overflow-y-auto py-4 px-6">
            <nav className="space-y-2">
              {navLinks.map((link, index) => {
                const IconComponent = link.icon;
                const isActive = pathname === link.href;

                return (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={toggleMenu}
                    className={`group flex items-center px-4 py-3.5 rounded-xl text-base font-medium transition-all duration-200 
                      ${isActive 
                        ? "bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100" 
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }
                    `}
                    style={{ animationDelay: isMenuOpen ? `${index * 50}ms` : '0ms' }}
                  >
                    <IconComponent 
                      className={`w-5 h-5 mr-3 transition-colors 
                        ${isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"}
                      `} 
                    />
                    <span className="flex-1">{link.name}</span>
                    {isActive}
                  </a>
                );
              })}
            </nav>
          </div>

          {/* 3. Footer (Logout) - Pinned to bottom */}
          <div className="p-6 border-t border-gray-100 bg-gray-50/50">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center px-4 py-3 rounded-xl 
              font-medium text-red-600 bg-white border border-red-100 shadow-sm
              hover:bg-red-50 hover:border-red-200 hover:shadow-md 
              active:scale-95 transition-all duration-200"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Sign Out
            </button>
          </div>

        </div>
      </div>
    </>
  );
}