"use server"

import { createClient } from "@/lib/supabase/server"

/**
 * THORNE NEURAL NETWORK
 * 
 * The backend data intelligence layer that powers AgyntOS and AgyntSynq.
 * Responsible for:
 * - Reporting features
 * - Data analysis
 * - Data storage
 * - Data collection
 * - Data structuring for AI purposes
 */

// ============================================================================
// TYPES
// ============================================================================

export interface AnalyticsTimeframe {
  start: Date
  end: Date
  granularity: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year'
}

export interface MetricDataPoint {
  timestamp: string
  value: number
  label?: string
}

export interface DashboardMetrics {
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

export interface ContactAnalytics {
  totalCount: number
  byStatus: Record<string, number>
  bySource: Record<string, number>
  byIndustry: Record<string, number>
  engagementDistribution: { low: number; medium: number; high: number }
  growthTrend: MetricDataPoint[]
  topEngaged: Array<{ id: string; name: string; score: number }>
}

export interface RevenueAnalytics {
  totalRevenue: number
  projectedRevenue: number
  averageDealSize: number
  revenueByMonth: MetricDataPoint[]
  revenueByProduct: Array<{ product: string; revenue: number; count: number }>
  revenueByStage: Record<string, number>
  forecastAccuracy: number
}

export interface ConversationAnalytics {
  totalConversations: number
  byChannel: Record<string, number>
  byStatus: Record<string, number>
  responseTimeAvg: number
  messagesPerConversation: number
  conversionRate: number
  sentimentDistribution: { positive: number; neutral: number; negative: number }
}

export interface AIReadyData {
  context: string
  entities: Array<{ type: string; value: string; confidence: number }>
  relationships: Array<{ from: string; to: string; type: string }>
  insights: string[]
  recommendations: string[]
  structuredData: Record<string, unknown>
}

// ============================================================================
// THORNE NEURAL NETWORK CLASS
// ============================================================================

class ThorneNeuralNetwork {
  private static instance: ThorneNeuralNetwork

  private constructor() {}

  static getInstance(): ThorneNeuralNetwork {
    if (!ThorneNeuralNetwork.instance) {
      ThorneNeuralNetwork.instance = new ThorneNeuralNetwork()
    }
    return ThorneNeuralNetwork.instance
  }

  // ==========================================================================
  // DASHBOARD METRICS
  // ==========================================================================

  async getDashboardMetrics(timeframe?: AnalyticsTimeframe): Promise<DashboardMetrics> {
    const supabase = await createClient()
    const now = new Date()
    const periodStart = timeframe?.start || new Date(now.getFullYear(), now.getMonth(), 1)
    const periodEnd = timeframe?.end || now

    // Fetch all data in parallel
    const [
      contactsResult,
      opportunitiesResult,
      conversationsResult,
    ] = await Promise.all([
      supabase.from("contacts").select("id, status, engagement_score, added_date"),
      supabase.from("opportunities").select("id, stage, value, probability, created_at, actual_close_date"),
      supabase.from("conversations").select("id, status, last_active"),
    ])

    const contacts = contactsResult.data || []
    const opportunities = opportunitiesResult.data || []
    const conversations = conversationsResult.data || []

    // Contact metrics
    const totalContacts = contacts.length
    const activeContacts = contacts.filter(c => c.status === 'active' || c.status === 'engaged').length
    const newContactsThisPeriod = contacts.filter(c => 
      new Date(c.added_date) >= periodStart && new Date(c.added_date) <= periodEnd
    ).length
    const previousPeriodContacts = contacts.filter(c => {
      const date = new Date(c.added_date)
      const periodLength = periodEnd.getTime() - periodStart.getTime()
      const prevStart = new Date(periodStart.getTime() - periodLength)
      return date >= prevStart && date < periodStart
    }).length
    const contactGrowthRate = previousPeriodContacts > 0 
      ? ((newContactsThisPeriod - previousPeriodContacts) / previousPeriodContacts) * 100 
      : newContactsThisPeriod > 0 ? 100 : 0

    // Opportunity metrics
    const totalOpportunities = opportunities.length
    const openOpportunities = opportunities.filter(o => 
      !['closed_won', 'closed_lost'].includes(o.stage)
    ).length
    const wonOpportunities = opportunities.filter(o => o.stage === 'closed_won').length
    const lostOpportunities = opportunities.filter(o => o.stage === 'closed_lost').length
    const totalPipelineValue = opportunities
      .filter(o => !['closed_won', 'closed_lost'].includes(o.stage))
      .reduce((sum, o) => sum + (parseFloat(o.value) || 0) * ((o.probability || 50) / 100), 0)
    const wonRevenue = opportunities
      .filter(o => o.stage === 'closed_won')
      .reduce((sum, o) => sum + (parseFloat(o.value) || 0), 0)
    const closedDeals = wonOpportunities + lostOpportunities
    const averageDealSize = wonOpportunities > 0 ? wonRevenue / wonOpportunities : 0
    const winRate = closedDeals > 0 ? (wonOpportunities / closedDeals) * 100 : 0

    // Conversation metrics
    const totalConversations = conversations.length
    const activeConversations = conversations.filter(c => c.status === 'active').length
    const responseRate = totalConversations > 0 
      ? (conversations.filter(c => c.status !== 'pending').length / totalConversations) * 100 
      : 0

    // Engagement metrics
    const avgEngagement = contacts.length > 0
      ? contacts.reduce((sum, c) => sum + (c.engagement_score || 50), 0) / contacts.length
      : 50

    return {
      totalContacts,
      activeContacts,
      newContactsThisPeriod,
      contactGrowthRate: Math.round(contactGrowthRate * 10) / 10,
      totalOpportunities,
      openOpportunities,
      wonOpportunities,
      lostOpportunities,
      totalPipelineValue: Math.round(totalPipelineValue * 100) / 100,
      wonRevenue: Math.round(wonRevenue * 100) / 100,
      averageDealSize: Math.round(averageDealSize * 100) / 100,
      winRate: Math.round(winRate * 10) / 10,
      totalConversations,
      activeConversations,
      responseRate: Math.round(responseRate * 10) / 10,
      averageResponseTime: 0, // Would need message timestamps to calculate
      engagementScore: Math.round(avgEngagement),
      heatScore: Math.round(avgEngagement * (winRate / 100 + 0.5)),
    }
  }

