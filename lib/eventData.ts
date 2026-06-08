export const eventSlug = 'naija-to-prague-2026';

export const eventDetails = {
  slug: eventSlug,
  title: 'Owanbe in Europe: Naija to Prague',
  shortTitle: 'Naija to Prague',
  dateLabel: 'Saturday, August 15, 2026',
  redCarpetLabel: '2:00 PM Red Carpet & Photography',
  mainTimeLabel: '3:00 PM - 8:00 PM CEST',
  venueName: 'Highlight Event Centre Hlubocepy',
  venueAddress: 'Hlubocepska 1287/2a, Prague',
  city: 'Prague',
  country: 'Czech Republic',
  dressCode: 'African Royalty',
  instagramUrl: 'https://www.instagram.com/owanbeineurope',
  email: 'info@owanbeineurope.cz'
};

export const ticketOptions = [
  {
    id: 'early-bird',
    name: 'Early Bird',
    price: 1000,
    description: 'First wave community access for early supporters.'
  },
  {
    id: 'regular',
    name: 'Regular',
    price: 1200,
    description: 'Standard access to the full Naija to Prague celebration.'
  },
  {
    id: 'late-registration',
    name: 'Late Registration',
    price: 1500,
    description: 'Final access tier when early spots are gone.'
  },
  {
    id: 'vip',
    name: 'VIP',
    price: 2500,
    description: 'Premium access for guests who want the top-tier Owanbe feel.'
  }
];

export function getTicketOption(ticketType: string) {
  return ticketOptions.find((ticket) => ticket.id === ticketType);
}
