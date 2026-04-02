'use client'

import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'
import * as dataAccess from '@/lib/data-access'
import type {
  ContactStatus,
  DealStatus,
  ConversationStatus,
  ContactInsert,
  ContactUpdate,
  DealInsert,
  DealUpdate,
  ProductInsert,
  ProductUpdate,
  KnowledgeSourceInsert,
  KnowledgeSourceUpdate,
  MessageInsert,
  ActivityInsert,
  UserUpdate,
  UserSettingsUpdate
} from '@/lib/database.types'

// ============================================================================
// CONTACTS HOOKS
// ============================================================================

export function useContacts(filters?: {
  status?: ContactStatus
  search?: string
  limit?: number
  offset?: number
}) {
  const key = ['contacts', filters]
  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => dataAccess.getContacts(filters),
    { revalidateOnFocus: false }
  )
  
  return {
    contacts: data ?? [],
    isLoading,
    error,
    mutate
  }
}

export function useContact(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? ['contact', id] : null,
    () => dataAccess.getContactById(id!),
    { revalidateOnFocus: false }
  )
  
  return {
    contact: data,
    isLoading,
    error,
    mutate
  }
}

export function useContactStats() {
  const { data, error, isLoading, mutate } = useSWR(
    'contactStats',
    () => dataAccess.getContactStats(),
    { revalidateOnFocus: false }
  )
  
  return {
    stats: data,
    isLoading,
    error,
    mutate
  }
}

export function useCreateContact() {
  return useSWRMutation(
    'contacts',
    async (_, { arg }: { arg: ContactInsert }) => {
      return dataAccess.createContact(arg)
    }
  )
}

export function useUpdateContact() {
  return useSWRMutation(
    'contacts',
    async (_, { arg }: { arg: { id: string; updates: ContactUpdate } }) => {
      return dataAccess.updateContact(arg.id, arg.updates)
    }
  )
}

export function useDeleteContact() {
  return useSWRMutation(
    'contacts',
    async (_, { arg }: { arg: string }) => {
      return dataAccess.deleteContact(arg)
    }
  )
}

// ============================================================================
// DEALS HOOKS
// ============================================================================

export function useDeals(filters?: {
  status?: DealStatus
  limit?: number
  offset?: number
}) {
  const key = ['deals', filters]
  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => dataAccess.getDeals(filters),
    { revalidateOnFocus: false }
  )
  
  return {
    deals: data ?? [],
    isLoading,
    error,
    mutate
  }
}

export function useDeal(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? ['deal', id] : null,
    () => dataAccess.getDealById(id!),
    { revalidateOnFocus: false }
  )
  
  return {
    deal: data,
    isLoading,
    error,
    mutate
  }
}

export function useDealStats() {
  const { data, error, isLoading, mutate } = useSWR(
    'dealStats',
    () => dataAccess.getDealStats(),
    { revalidateOnFocus: false }
  )
  
  return {
    stats: data,
    isLoading,
    error,
    mutate
  }
}

export function useCreateDeal() {
  return useSWRMutation(
    'deals',
    async (_, { arg }: { arg: DealInsert }) => {
      return dataAccess.createDeal(arg)
    }
  )
}

export function useUpdateDeal() {
  return useSWRMutation(
    'deals',
    async (_, { arg }: { arg: { id: string; updates: DealUpdate } }) => {
      return dataAccess.updateDeal(arg.id, arg.updates)
    }
  )
}

export function useDeleteDeal() {
  return useSWRMutation(
    'deals',
    async (_, { arg }: { arg: string }) => {
      return dataAccess.deleteDeal(arg)
    }
  )
}

// ============================================================================
// CONVERSATIONS HOOKS
// ============================================================================

export function useConversations(filters?: {
  status?: ConversationStatus
  limit?: number
}) {
  const key = ['conversations', filters]
  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => dataAccess.getConversations(filters),
    { revalidateOnFocus: false }
  )
  
  return {
    conversations: data ?? [],
    isLoading,
    error,
    mutate
  }
}

export function useConversation(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? ['conversation', id] : null,
    () => dataAccess.getConversationById(id!),
    { revalidateOnFocus: false }
  )
  
  return {
    conversation: data,
    isLoading,
    error,
    mutate
  }
}

export function useConversationStats() {
  const { data, error, isLoading, mutate } = useSWR(
    'conversationStats',
    () => dataAccess.getConversationStats(),
    { revalidateOnFocus: false }
  )
  
  return {
    stats: data,
    isLoading,
    error,
    mutate
  }
}

// ============================================================================
// MESSAGES HOOKS
// ============================================================================

export function useMessages(conversationId: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    conversationId ? ['messages', conversationId] : null,
    () => dataAccess.getMessages(conversationId!),
    { revalidateOnFocus: false }
  )
  
  return {
    messages: data ?? [],
    isLoading,
    error,
    mutate
  }
}