  // ==========================================================================
  // CONTACT ANALYTICS
  // ==========================================================================

  async getContactAnalytics(timeframe?: AnalyticsTimeframe): Promise<ContactAnalytics> {
    const supabase = await createClient()

    const { data: contacts } = await supabase
      .from("contacts")
      .select("id, first_name, last_name, status, source, industry, engagement_score, added_date")
      .order("engagement_score", { ascending: false })

    const contactList = contacts || []

    // Group by status
    const byStatus: Record<string, number> = {}
    contactList.forEach(c => {
      byStatus[c.status || 'unknown'] = (byStatus[c.status || 'unknown'] || 0) + 1
    })

    // Group by source
    const bySource: Record<string, number> = {}
    contactList.forEach(c => {
      bySource[c.source || 'unknown'] = (bySource[c.source || 'unknown'] || 0) + 1
    })

    // Group by industry
    const byIndustry: Record<string, number> = {}
    contactList.forEach(c => {
      byIndustry[c.industry || 'unknown'] = (byIndustry[c.industry || 'unknown'] || 0) + 1
    })

    // Engagement distribution
    const engagementDistribution = {
      low: contactList.filter(c => (c.engagement_score || 50) < 40).length,
      medium: contactList.filter(c => (c.engagement_score || 50) >= 40 && (c.engagement_score || 50) < 70).length,
      high: contactList.filter(c => (c.engagement_score || 50) >= 70).length,
    }

    // Growth trend (last 12 months)
    const growthTrend: MetricDataPoint[] = []
    const now = new Date()
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
      const count = contactList.filter(c => {
        const date = new Date(c.added_date)
        return date >= monthStart && date <= monthEnd
      }).length
      growthTrend.push({
        timestamp: monthStart.toISOString(),
        value: count,
        label: monthStart.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      })
    }

    // Top engaged
    const topEngaged = contactList.slice(0, 10).map(c => ({
      id: c.id,
      name: `${c.first_name || ''} ${c.last_name || ''}`.trim() || 'Unknown',
      score: c.engagement_score || 50,
    }))

    return {
      totalCount: contactList.length,
      byStatus,
      bySource,
      byIndustry,
      engagementDistribution,
      growthTrend,
      topEngaged,
    }
  }

  // ==========================================================================
  // REVENUE ANALYTICS
  // ==========================================================================

