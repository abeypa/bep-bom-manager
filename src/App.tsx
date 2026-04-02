import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/layout/ProtectedRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Parts from './pages/Parts'
import Projects from './pages/Projects'
import PurchaseOrders from './pages/PurchaseOrders'
import Suppliers from './pages/Suppliers'
import PartUsageLogs from './pages/PartUsageLogs'
import AppLayout from './components/layout/AppLayout'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="parts" element={<Parts />} />
              <Route path="projects" element={<Projects />} />
              <Route path="purchase-orders" element={<PurchaseOrders />} />
              <Route path="suppliers" element={<Suppliers />} />
              <Route path="part-usage-logs" element={<PartUsageLogs />} />
            </Route>
          </Routes>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  )
}

export default App