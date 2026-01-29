"use client"

import React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  MessageSquare, 
  Target,
  Activity,
  BarChart3,
  PieChart,
  Download,
  RefreshCw,
  Brain,
  Zap
} from "lucide-react"

interface DashboardMetrics {
  totalContacts: number
  activeContacts: number
  newContactsThisPeriod: number
  contactGrowthRate: number
  totalOpportunities: number
  openOpportunities: number
  wonOpportunities: number
  lostOpportunities: number
  totalPipelineValue: number
  wonRevenue: number
  averageDealSize: number
  winRate: number
  totalConversations: number
  activeConversations: number
  responseRate: number
  averageResponseTime: number
  engagementScore: number
  heatScore: number
}

interface ContactAnalytics {
  totalCount: number
  byStatus: Record<string, number>
  bySource: Record<string, number>
  byIndustry: Record<string, number>
  engagementDistribution: { low: number; medium: number; high: number }
  growthTrend: Array<{ timestamp: string; value: number; label?: string }>
  topEngaged: Array<{ id: string; name: string; score: number }>
}

interface RevenueAnalytics {
  totalRevenue: number
  projectedRevenue: number
  averageDealSize: number
  revenueByMonth: Array<{ timestamp: string; value: number; label?: string }>
  revenueByProduct: Array<{ product: string; revenue: number; count: number }>
  revenueByStage: Record<string, number>
  forecastAccuracy: number
}

interface AnalyticsDashboardProps {
  onClose?: () => void
}