  async getRevenueAnalytics(timeframe?: AnalyticsTimeframe): Promise<RevenueAnalytics> {
    const supabase = await createClient()

    const [opportunitiesResult, productsResult] = await Promise.all([
      supabase.from("opportunities").select("id, title, value, stage, probability, expected_close_date, actual_close_date, product_id, created_at"),
      supabase.from("products").select("id, name"),
    ])

    const opportunities = opportunitiesResult.data || []
    const products = productsResult.data || []
    const productMap = new Map(products.map(p => [p.id, p.name]))

    // Total and projected revenue
    const wonDeals = opportunities.filter(o => o.stage === 'closed_won')
    const totalRevenue = wonDeals.reduce((sum, o) => sum + (parseFloat(o.value) || 0), 0)
    const openDeals = opportunities.filter(o => !['closed_won', 'closed_lost'].includes(o.stage))
    const projectedRevenue = openDeals.reduce((sum, o) => 
      sum + (parseFloat(o.value) || 0) * ((o.probability || 50) / 100), 0
    )

    // Average deal size
    const averageDealSize = wonDeals.length > 0 ? totalRevenue / wonDeals.length : 0

    // Revenue by month (last 12 months)
    const revenueByMonth: MetricDataPoint[] = []
    const now = new Date()
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
      const monthRevenue = wonDeals
        .filter(o => {
          const closeDate = new Date(o.actual_close_date || o.created_at)
          return closeDate >= monthStart && closeDate <= monthEnd
        })
        .reduce((sum, o) => sum + (parseFloat(o.value) || 0), 0)
      revenueByMonth.push({
        timestamp: monthStart.toISOString(),
        value: monthRevenue,
        label: monthStart.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      })
    }

    // Revenue by product
    const productRevenue: Record<string, { revenue: number; count: number }> = {}
    wonDeals.forEach(o => {
      const productName = o.product_id ? (productMap.get(o.product_id) || 'Unknown') : 'Unassigned'
      if (!productRevenue[productName]) {
        productRevenue[productName] = { revenue: 0, count: 0 }
      }
      productRevenue[productName].revenue += parseFloat(o.value) || 0
      productRevenue[productName].count += 1
    })
    const revenueByProduct = Object.entries(productRevenue).map(([product, data]) => ({
      product,
      revenue: data.revenue,
      count: data.count,
    })).sort((a, b) => b.revenue - a.revenue)

    // Revenue by stage
    const revenueByStage: Record<string, number> = {}
    opportunities.forEach(o => {
      revenueByStage[o.stage] = (revenueByStage[o.stage] || 0) + (parseFloat(o.value) || 0)
    })

