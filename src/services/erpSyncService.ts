import { supabase } from '@/integrations/supabase/client';

export type ERPEventType = 
  | 'link_opened'
  | 'model_selected'
  | 'fuel_selected'
  | 'size_selected'
  | 'coating_selected'
  | 'color_render_generated'
  | 'architect_ai_used'
  | 'quote_saved'
  | 'contact_requested'
  | 'payment_initiated'
  | 'payment_completed'
  | 'feedback_not_interested';

interface SyncEventData {
  session_id: string;
  event_type: ERPEventType;
  event_data?: any;
}

/**
 * Syncs configurator events to ERP system
 * This function sends events to the sync-to-erp edge function which then forwards to the ERP webhook
 */
export const syncEventToERP = async (data: SyncEventData): Promise<void> => {
  try {
    console.log('[ERP-SYNC] Syncing event to ERP:', data.event_type);

    const { error } = await supabase.functions.invoke('sync-to-erp', {
      body: {
        session_id: data.session_id,
        event_type: data.event_type,
        event_data: data.event_data || {},
        timestamp: new Date().toISOString()
      }
    });

    if (error) {
      console.error('[ERP-SYNC] Error syncing to ERP:', error);
      // Don't throw - we don't want ERP sync failures to block the user flow
    } else {
      console.log('[ERP-SYNC] Successfully synced to ERP');
    }
  } catch (error) {
    console.error('[ERP-SYNC] Unexpected error:', error);
    // Silent fail - ERP sync is not critical for user experience
  }
};

/**
 * Helper to track configurator actions and sync to ERP
 */
export const trackAndSyncAction = async (
  sessionId: string,
  eventType: ERPEventType,
  eventData?: any
): Promise<void> => {
  // Sync to ERP asynchronously
  await syncEventToERP({
    session_id: sessionId,
    event_type: eventType,
    event_data: eventData
  });
};