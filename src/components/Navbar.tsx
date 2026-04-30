import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Leaf, Boxes, Calendar, BarChart3, User, LogOut, PlusCircle, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Home', path: '/', icon: Leaf },
    { name: 'Items', path: '/items', icon: Boxes },
    { name: 'Events', path: '/events', icon: Calendar },
    { name: 'Cleanup', path: '/cleanup', icon: Shield },
    { name: 'Dashboard', path: '/dashboard', icon: BarChart3 },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 md:relative md:border-t-0 md:border-b md:bg-white/80 md:backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-2 md:px-4">
        <div className="flex justify-between items-center h-16 md:h-20">
          <Link to="/" className="hidden md:flex items-center space-x-2 text-primary group">
            <Leaf className="w-8 h-8 fill-secondary group-hover:rotate-12 transition-transform" />
            <span className="font-black text-xl tracking-tighter">EcoShare</span>
          </Link>

          {/* Nav Items */}
          <div className="flex flex-1 md:flex-none justify-around items-center h-full overflow-x-auto no-scrollbar md:space-x-1 lg:space-x-4 px-1 md:px-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex flex-col md:flex-row items-center justify-center min-w-[50px] md:min-w-0 md:space-x-2 p-1.5 md:p-2.5 rounded-xl transition-all duration-200 shrink-0",
                    isActive 
                      ? "text-primary md:bg-accent/10" 
                      : "text-gray-400 md:hover:text-secondary md:hover:bg-surface"
                  )}
                >
                  <Icon className={cn("w-5 h-5 md:w-6 md:h-6", isActive && "stroke-[2.5px] text-primary")} />
                  <span className={cn(
                    "text-[8px] md:text-xs lg:text-sm font-black uppercase tracking-tighter md:tracking-normal",
                    isActive ? "text-primary" : "hidden md:block"
                  )}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
            
            {/* Profile Link */}
            {user ? (
              <Link
                to="/profile"
                className={cn(
                  "flex flex-col md:flex-row items-center justify-center min-w-[50px] md:min-w-0 md:space-x-2 p-1.5 md:p-2.5 rounded-xl transition-all duration-200",
                  location.pathname === '/profile' ? "text-primary md:bg-accent/10" : "text-gray-400"
                )}
              >
                <User className={cn("w-5 h-5 md:w-6 md:h-6", location.pathname === '/profile' && "text-primary")} />
                <span className={cn(
                  "text-[8px] md:text-xs lg:text-sm font-black uppercase tracking-tighter md:tracking-normal",
                  location.pathname === '/profile' ? "text-primary" : "hidden md:block"
                )}>
                  Profile
                </span>
              </Link>
            ) : (
              <Link
                to="/login"
                className={cn(
                  "flex flex-col md:flex-row items-center justify-center min-w-[50px] md:min-w-0 md:space-x-2 p-1.5 md:p-2.5 rounded-xl transition-all duration-200",
                  "text-gray-400 hover:text-primary"
                )}
              >
                <User className="w-5 h-5 md:w-6 md:h-6" />
                <span className="text-[8px] md:text-xs lg:text-sm font-black uppercase tracking-tighter md:tracking-normal">Login</span>
              </Link>
            )}

            {/* Standalone Logout Button */}
            {user && (
              <button
                onClick={handleLogout}
                className="flex flex-col md:flex-row items-center justify-center min-w-[50px] md:min-w-0 md:space-x-2 p-1.5 md:p-2.5 text-gray-400 hover:text-red-500 transition-colors shrink-0"
              >
                <LogOut className="w-5 h-5 md:w-6 md:h-6" />
                <span className="text-[8px] md:text-xs lg:text-sm font-black uppercase tracking-tighter hidden md:block">Logout</span>
              </button>
            )}
          </div>

          <div className="hidden lg:flex items-center space-x-4">
            <Link 
              to="/items/add"
              className="bg-primary text-surface px-5 py-2.5 rounded-2xl font-black uppercase text-xs flex items-center space-x-2 hover:bg-primary/90 transition-all shadow-xl shadow-primary/10 active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post Item</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
