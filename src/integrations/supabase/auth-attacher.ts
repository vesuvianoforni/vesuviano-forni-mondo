import { createMiddleware } from '@tanstack/react-start';

export const attachSupabaseAuth = createMiddleware({ type: 'function' }).client(async ({ next }) => {
  const { supabase } = await import('./client');
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return next({ headers: token ? { Authorization: `Bearer ${token}` } : {} });
});