export function AnalyticsDashboard({ onClose }: AnalyticsDashboardProps) {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [contactAnalytics, setContactAnalytics] = useState<ContactAnalytics | null>(null)
  const [revenueAnalytics, setRevenueAnalytics] = useState<RevenueAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    loadAnalytics()
  }, [])

  async function loadAnalytics() {
    setLoading(true)
    try {
      const response = await fetch("/api/analytics")
      if (response.ok) {
        const data = await response.json()
        setMetrics(data.metrics)
        setContactAnalytics(data.contactAnalytics)
        setRevenueAnalytics(data.revenueAnalytics)
      }
    } catch (error) {
      console.error("Failed to load analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  async function generateReport(type: string) {
    try {
      const response = await fetch(`/api/analytics/report?type=${type}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${type}-report-${new Date().toISOString().split('T')[0]}.json`
        a.click()
      }
    } catch (error) {
      console.error("Failed to generate report:", error)
    }
  }

  const MetricCard = ({ 
    title, 
    value, 
    change, 
    icon: Icon, 
    color = "text-slate-600",
    prefix = "",
    suffix = ""
  }: { 
    title: string
    value: number | string
    change?: number
    icon: React.ComponentType<{ className?: string }>
    color?: string
    prefix?: string
    suffix?: string
  }) => (
    <Card className="bg-white border-slate-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{title}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
            </p>
            {change !== undefined && (
              <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                <span>{Math.abs(change)}% vs last period</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-xl bg-slate-50 ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const ProgressBar = ({ label, value, max, color = "bg-indigo-500" }: { label: string; value: number; max: number; color?: string }) => (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-slate-600">{label}</span>
        <span className="font-medium text-slate-900">{value}</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} rounded-full transition-all duration-500`}
          style={{ width: `${Math.min((value / max) * 100, 100)}%` }}
        />
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <Card className="w-96 bg-white">
          <CardContent className="p-8 flex flex-col items-center gap-4">
            <div className="animate-spin">
              <Brain className="w-8 h-8 text-indigo-600" />
            </div>
            <p className="text-slate-600 font-medium">AgyntSynq Intelligence processing...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-auto">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-auto bg-white">
        <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-slate-900 to-indigo-900 text-white sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-xl">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold">AGYNTSYNQ INTELLIGENCE</CardTitle>
                <CardDescription className="text-slate-300">Real-time Analytics & Intelligence</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={loadAnalytics} className="text-white hover:bg-white/10">
                <RefreshCw size={16} className="mr-2" />
                Refresh
              </Button>
              <Button variant="ghost" size="sm" onClick={() => generateReport('monthly')} className="text-white hover:bg-white/10">
                <Download size={16} className="mr-2" />
                Export
              </Button>
              {onClose && (
                <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/10">
                  Close
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6 bg-slate-100">
              <TabsTrigger value="overview" className="gap-2">
                <BarChart3 size={14} />
                Overview
              </TabsTrigger>
              <TabsTrigger value="contacts" className="gap-2">
                <Users size={14} />
                Contacts
              </TabsTrigger>
              <TabsTrigger value="revenue" className="gap-2">
                <DollarSign size={14} />
                Revenue
              </TabsTrigger>
              <TabsTrigger value="performance" className="gap-2">
                <Activity size={14} />
                Performance
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard 
                  title="Total Contacts" 
                  value={metrics?.totalContacts || 0}
                  change={metrics?.contactGrowthRate}
                  icon={Users}
                  color="text-blue-600"
                />
                <MetricCard 
                  title="Pipeline Value" 
                  value={metrics?.totalPipelineValue || 0}
                  icon={Target}
                  color="text-emerald-600"
                  prefix="$"
                />
                <MetricCard 
                  title="Won Revenue" 
                  value={metrics?.wonRevenue || 0}
                  icon={DollarSign}
                  color="text-green-600"
                  prefix="$"
                />
                <MetricCard 
                  title="Win Rate" 
                  value={metrics?.winRate || 0}
                  icon={TrendingUp}
                  color="text-indigo-600"
                  suffix="%"
                />
              </div>

              {/* Secondary Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard 
                  title="Active Contacts" 
                  value={metrics?.activeContacts || 0}
                  icon={Zap}
                  color="text-amber-600"
                />
                <MetricCard 
                  title="Open Opportunities" 
                  value={metrics?.openOpportunities || 0}
                  icon={Target}
                  color="text-purple-600"
                />
                <MetricCard 
                  title="Conversations" 
                  value={metrics?.totalConversations || 0}
                  icon={MessageSquare}
                  color="text-cyan-600"
                />
                <MetricCard 
                  title="Engagement Score" 
                  value={metrics?.engagementScore || 0}
                  icon={Activity}
                  color="text-rose-600"
                  suffix="/100"
                />
              </div>

              {/* Charts Section */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-slate-50 border-slate-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold text-slate-700">Pipeline by Stage</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {revenueAnalytics?.revenueByStage && Object.entries(revenueAnalytics.revenueByStage).map(([stage, value]) => (
                      <ProgressBar 
                        key={stage}
                        label={stage.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        value={value}
                        max={Math.max(...Object.values(revenueAnalytics.revenueByStage))}
                        color={stage === 'closed_won' ? 'bg-emerald-500' : stage === 'closed_lost' ? 'bg-red-500' : 'bg-indigo-500'}
                      />
                    ))}
                  </CardContent>
                </Card>

                <Card className="bg-slate-50 border-slate-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold text-slate-700">Contact Engagement Distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {contactAnalytics?.engagementDistribution && (
                      <>
                        <ProgressBar 
                          label="High Engagement (70+)"
                          value={contactAnalytics.engagementDistribution.high}
                          max={contactAnalytics.totalCount || 1}
                          color="bg-emerald-500"
                        />
                        <ProgressBar 
                          label="Medium Engagement (40-69)"
                          value={contactAnalytics.engagementDistribution.medium}
                          max={contactAnalytics.totalCount || 1}
                          color="bg-amber-500"
                        />
                        <ProgressBar 
                          label="Low Engagement (<40)"
                          value={contactAnalytics.engagementDistribution.low}
                          max={contactAnalytics.totalCount || 1}
                          color="bg-red-500"
                        />
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="contacts" className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="bg-slate-50 border-slate-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold text-slate-700">By Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {contactAnalytics?.byStatus && Object.entries(contactAnalytics.byStatus).map(([status, count]) => (
                      <div key={status} className="flex justify-between items-center py-1">
                        <span className="text-sm text-slate-600 capitalize">{status}</span>
                        <span className="text-sm font-semibold text-slate-900">{count}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="bg-slate-50 border-slate-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold text-slate-700">By Source</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {contactAnalytics?.bySource && Object.entries(contactAnalytics.bySource).slice(0, 6).map(([source, count]) => (
                      <div key={source} className="flex justify-between items-center py-1">
                        <span className="text-sm text-slate-600 capitalize">{source}</span>
                        <span className="text-sm font-semibold text-slate-900">{count}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="bg-slate-50 border-slate-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold text-slate-700">By Industry</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {contactAnalytics?.byIndustry && Object.entries(contactAnalytics.byIndustry).slice(0, 6).map(([industry, count]) => (
                      <div key={industry} className="flex justify-between items-center py-1">
                        <span className="text-sm text-slate-600 capitalize">{industry}</span>
                        <span className="text-sm font-semibold text-slate-900">{count}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-slate-50 border-slate-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-slate-700">Top Engaged Contacts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {contactAnalytics?.topEngaged?.map((contact, index) => (
                      <div key={contact.id} className="flex items-center justify-between p-2 bg-white rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </span>
                          <span className="text-sm font-medium text-slate-900">{contact.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-indigo-500 rounded-full"
                              style={{ width: `${contact.score}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-slate-600 w-8">{contact.score}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="revenue" className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard 
                  title="Total Revenue" 
                  value={revenueAnalytics?.totalRevenue || 0}
                  icon={DollarSign}
                  color="text-emerald-600"
                  prefix="$"
                />
                <MetricCard 
                  title="Projected Revenue" 
                  value={revenueAnalytics?.projectedRevenue || 0}
                  icon={TrendingUp}
                  color="text-blue-600"
                  prefix="$"
                />
                <MetricCard 
                  title="Avg Deal Size" 
                  value={revenueAnalytics?.averageDealSize || 0}
                  icon={Target}
                  color="text-purple-600"
                  prefix="$"
                />
                <MetricCard 
                  title="Forecast Accuracy" 
                  value={revenueAnalytics?.forecastAccuracy || 0}
                  icon={Activity}
                  color="text-amber-600"
                  suffix="%"
                />
              </div>

              <Card className="bg-slate-50 border-slate-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-slate-700">Revenue by Month</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end gap-2 h-48">
                    {revenueAnalytics?.revenueByMonth?.map((month, index) => {
                      const maxValue = Math.max(...(revenueAnalytics.revenueByMonth?.map(m => m.value) || [1]))
                      const height = (month.value / maxValue) * 100
                      return (
                        <div key={index} className="flex-1 flex flex-col items-center gap-1">
                          <div 
                            className="w-full bg-indigo-500 rounded-t-sm transition-all hover:bg-indigo-600"
                            style={{ height: `${Math.max(height, 2)}%` }}
                            title={`$${month.value.toLocaleString()}`}
                          />
                          <span className="text-xs text-slate-500">{month.label}</span>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-50 border-slate-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-slate-700">Revenue by Product</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {revenueAnalytics?.revenueByProduct?.map(product => (
                      <div key={product.product} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium text-slate-900">{product.product}</span>
                            <span className="text-sm text-slate-600">${product.revenue.toLocaleString()} ({product.count} deals)</span>
                          </div>
                          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${(product.revenue / (revenueAnalytics.totalRevenue || 1)) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold text-indigo-900">AI Performance Insights</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-white/80 rounded-xl">
                      <h4 className="text-xs font-bold text-indigo-600 uppercase mb-2">Recommendations</h4>
                      <ul className="space-y-2 text-sm text-slate-700">
                        {(metrics?.winRate || 0) < 30 && (
                          <li className="flex items-start gap-2">
                            <span className="text-amber-500">*</span>
                            Win rate below 30% - review sales process and qualification criteria
                          </li>
                        )}
                        {(metrics?.contactGrowthRate || 0) < 5 && (
                          <li className="flex items-start gap-2">
                            <span className="text-amber-500">*</span>
                            Low contact growth - consider expanding lead generation efforts
                          </li>
                        )}
                        {(metrics?.responseRate || 0) < 50 && (
                          <li className="flex items-start gap-2">
                            <span className="text-amber-500">*</span>
                            Improve response rate by implementing follow-up automation
                          </li>
                        )}
                        {(metrics?.engagementScore || 0) > 60 && (
                          <li className="flex items-start gap-2">
                            <span className="text-emerald-500">*</span>
                            Strong engagement metrics - maintain current outreach cadence
                          </li>
                        )}
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-50 to-cyan-50 border-emerald-200">
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold text-emerald-900">System Health</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Data Sync Status</span>
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">Active</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">AI Model Status</span>
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">Online</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Last Data Refresh</span>
                        <span className="text-sm text-slate-900">{new Date().toLocaleTimeString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Neural Network Version</span>
                        <span className="text-sm text-slate-900">v2.1.0</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
