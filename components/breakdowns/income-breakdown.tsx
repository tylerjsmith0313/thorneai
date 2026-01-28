"use client"

import React, { useEffect, useState } from 'react'
import { X, Sparkles, TrendingUp, Calendar, CheckCircle2, RotateCcw, Clock } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { Deal, InsightReport } from '@/types.ts'

interface IncomeBreakdownProps {
  deals: Deal[]
  onClose: () => void
}

export function IncomeBreakdown({ deals, onClose }: IncomeBreakdownProps) {
  const [insights, setInsights] = useState<InsightReport | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate AI analysis
    const timer = setTimeout(() => {
      setInsights({
        summary: "Your revenue stream shows healthy diversification with a strong recurring base of $15,500 monthly.",
        forecast: "Based on current velocity, expect 23% growth next quarter if pipeline converts at historical rates.",
        recommendations: [
          "Focus on expanding enterprise tier",
          "Upsell existing recurring clients",
          "Close pending Q1 deals faster"
        ]
      })
      setLoading(false)
    }, 1200)
    return () => clearTimeout(timer)
  }, [deals])

  const earned = deals.filter(d => d.status === 'closed-won')
  const open = deals.filter(d => d.status === 'open' || d.isMonthlyRecurring)

  const chartData = [
    { name: 'Earned (Closed)', value: earned.reduce((a, b) => a + b.amount, 0), color: '#4f46e5' },
    { name: 'Open Pipeline', value: open.reduce((a, b) => a + b.amount, 0), color: '#818cf8' },
  ]

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden relative flex flex-col animate-in fade-in zoom-in duration-300">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Income Breakdown</h2>
            <p className="text-sm text-slate-500">Comprehensive view of your earned and projected earnings.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Charts and Quick Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900 mb-6">Distribution Summary</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <Tooltip 
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={60}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-200">
                <p className="text-indigo-100 text-xs font-medium uppercase tracking-wider mb-1">Total Earned</p>
                <h4 className="text-2xl font-bold">{formatCurrency(chartData[0].value)}</h4>
                <div className="mt-2 h-1 bg-indigo-400 rounded-full w-full overflow-hidden">
                  <div className="h-full bg-white w-3/4 rounded-full" />
                </div>
              </div>
              <div className="p-4 bg-white border border-slate-200 rounded-2xl">
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">Total Potential</p>
                <h4 className="text-2xl font-bold text-slate-900">{formatCurrency(chartData[1].value)}</h4>
                <p className="text-[10px] text-slate-400 mt-2">Includes recurring and open deals</p>
              </div>
            </div>
          </div>

          {/* AI Insights */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100 relative overflow-hidden">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h3 className="text-sm font-bold text-indigo-900">AI Intelligence Report</h3>
            </div>
            
            {loading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-indigo-200/50 rounded w-3/4" />
                <div className="h-4 bg-indigo-200/50 rounded w-1/2" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-indigo-700 uppercase mb-1">Current Standing</h4>
                    <p className="text-sm text-slate-700 leading-relaxed">{insights?.summary}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-indigo-700 uppercase mb-1">Forecast</h4>
                    <p className="text-sm text-slate-700 leading-relaxed">{insights?.forecast}</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-indigo-100">
                   <h4 className="text-xs font-bold text-indigo-700 uppercase mb-2">Strategy Recommendations</h4>
                   <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                     {insights?.recommendations.map((rec, i) => (
                       <li key={i} className="flex items-center text-sm text-slate-700">
                         <TrendingUp className="w-3 h-3 text-indigo-500 mr-2" />
                         {rec}
                       </li>
                     ))}
                   </ul>
                </div>
              </div>
            )}
          </div>

          {/* Detailed List */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center">
              <Calendar className="w-4 h-4 mr-2" /> Recent Transactions & Opportunities
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="py-3 px-4 text-xs font-bold text-slate-400 uppercase">Client</th>
                    <th className="py-3 px-4 text-xs font-bold text-slate-400 uppercase">Type</th>
                    <th className="py-3 px-4 text-xs font-bold text-slate-400 uppercase">Status</th>
                    <th className="py-3 px-4 text-xs font-bold text-slate-400 uppercase text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {deals.map(deal => (
                    <tr key={deal.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-4">
                        <span className="text-sm font-semibold text-slate-800">{deal.clientName}</span>
                      </td>
                      <td className="py-4 px-4">
                        {deal.isMonthlyRecurring ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                            <RotateCcw className="w-3 h-3 mr-1" /> Recurring
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                            One-time
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {deal.status === 'closed-won' ? (
                          <span className="inline-flex items-center text-xs font-medium text-green-600">
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Won
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-xs font-medium text-amber-500">
                            <Clock className="w-3 h-3 mr-1" /> Open
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="text-sm font-bold text-slate-900">{formatCurrency(deal.amount)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
