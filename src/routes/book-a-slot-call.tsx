import { createFileRoute } from "@tanstack/react-router";
import BookAppointment from "@/pages/BookAppointment";
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { loadBookingContact } from '@/lib/booking.functions';

const bookingQuery = (offer?: string) => queryOptions({
  queryKey: ['booking-contact', offer ?? ''],
  queryFn: () => loadBookingContact({ data: { offer } }), staleTime: 0, gcTime: 0,
});

export const Route = createFileRoute("/book-a-slot-call")({
  validateSearch: (search: Record<string, unknown>) => ({ offer: typeof search['offer'] === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(search['offer']) ? search['offer'] : undefined, lang: typeof search['lang'] === 'string' ? search['lang'] : undefined }),
  loaderDeps: ({ search }) => ({ offer: search.offer }),
  loader: ({ context, deps }) => context.queryClient.ensureQueryData(bookingQuery(deps.offer)),
  head: () => ({ meta: [
    { title: 'Prenota una chiamata | Vesuviano Forni' },
    { name: 'description', content: 'Scegli data e ora per una consulenza con Vesuviano Forni.' },
    { property: 'og:title', content: 'Prenota una chiamata | Vesuviano Forni' },
    { property: 'og:description', content: 'Scegli data e ora per una consulenza con Vesuviano Forni.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' },
    { name: 'robots', content: 'noindex,nofollow' }, { name: 'referrer', content: 'no-referrer' },
  ] }),
  component: BookingRoute,
});

function BookingRoute() {
  const { offer } = Route.useSearch();
  const { data } = useSuspenseQuery(bookingQuery(offer));
  return <BookAppointment key={offer ?? 'manual'} contact={data} />;
}
