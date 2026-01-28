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
  thorneNeuralNetwork,
  getDashboardMetrics,
  getContactAnalytics,
  getRevenueAnalytics,
  getConversationAnalytics,
  structureDataForAI,
  generateReport,
  aggregatePerformanceData,
  type AnalyticsTimeframe,
  type MetricDataPoint,
  type DashboardMetrics,
  type ContactAnalytics,
  type RevenueAnalytics,
  type ConversationAnalytics,
  type AIReadyData,
} from './neural-network'

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
  type DataEvent,
  type DataIngestionResult,
} from './data-collector'
