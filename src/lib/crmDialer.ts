export const CRM_CALLER_NUMBER = '+447457416033';
export const CRM_DIALER_CONNECTION = '3089447004791637361';
export type CallMode = 'ai' | 'direct' | null;
export function canStartCRMCall(mode: CallMode, confirmed: boolean, busy: boolean) {
  return mode !== null && confirmed && !busy;
}
export function dialerStaff(roles: readonly string[]) {
  return roles.some(role => role === 'admin' || role === 'commerciale');
}
export function dialerPhone(phone: string) {
  const value = phone.replace(/[\s().-]/g, '').replace(/^00/, '+');
  if (!/^\+[1-9]\d{7,14}$/.test(value)) throw new Error('Salva il numero del cliente con prefisso internazionale.');
  return value;
}
export function directStatus(current: string, event: string) {
  if (['ended', 'failed', 'unknown'].includes(current)) return current;
  if (event === 'active') return 'active';
  if (event === 'ended' || event === 'failed' || event === 'unknown') return event;
  return current === 'active' ? current : 'dialing';
}
export const directStatusLabels: Record<string, string> = {
  preparing: 'Preparazione', dialing: 'Sta chiamando', active: 'In conversazione',
  ended: 'Chiamata terminata', failed: 'Chiamata non riuscita', unknown: 'Esito da verificare',
};