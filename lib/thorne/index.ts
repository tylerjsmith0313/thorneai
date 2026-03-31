/**
 * THORNE NEURAL NETWORK
 * 
 * The backend data intelligence layer that powers AgyntOS and AgyntSynq.
 * 
 * Tech Stack Architecture:
 * 
 * 1. THORNE NEURAL NETWORK (This Layer)
 *    - Data storage and management
 *    - Data collection and aggregation
 *    - Data analysis and reporting
 *    - Data structuring for AI consumption
 *    - Real-time metrics and analytics
 * 
 * 2. AgyntOS (Operating System Layer)
 *    - User interface and interactions
 *    - Dashboard and visualizations
 *    - Contact management
 *    - Conversation handling
 *    - Workflow automation
 * 
 * 3. AgyntSynq (AI Agent Layer)
 *    - Natural language processing
 *    - Sales intelligence
 *    - Lead scoring and recommendations
 *    - Automated responses
 *    - Personalized outreach
 */

// Core Neural Network
export {
  getDashboardMetrics,
  getContactAnalytics,
  getRevenueAnalytics,
  getConversationAnalytics,
  structureDataForAI,
  generateReport,
  aggregatePerformanceData,
} from './neural-network'

// Types (exported from separate file to avoid "use server" conflicts)
export type {
  AnalyticsTimeframe,
  MetricDataPoint,
  DashboardMetrics,
  ContactAnalytics,
  RevenueAnalytics,
  ConversationAnalytics,
  AIReadyData,
} from './types'

// Data Collection
export {
  trackEvent,
  trackContactInteraction,
  trackOpportunityChange,
  ingestContacts,
  ingestOpportunities,
  enrichContactData,
  syncEngagementScores,
  calculateHeatScores,
  exportContactsCSV,
  exportReportData,
} from './data-collector'

// Re-export data collector types from types file
export type { DataEvent, DataIngestionResult } from './types'
