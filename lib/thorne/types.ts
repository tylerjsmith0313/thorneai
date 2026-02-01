/**
 * THORNE NEURAL NETWORK TYPES
 * 
 * Type definitions for the Thorne Neural Network data intelligence layer.
 */

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

// Data Collector Types
export interface DataEvent {
  eventType: string
  entityType: 'contact' | 'opportunity' | 'conversation' | 'activity' | 'user'
  entityId: string
  action: string
  metadata?: Record<string, unknown>
  timestamp?: string
}

export interface DataIngestionResult {
  success: boolean
  recordsProcessed: number
  errors?: string[]
}