export function useCreateMessage() {
  return useSWRMutation(
    'messages',
    async (_, { arg }: { arg: MessageInsert }) => {
      return dataAccess.createMessage(arg)
    }
  )
}

// ============================================================================
// PRODUCTS HOOKS
// ============================================================================

export function useProducts() {
  const { data, error, isLoading, mutate } = useSWR(
    'products',
    () => dataAccess.getProducts(),
    { revalidateOnFocus: false }
  )
  
  return {
    products: data ?? [],
    isLoading,
    error,
    mutate
  }
}

export function useProduct(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? ['product', id] : null,
    () => dataAccess.getProductById(id!),
    { revalidateOnFocus: false }
  )
  
  return {
    product: data,
    isLoading,
    error,
    mutate
  }
}

export function useCreateProduct() {
  return useSWRMutation(
    'products',
    async (_, { arg }: { arg: ProductInsert }) => {
      return dataAccess.createProduct(arg)
    }
  )
}

export function useUpdateProduct() {
  return useSWRMutation(
    'products',
    async (_, { arg }: { arg: { id: string; updates: ProductUpdate } }) => {
      return dataAccess.updateProduct(arg.id, arg.updates)
    }
  )
}

export function useDeleteProduct() {
  return useSWRMutation(
    'products',
    async (_, { arg }: { arg: string }) => {
      return dataAccess.deleteProduct(arg)
    }
  )
}

// ============================================================================
// KNOWLEDGE SOURCES HOOKS
// ============================================================================

export function useKnowledgeSources() {
  const { data, error, isLoading, mutate } = useSWR(
    'knowledgeSources',
    () => dataAccess.getKnowledgeSources(),
    { revalidateOnFocus: false }
  )
  
  return {
    sources: data ?? [],
    isLoading,
    error,
    mutate
  }
}

export function useCreateKnowledgeSource() {
  return useSWRMutation(
    'knowledgeSources',
    async (_, { arg }: { arg: KnowledgeSourceInsert }) => {
      return dataAccess.createKnowledgeSource(arg)
    }
  )
}

export function useUpdateKnowledgeSource() {
  return useSWRMutation(
    'knowledgeSources',
    async (_, { arg }: { arg: { id: string; updates: KnowledgeSourceUpdate } }) => {
      return dataAccess.updateKnowledgeSource(arg.id, arg.updates)
    }
  )
}

export function useDeleteKnowledgeSource() {
  return useSWRMutation(
    'knowledgeSources',
    async (_, { arg }: { arg: string }) => {
      return dataAccess.deleteKnowledgeSource(arg)
    }
  )
}

// ============================================================================
// ACTIVITIES HOOKS
// ============================================================================

export function useActivities(filters?: {
  contactId?: string
  dealId?: string
  limit?: number
}) {
  const key = ['activities', filters]
  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => dataAccess.getActivities(filters),
    { revalidateOnFocus: false }
  )
  
  return {
    activities: data ?? [],
    isLoading,
    error,
    mutate
  }
}

export function useCreateActivity() {
  return useSWRMutation(
    'activities',
    async (_, { arg }: { arg: ActivityInsert }) => {
      return dataAccess.createActivity(arg)
    }
  )
}

// ============================================================================
// USER HOOKS
// ============================================================================

export function useCurrentUser() {
  const { data, error, isLoading, mutate } = useSWR(
    'currentUser',
    () => dataAccess.getCurrentUser(),
    { revalidateOnFocus: false }
  )
  
  return {
    user: data,
    isLoading,
    error,
    mutate
  }
}

export function useUpdateUser() {
  return useSWRMutation(
    'currentUser',
    async (_, { arg }: { arg: UserUpdate }) => {
      return dataAccess.updateUser(arg)
    }
  )
}

export function useUserSettings() {
  const { data, error, isLoading, mutate } = useSWR(
    'userSettings',
    () => dataAccess.getUserSettings(),
    { revalidateOnFocus: false }
  )
  
  return {
    settings: data,
    isLoading,
    error,
    mutate
  }
}

export function useUpdateUserSettings() {
  return useSWRMutation(
    'userSettings',
    async (_, { arg }: { arg: UserSettingsUpdate }) => {
      return dataAccess.updateUserSettings(arg)
    }
  )
}

// ============================================================================
// DASHBOARD HOOKS
// ============================================================================

export function useDashboardData() {
  const { data, error, isLoading, mutate } = useSWR(
    'dashboard',
    () => dataAccess.getDashboardData(),
    { revalidateOnFocus: false }
  )
  
  return {
    data,
    isLoading,
    error,
    mutate
  }
}
