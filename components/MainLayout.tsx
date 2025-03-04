import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  BarChart3, 
  Calendar, 
  Settings, 
  Battery, 
  Sun, 
  Wind, 
  PlusCircle,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAssetListExpanded, setIsAssetListExpanded] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleAssetList = () => {
    setIsAssetListExpanded(!isAssetListExpanded);
  };

  const navItems = [
    { name: 'Dashboard', href: '/', icon: <Home className="w-5 h-5" /> },
    { name: 'Analytics', href: '/analytics', icon: <BarChart3 className="w-5 h-5" /> },
    { name: 'Schedulazione', href: '/schedule', icon: <Calendar className="w-5 h-5" /> },
    { name: 'Impostazioni', href: '/settings', icon: <Settings className="w-5 h-5" /> },
  ];

  const assets = [
    { name: 'Batteria Roma', href: '/asset/battery-roma', icon: <Battery className="w-5 h-5" /> },
    { name: 'Solare Milano', href: '/asset/solar-milano', icon: <Sun className="w-5 h-5" /> },
    { name: 'Eolico Napoli', href: '/asset/wind-napoli', icon: <Wind className="w-5 h-5" /> },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Overlay per mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-20 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto lg:z-auto ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo e header */}
          <div className="flex items-center justify-between p-4 border-b">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-700">
                <span className="text-white font-bold">V</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">Volta</span>
            </Link>
            <button 
              onClick={toggleSidebar}
              className="p-2 rounded-md text-gray-500 hover:bg-gray-100 lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigazione principale */}
          <nav className="flex-1 overflow-y-auto py-4 px-3">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.name}>
                  <Link 
                    href={item.href}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      pathname === item.href 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Lista asset */}
            <div className="mt-8">
              <button 
                onClick={toggleAssetList}
                className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
              >
                <span className="flex items-center">
                  <span className="mr-3">
                    <BarChart3 className="w-5 h-5" />
                  </span>
                  Asset Monitorati
                </span>
                <ChevronRight className={`w-4 h-4 transition-transform ${isAssetListExpanded ? 'rotate-90' : ''}`} />
              </button>

              {isAssetListExpanded && (
                <ul className="mt-1 pl-10 space-y-1">
                  {assets.map((asset) => (
                    <li key={asset.name}>
                      <Link 
                        href={asset.href}
                        className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                          pathname === asset.href 
                            ? 'bg-blue-50 text-blue-700' 
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <span className="mr-3">{asset.icon}</span>
                        {asset.name}
                      </Link>
                    </li>
                  ))}
                  
                  {/* Aggiungi nuovo asset */}
                  <li>
                    <Link 
                      href="/asset-registration"
                      className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      <span className="mr-3">
                        <PlusCircle className="w-5 h-5" />
                      </span>
                      Aggiungi Nuovo Asset
                    </Link>
                  </li>
                </ul>
              )}
            </div>
          </nav>

          {/* Footer della sidebar */}
          <div className="p-4 border-t text-center">
            <p className="text-xs text-gray-500">Volta Energy © 2023</p>
            <p className="text-xs text-gray-500">Versione 1.0.0</p>
          </div>
        </div>
      </aside>

      {/* Contenuto principale */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header per mobile */}
        <header className="bg-white shadow-sm border-b px-4 h-14 flex items-center lg:hidden">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md text-gray-500 hover:bg-gray-100"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="ml-4 flex items-center space-x-2">
            <div className="h-6 w-6 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-700">
              <span className="text-white text-xs font-bold">V</span>
            </div>
            <span className="font-semibold text-gray-900">Volta</span>
          </div>
        </header>

        {/* Area di contenuto principale */}
        <main className="flex-1 overflow-auto p-4 md:p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
} 