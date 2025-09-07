import * as TM from './ticketmaster.client.js';

export async function search({ personalityType, zip, limit }) {
  // In the future: try cache/DB first, then TM; upsert results.
  const events = await TM.search({ personalityType, zip, limit });
  return events;
}
