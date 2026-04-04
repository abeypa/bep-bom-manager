import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FolderTree, 
  Package, 
  ShoppingCart, 
  ArrowUpDown, 
  LogOut,
  ShieldCheck 
} from 'lucide-react';
import { supabase } from '../../lib/supabase';        // ← Fixed path
import { useRole } from '../../hooks/useRole';        // ← Fixed path

export default function AppLayout() {
  const { isAdmin, loading } = useRole();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading permissions...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold tracking-tight">BEP BOM</h1>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          <NavLink to="/dashboard" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-colors ${isActive ? 'bg-black text-white' : 'hover:bg-gray-100'}`}>
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </NavLink>

          <NavLink to="/projects" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-colors ${isActive ? 'bg-black text-white' : 'hover:bg-gray-100'}`}>
            <FolderTree className="w-5 h-5" />
            Projects
          </NavLink>

          <NavLink to="/parts" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-colors ${isActive ? 'bg-black text-white' : 'hover:bg-gray-100'}`}>
            <Package className="w-5 h-5" />
            Parts Master
          </NavLink>

          <NavLink to="/purchase-orders" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-colors ${isActive ? 'bg-black text-white' : 'hover:bg-gray-100'}`}>
            <ShoppingCart className="w-5 h-5" />
            Purchase Orders
          </NavLink>

          <NavLink to="/stock-movement" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-colors ${isActive ? 'bg-black text-white' : 'hover:bg-gray-100'}`}>
            <ArrowUpDown className="w-5 h-5" />
            Stock In / Out
          </NavLink>

          {/* Admin Only */}
          {isAdmin && (
            <NavLink to="/admin" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-colors ${isActive ? 'bg-black text-white' : 'hover:bg-gray-100'}`}>
              <ShieldCheck className="w-5 h-5" />
              Admin Panel
            </NavLink>
          )}
        </nav>

        <div className="p-4 border-t mt-auto">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-2xl text-sm font-medium"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}
