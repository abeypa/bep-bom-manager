import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useState } from 'react'
import { 
  Menu, X, Home, Package, FolderKanban, FileText, 
  Users, BarChart3, LogOut, ArrowLeftRight, LayoutDashboard,
  FolderTree, ShoppingCart, ArrowUpDown, ChevronRight
} from 'lucide-react'

const AppLayout = () => {
  const { user, signOut } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', href: '/projects', icon: FolderTree },
    { name: 'Parts Master', href: '/parts', icon: Package },
    { name: 'Purchase Orders', href: '/purchase-orders', icon: ShoppingCart },
    { name: 'Stock Movement', href: '/stock-movement', icon: ArrowUpDown },
    //{ name: 'Suppliers', href: '/suppliers', icon: Users },
    //{ name: 'Usage Logs', href: '/part-usage-logs', icon: BarChart3 },
  ]

  const isActive = (href: string) => {
    if (href === '/projects') return location.pathname === '/projects' || location.pathname.startsWith('/projects/')
    return location.pathname === href
  }

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900">
      {/* Sidebar for desktop */}
      <div className="hidden md:flex md:w-72 md:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-100 shadow-sm overflow-y-auto">
          {/* Logo Section */}
          <div className="flex items-center h-20 px-8 border-b border-gray-50">
            <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center shadow-lg shadow-gray-200">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <span className="text-xl font-black tracking-tighter text-gray-900">BEP BOM</span>
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest -mt-1">Manager V3</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="mt-8 flex-grow flex flex-col px-4">
            <p className="px-4 text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mb-4">Core Modules</p>
            <nav className="flex-1 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                return (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={({ isActive: linkActive }) =>
                      `group flex items-center justify-between px-4 py-3.5 text-sm font-bold rounded-2xl transition-all duration-200 ${
                        linkActive
                          ? 'bg-gray-900 text-white shadow-xl shadow-gray-200 scale-[1.02]'
                          : 'text-gray-400 hover:bg-gray-50 hover:text-gray-900'
                      }`
                    }
                  >
                    <div className="flex items-center">
                      <Icon className={`mr-3 h-5 w-5 ${active ? 'text-white' : 'text-gray-300 group-hover:text-gray-900'}`} />
                      {item.name}
                    </div>
                    {active && <ChevronRight className="w-4 h-4 opacity-50" />}
                  </NavLink>
                )
              })}
            </nav>
          </div>

          {/* User Profile / Logout Section */}
          <div className="p-4 border-t border-gray-50 bg-gray-50/30">
            <div className="flex items-center p-4 bg-white border border-gray-100 rounded-[1.5rem] shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 font-black text-sm uppercase">
                {user?.email?.charAt(0) || 'U'}
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-xs font-black text-gray-900 truncate tracking-tight">{user?.email?.split('@')[0]}</p>
                <p className="text-[10px] text-gray-400 truncate font-medium">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={() => signOut()}
              className="mt-3 flex items-center justify-center gap-2 w-full px-4 py-3 text-red-500 hover:bg-red-50 rounded-2xl text-xs font-black uppercase tracking-widest transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Mobile sidebar toggle */}
      <div className={`fixed inset-0 z-40 md:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)}></div>
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white h-full transform transition-transform duration-300">
           {/* Mobile Sidebar Content (similar structure to desktop) */}
           <div className="flex items-center h-20 px-8 border-b border-gray-50">
            <Package className="h-8 w-8 text-gray-900" />
            <span className="ml-3 text-xl font-black text-gray-900 tracking-tighter">BEP BOM</span>
          </div>
          <nav className="mt-8 px-4 space-y-1">
             {navigation.map((item) => (
               <NavLink
                 key={item.name}
                 to={item.href}
                 onClick={() => setSidebarOpen(false)}
                 className={({ isActive: linkActive }) =>
                   `flex items-center px-4 py-4 text-sm font-bold rounded-2xl transition-all ${
                     linkActive ? 'bg-gray-900 text-white shadow-xl' : 'text-gray-400'
                   }`
                 }
               >
                 <item.icon className="mr-3 h-5 w-5" />
                 {item.name}
               </NavLink>
             ))}
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="md:hidden flex items-center justify-between px-6 h-20 bg-white border-b border-gray-100">
           <span className="text-xl font-black text-gray-900 tracking-tighter uppercase">BEP BOM</span>
           <button
             onClick={() => setSidebarOpen(true)}
             className="p-2.5 bg-gray-50 rounded-xl text-gray-600"
           >
             <Menu className="h-6 w-6" />
           </button>
        </header>

        <main className="flex-1 overflow-y-auto bg-gray-50/50">
           <div className="max-w-[1400px] mx-auto min-h-full">
              <Outlet />
           </div>
        </main>
      </div>
    </div>
  )
}

export default AppLayout
