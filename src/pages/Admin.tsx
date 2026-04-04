import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Shield, 
  User, 
  Search, 
  Activity, 
  Settings,
  Database,
  Briefcase,
  RefreshCw,
  AlertCircle,
  Plus,
  X,
  Mail,
  Lock,
  UserPlus
} from 'lucide-react';
import { adminApi } from '../api/admin';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function CreateUserModal({ isOpen, onClose, onSuccess }: CreateUserModalProps) {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName) {
      showToast('error', 'Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      // Transform username to email if needed
      const finalEmail = email.includes('@') ? email.trim() : `${email.trim()}@bepindia.com`;
      
      await adminApi.createUser(finalEmail, password, fullName);
      showToast('success', 'User created successfully');
      setEmail('');
      setPassword('');
      setFullName('');
      onSuccess();
      onClose();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="bg-gray-900 px-8 py-10 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-8 right-8 p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-indigo-500 rounded-2xl">
              <UserPlus className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight">Create User</h2>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Add System Resident</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-2 block">Full Name</label>
              <div className="relative">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-2 block">Username or Email</label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. rishi or rishi@bepindia.com"
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-2 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 bg-gray-50 text-gray-500 text-xs font-black rounded-2xl hover:bg-gray-100 transition-all uppercase tracking-widest"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] py-4 bg-indigo-600 text-white text-xs font-black rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all active:scale-95 uppercase tracking-widest flex items-center justify-center gap-2"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Create Resident
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Admin() {
  const { showToast } = useToast();
  const { user: currentUser } = useAuth();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // RESTRICTIVE CHECK: Only Abey can create users
  const isAuthorizedToCreate = currentUser?.email === 'abey.thomas@bepindia.com';

  const fetchData = async () => {
    setLoading(true);
    try {
      console.log('[Admin] Current User:', currentUser?.email);
      
      // Fetch separately to catch exactly which one fails
      const profilesData = await adminApi.getProfiles().catch(err => {
        console.error('[Admin] Profiles Error:', err);
        showToast('error', `Profiles Error: ${err.message || 'Unknown error'}`);
        return [];
      });
      
      const statsData = await adminApi.getSystemStats().catch(err => {
        console.error('[Admin] Stats Error:', err);
        showToast('error', `System Stats Error: ${err.message || 'Unknown error'}`);
        return { projects: 0, parts: 0, users: 0 };
      });

      setProfiles(profilesData);
      setStats(statsData);
    } catch (err: any) {
      console.error('[Admin] General Error:', err);
      showToast('error', `Failed to load administrative data: ${err.message || 'Unknown'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateRole = async (userId: string, currentRole: string) => {
    if (userId === currentUser?.id) {
      showToast('error', 'You cannot change your own role.');
      return;
    }

    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    setUpdatingUserId(userId);
    try {
      await adminApi.updateUserRole(userId, newRole);
      showToast('success', `User role updated to ${newRole}`);
      // Refresh list
      setProfiles(profiles.map((p: any) => p.id === userId ? { ...p, role: newRole } : p));
    } catch (err) {
      showToast('error', 'Failed to update user role');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const filteredProfiles = profiles.filter((p: any) => 
    p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && !profiles.length) {
    return (
      <div className="flex items-center justify-center h-full">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black tracking-tight text-gray-900 flex items-center gap-4">
              <div className="p-3 bg-gray-900 rounded-[1.25rem] shadow-xl shadow-gray-200">
                <Shield className="w-8 h-8 text-white" />
              </div>
              Admin Panel
            </h1>
          </div>
          <p className="text-gray-500 font-medium mt-3 ml-2">Secure system management and residency control.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchData}
            className="flex items-center gap-2 px-6 py-4 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all text-[10px] font-black uppercase tracking-widest shadow-sm active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Sync Data
          </button>
          
          {/* USER UI - ONLY VISIBLE FOR AUTHORIZED EMAIL */}
          {isAuthorizedToCreate && (
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-2xl hover:bg-gray-800 transition-all text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-gray-200 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Add Resident
            </button>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2rem] border border-gray-50 shadow-sm shadow-gray-100/50 flex items-center gap-6">
          <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100/50 shadow-sm shadow-blue-100/50">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">System Users</p>
            <p className="text-2xl font-black text-gray-900 tracking-tight tabular-nums">{stats?.users || 0}</p>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-gray-50 shadow-sm shadow-gray-100/50 flex items-center gap-6">
          <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100/50 shadow-sm shadow-indigo-100/50">
            <Briefcase className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Active Projects</p>
            <p className="text-2xl font-black text-gray-900 tracking-tight tabular-nums">{stats?.projects || 0}</p>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-gray-50 shadow-sm shadow-gray-100/50 flex items-center gap-6">
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100/50 shadow-sm shadow-emerald-100/50">
            <Database className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Stock Portfolio</p>
            <p className="text-2xl font-black text-gray-900 tracking-tight tabular-nums">{stats?.parts || 0}</p>
          </div>
        </div>
      </div>

      {/* User Management */}
      <div className="bg-white rounded-[2.5rem] border border-gray-50 shadow-sm shadow-gray-100/50 overflow-hidden">
        <div className="p-10 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gray-50 rounded-xl">
              <Users className="w-5 h-5 text-gray-900" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900 tracking-tight">System Residents</h2>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Manage access & roles</p>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-14 pr-6 py-4 bg-gray-50 border border-transparent rounded-2xl w-full md:w-80 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none text-sm font-bold"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
              <tr>
                <th className="px-10 py-6">Resident Profile</th>
                <th className="px-10 py-6">Control Level</th>
                <th className="px-10 py-6 text-center">Connection</th>
                <th className="px-10 py-6">Registration</th>
                <th className="px-10 py-6 text-right">Protocol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredProfiles.map((p: any) => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-10 py-8 whitespace-nowrap">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-gray-900 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-gray-200">
                        {p.email?.[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-black text-gray-900 tracking-tight">{p.full_name || 'Anonymous Resident'}</div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{p.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8 whitespace-nowrap">
                    <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      p.role === 'admin' 
                        ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                        : 'bg-blue-100 text-blue-700 border border-blue-200'
                    }`}>
                      {p.role}
                    </span>
                  </td>
                  <td className="px-10 py-8 whitespace-nowrap text-center">
                    <span className="inline-flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      Sync Active
                    </span>
                  </td>
                  <td className="px-10 py-8 whitespace-nowrap text-sm font-bold text-gray-500 tabular-nums">
                    {p.updated_at ? new Date(p.updated_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Pending'}
                  </td>
                  <td className="px-10 py-8 whitespace-nowrap text-right">
                    <button 
                      onClick={() => handleUpdateRole(p.id, p.role)}
                      disabled={updatingUserId === p.id || p.id === currentUser?.id}
                      className="px-6 py-3 bg-white border border-gray-100 text-[10px] font-black text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all uppercase tracking-widest shadow-sm disabled:opacity-30 disabled:cursor-not-allowed group-hover:shadow-md"
                    >
                      {updatingUserId === p.id ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        p.role === 'admin' ? 'Revoke Shield' : 'Elevate Access'
                      )}
                    </button>
                  </td>
                </tr>
              ))}
              {filteredProfiles.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-10 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-4 bg-gray-50 rounded-2xl">
                        <User className="w-8 h-8 text-gray-300" />
                      </div>
                      <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Zero inhabitants found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CreateUserModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchData}
      />
    </div>
  );
}
