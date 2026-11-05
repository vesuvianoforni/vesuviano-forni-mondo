export const WRITE_TOOLS = ['update_lead','create_lead','send_message','create_offer','send_offer','send_attachment','update_qualification','create_order','update_order','propose_call','approve_call'];
export function actionOutcome(name: string, result: any): string {
  if (result?.error) return 'failed';
  if (name === 'approve_call') return result?.status === 'dialing' ? 'running' : result?.status === 'completed' ? 'completed' : 'unknown';
  const message = result?.message;
  if (message) return ['sent','delivered','read','logged'].includes(message.status) ? 'completed' : message.status === 'failed' ? 'failed' : 'running';
  if (['send_message','send_attachment','send_offer'].includes(name) || (name === 'create_offer' && result?.sent_via)) {
    return ['sent','delivered','read','accepted','logged'].includes(result?.result) ? 'completed' : result?.result === 'failed' ? 'failed' : ['queued','sending','pending'].includes(result?.result) ? 'running' : 'unknown';
  }
  return result?.created || result?.updated || result?.proposal ? 'completed' : 'unknown';
}