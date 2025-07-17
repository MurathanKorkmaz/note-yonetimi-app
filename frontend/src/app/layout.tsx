'use client';

import './globals.css';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuth();



  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Başarıyla çıkış yaptınız');
      router.push('/');
    } catch (error) {
      toast.error('Çıkış yapılırken bir hata oluştu');
    }
  };

  return (
    <html lang="tr" className="h-full">
      <body className={`${inter.className} min-h-full`}>
        <div className="min-h-screen flex flex-col">
          {/* Navbar */}
          <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50 shadow-sm">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
              {/* Logo */}
              <Link 
                href={isAuthenticated ? "/notes" : "/"} 
                className="flex items-center space-x-2 group"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent group-hover:from-orange-600 group-hover:to-orange-700 transition-all duration-200">
                  Ders Notları
                </span>
              </Link>

              {/* Navigation Links - sadece giriş yapılmışsa göster */}
              {isAuthenticated && (
                <div className="hidden md:flex items-center space-x-8">
                  <Link 
                    href="/notes" 
                    className="text-gray-600 hover:text-orange-600 transition-colors duration-200 font-medium"
                  >
                    Notlarım
                  </Link>
                </div>
              )}

              {/* Auth Buttons or User Menu */}
              <div className="flex items-center space-x-4">
                {isAuthenticated ? (
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 px-3 py-1 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {user?.firstName} {user?.lastName}
                      </span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 hover:border-orange-300 hover:text-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-100 transition-all duration-200 font-medium"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Çıkış Yap
                    </button>
                  </div>
                ) : (
                  <>
                    <Link 
                      href="/login" 
                      className="inline-flex items-center px-4 py-2 text-gray-700 hover:text-orange-600 transition-colors duration-200 font-medium"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      Giriş Yap
                    </Link>
                    <Link 
                      href="/register" 
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-4 focus:ring-orange-100 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      Kayıt Ol
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </header>

          {/* Main Content */}
          <main className="flex-1 bg-gray-50">
            {children}
          </main>

          {/* Footer */}
          <footer className="bg-white border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <p className="text-sm text-gray-500 text-center">
                © 2024 Ders Notları Sistemi. Tüm hakları saklıdır.
              </p>
            </div>
          </footer>
        </div>
        <Toaster 
          position="top-center"
          toastOptions={{
            className: 'bg-white border shadow-lg',
            duration: 3000,
            style: {
              maxWidth: '500px',
              textAlign: 'center'
            }
          }}
        />
      </body>
    </html>
  );
}
