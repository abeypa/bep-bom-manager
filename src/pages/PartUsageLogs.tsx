import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Search, FileClock, Calendar, History, Box, Briefcase, MapPin } from 'lucide-react'

const PartUsageLogs = () => {
  const [searchTerm, setSearchTerm] = useState('')

  const { data: logs, isLoading } = useQuery<any[]>({
    queryKey: ['part-usage-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('part_usage_logs')
        .select('*')
        .order('use_date_time', { ascending: false })
      if (error) throw error
      return data
    }
  })

  const filteredLogs = (logs || []).filter(log => 
    log.part_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.site_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Part Usage Logs</h1>
        <p className="mt-1 text-sm text-gray-600">
          History of all parts used across projects and sites.
        </p>
      </div>

      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 px-3 border outline-none"
            placeholder="Search by part number, project, or site..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-hidden bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg border border-gray-200">
        <div className="h-full overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Part Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Site</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                Array(10).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse h-12">
                    <td colSpan={5} className="px-6 py-4">
                      <div className="h-4 bg-gray-100 rounded w-full"></div>
                    </td>
                  </tr>
                ))
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-24 text-center text-gray-500 bg-gray-50/50">
                    <History className="mx-auto h-12 w-12 text-gray-200 mb-4" />
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">No usage history recorded</h3>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-xs text-gray-600 font-mono">
                        <Calendar className="h-3 w-3 mr-2 text-gray-400" />
                        {new Date(log.use_date_time).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm font-bold text-gray-900 uppercase tracking-tight">
                        <Briefcase className="h-4 w-4 text-primary-500 mr-2 opacity-70" />
                        {log.project_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Box className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm font-mono font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded">{log.part_number}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-gray-900 tabular-nums">
                      {log.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500 italic">
                        <MapPin className="h-3 w-3 text-red-400 mr-1.5" />
                        {log.site_name || 'Generic Site'}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default PartUsageLogs
