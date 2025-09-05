import * as TM from './ticketmaster.client.js';
// If/when you want to persist to Supabase, import a repo here:
// import * as EventsRepo from './repositories/events.repository.js';

export async function search({ personalityType, zip, limit }) {
  // In the future: try cache/DB first, then TM; upsert results.
  const events = await TM.search({ personalityType, zip, limit });
  return events;
}