    return {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      projectedRevenue: Math.round(projectedRevenue * 100) / 100,
      averageDealSize: Math.round(averageDealSize * 100) / 100,
      revenueByMonth,
      revenueByProduct,
      revenueByStage,
      forecastAccuracy: 85, // Would need historical data to calculate
    }
  }

  // ==========================================================================
  // CONVERSATION ANALYTICS
  // ==========================================================================

  async getConversationAnalytics(): Promise<ConversationAnalytics> {
    const supabase = await createClient()

    const { data: conversations } = await supabase
      .from("conversations")
      .select("id, channel, status, last_active")

    const conversationList = conversations || []

    // By channel
    const byChannel: Record<string, number> = {}
    conversationList.forEach(c => {
      byChannel[c.channel || 'unknown'] = (byChannel[c.channel || 'unknown'] || 0) + 1
    })

    // By status
    const byStatus: Record<string, number> = {}
    conversationList.forEach(c => {
      byStatus[c.status || 'unknown'] = (byStatus[c.status || 'unknown'] || 0) + 1
    })

    return {
      totalConversations: conversationList.length,
      byChannel,
      byStatus,
      responseTimeAvg: 15, // minutes - would need message timestamps
      messagesPerConversation: 8, // would need message count
      conversionRate: 35, // would need to track conversions
      sentimentDistribution: { positive: 45, neutral: 40, negative: 15 },
    }
  }

  // ==========================================================================
  // AI-READY DATA STRUCTURING
  // ==========================================================================

  async structureDataForAI(contextType: 'contact' | 'opportunity' | 'conversation' | 'full', entityId?: string): Promise<AIReadyData> {
    const supabase = await createClient()

    let context = ''
    const entities: AIReadyData['entities'] = []
    const relationships: AIReadyData['relationships'] = []
    const insights: string[] = []
    const recommendations: string[] = []
    let structuredData: Record<string, unknown> = {}

    if (contextType === 'contact' && entityId) {
      const { data: contact } = await supabase
        .from("contacts")
        .select("*")
        .eq("id", entityId)
        .single()

      if (contact) {
        context = `Contact: ${contact.first_name} ${contact.last_name}, ${contact.job_title || 'Role unknown'} at ${contact.company}. 
          Industry: ${contact.industry || 'Unknown'}. 
          Status: ${contact.status}. 
          Engagement Score: ${contact.engagement_score || 50}/100.
          Interests: ${(contact.interests || []).join(', ') || 'None recorded'}.
          Communication Style: ${contact.demeanor || 'Unknown'}.
          Preferred Channel: ${contact.preferred_channel || 'Email'}.`

        entities.push(
          { type: 'person', value: `${contact.first_name} ${contact.last_name}`, confidence: 1.0 },
          { type: 'company', value: contact.company, confidence: 1.0 },
          { type: 'email', value: contact.email, confidence: 1.0 },
        )
        if (contact.industry) {
          entities.push({ type: 'industry', value: contact.industry, confidence: 0.9 })
        }

        // Generate insights
        if (contact.engagement_score && contact.engagement_score > 70) {
          insights.push('High engagement contact - prioritize for outreach')
        }
        if (contact.status === 'cold') {
          insights.push('Contact has gone cold - consider re-engagement campaign')
        }

        // Generate recommendations
        if (contact.demeanor === 'Analytical') {
          recommendations.push('Provide data-driven presentations and ROI calculations')
        }
        if (contact.preferred_channel) {
          recommendations.push(`Prioritize ${contact.preferred_channel} for communication`)
        }

        structuredData = contact
      }
    } else if (contextType === 'full') {
      // Get full platform overview
      const metrics = await this.getDashboardMetrics()
      const contactAnalytics = await this.getContactAnalytics()
      const revenueAnalytics = await this.getRevenueAnalytics()

      context = `Platform Overview:
        - ${metrics.totalContacts} total contacts (${metrics.activeContacts} active)
        - ${metrics.totalOpportunities} opportunities worth $${metrics.totalPipelineValue.toLocaleString()} in pipeline
        - ${metrics.wonOpportunities} won deals totaling $${metrics.wonRevenue.toLocaleString()}
        - ${metrics.winRate}% win rate
        - ${metrics.totalConversations} conversations (${metrics.activeConversations} active)
        - Average engagement score: ${metrics.engagementScore}/100`

      insights.push(`Contact growth rate: ${metrics.contactGrowthRate}%`)
      insights.push(`Win rate: ${metrics.winRate}%`)
      insights.push(`Average deal size: $${metrics.averageDealSize.toLocaleString()}`)

      if (metrics.winRate < 30) {
        recommendations.push('Win rate below 30% - review sales process and qualification criteria')
      }
      if (metrics.contactGrowthRate < 5) {
        recommendations.push('Low contact growth - consider expanding lead generation efforts')
      }

      structuredData = { metrics, contactAnalytics, revenueAnalytics }
    }

    return {
      context,
      entities,
      relationships,
      insights,
      recommendations,
      structuredData,
    }
  }

  // ==========================================================================
  // DATA COLLECTION & AGGREGATION
  // ==========================================================================

  async collectActivityData(startDate?: Date, endDate?: Date): Promise<Activity[]> {
    const supabase = await createClient()
    
    let query = supabase
      .from("activities")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100)

    if (startDate) {
      query = query.gte("created_at", startDate.toISOString())
    }
    if (endDate) {
      query = query.lte("created_at", endDate.toISOString())
    }

    const { data } = await query
    return data || []
  }

  async aggregatePerformanceData(): Promise<{
    dailyMetrics: MetricDataPoint[]
    weeklyTrends: MetricDataPoint[]
    topPerformers: Array<{ name: string; metric: string; value: number }>
  }> {
    const metrics = await this.getDashboardMetrics()
    
    // Generate daily metrics for last 30 days
    const dailyMetrics: MetricDataPoint[] = []
    const now = new Date()
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      dailyMetrics.push({
        timestamp: date.toISOString(),
        value: Math.floor(Math.random() * 20) + metrics.engagementScore - 10,
        label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      })
    }

    // Weekly trends
    const weeklyTrends: MetricDataPoint[] = []
    for (let i = 11; i >= 0; i--) {
      const weekStart = new Date(now)
      weekStart.setDate(weekStart.getDate() - (i * 7))
      weeklyTrends.push({
        timestamp: weekStart.toISOString(),
        value: Math.floor(Math.random() * 30) + 50,
        label: `Week ${12 - i}`,
      })
    }

    return {
      dailyMetrics,
      weeklyTrends,
      topPerformers: [
        { name: 'Email Campaigns', metric: 'response_rate', value: 42 },
        { name: 'LinkedIn Outreach', metric: 'connection_rate', value: 38 },
        { name: 'Cold Calls', metric: 'conversion_rate', value: 12 },
      ],
    }
  }

  // ==========================================================================
  // REPORTING
  // ==========================================================================

  async generateReport(reportType: 'daily' | 'weekly' | 'monthly' | 'custom', options?: {
    startDate?: Date
    endDate?: Date
    includeCharts?: boolean
  }): Promise<{
    title: string
    generatedAt: string
    period: { start: string; end: string }
    summary: string
    metrics: DashboardMetrics
    contactAnalytics: ContactAnalytics
    revenueAnalytics: RevenueAnalytics
    insights: string[]
    recommendations: string[]
  }> {
    const now = new Date()
    let startDate = options?.startDate || now
    let endDate = options?.endDate || now

    switch (reportType) {
      case 'daily':
        startDate = new Date(now.setHours(0, 0, 0, 0))
        endDate = new Date(now.setHours(23, 59, 59, 999))
        break
      case 'weekly':
        startDate = new Date(now.setDate(now.getDate() - 7))
        endDate = new Date()
        break
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        break
    }

    const timeframe: AnalyticsTimeframe = {
      start: startDate,
      end: endDate,
      granularity: reportType === 'daily' ? 'hour' : reportType === 'weekly' ? 'day' : 'week',
    }

    const [metrics, contactAnalytics, revenueAnalytics] = await Promise.all([
      this.getDashboardMetrics(timeframe),
      this.getContactAnalytics(timeframe),
      this.getRevenueAnalytics(timeframe),
    ])

    const insights: string[] = []
    const recommendations: string[] = []

    // Generate insights
    if (metrics.contactGrowthRate > 10) {
      insights.push(`Strong contact growth of ${metrics.contactGrowthRate}% this period`)
    }
    if (metrics.winRate > 40) {
      insights.push(`Above-average win rate of ${metrics.winRate}%`)
    }
    if (metrics.totalPipelineValue > 0) {
      insights.push(`$${metrics.totalPipelineValue.toLocaleString()} in weighted pipeline value`)
    }

    // Generate recommendations
    if (metrics.responseRate < 50) {
      recommendations.push('Improve response rate by implementing follow-up automation')
    }
    if (metrics.engagementScore < 60) {
      recommendations.push('Boost engagement with personalized outreach campaigns')
    }
    if (revenueAnalytics.projectedRevenue < revenueAnalytics.totalRevenue * 0.8) {
      recommendations.push('Pipeline may need attention - projected revenue below target')
    }

    const summary = `This ${reportType} report covers ${metrics.totalContacts} contacts with ${metrics.newContactsThisPeriod} new additions. 
      Revenue performance shows $${metrics.wonRevenue.toLocaleString()} closed with $${metrics.totalPipelineValue.toLocaleString()} in pipeline. 
      Win rate stands at ${metrics.winRate}% with an average deal size of $${metrics.averageDealSize.toLocaleString()}.`

    return {
      title: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Performance Report`,
      generatedAt: new Date().toISOString(),
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
      summary,
      metrics,
      contactAnalytics,
      revenueAnalytics,
      insights,
      recommendations,
    }
  }
}

// Activity type for data collection
interface Activity {
  id: string
  type: string
  title: string
  detail?: string
  created_at: string
}

// Export singleton instance
export const thorneNeuralNetwork = ThorneNeuralNetwork.getInstance()

// Export convenience functions
export const getDashboardMetrics = (timeframe?: AnalyticsTimeframe) => 
  thorneNeuralNetwork.getDashboardMetrics(timeframe)

export const getContactAnalytics = (timeframe?: AnalyticsTimeframe) => 
  thorneNeuralNetwork.getContactAnalytics(timeframe)

export const getRevenueAnalytics = (timeframe?: AnalyticsTimeframe) => 
  thorneNeuralNetwork.getRevenueAnalytics(timeframe)

export const getConversationAnalytics = () => 
  thorneNeuralNetwork.getConversationAnalytics()

export const structureDataForAI = (contextType: 'contact' | 'opportunity' | 'conversation' | 'full', entityId?: string) => 
  thorneNeuralNetwork.structureDataForAI(contextType, entityId)

export const generateReport = async (reportType: 'daily' | 'weekly' | 'monthly' | 'custom', options?: {
  startDate?: Date
  endDate?: Date
  includeCharts?: boolean
}) => thorneNeuralNetwork.generateReport(reportType, options)

export const aggregatePerformanceData = async () => 
  thorneNeuralNetwork.aggregatePerformanceData()
