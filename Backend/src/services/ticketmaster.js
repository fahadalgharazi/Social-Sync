// // backend/services/ticketmaster.js
// import axios from "axios";
// import { TICKETMASTER_KEY } from "../config.js";

// const TM_API_KEY = TICKETMASTER_KEY;  // ✅ already loaded by config.js
// const TM_URL = "https://app.ticketmaster.com/discovery/v2/events.json";


// // Progressive search radii (miles)
// const RADII_MI = [15, 30, 60, 120, 250];

// // Map personality cluster → keyword pipe
// const keywordPipes = {
//   "Reactive Idealist": "Music",
//   "Balanced Realist": "Music",
//   "Sensitive Companion": "Music",
//   "Secure Optimist": "Music",
// };

// // Normalize Ticketmaster event object → small UI-friendly shape
// function normalizeTMEvent(evt) {
//   const img = evt.images?.find((i) => i.width >= 300) || evt.images?.[0];
//   return {
//     id: evt.id,
//     name: evt.name,
//     url: evt.url,
//     date: evt.dates?.start?.localDate || evt.dates?.start?.dateTime || "",
//     time: evt.dates?.start?.localTime || "",
//     venueName: evt._embedded?.venues?.[0]?.name || "",
//     venueCity: evt._embedded?.venues?.[0]?.city?.name || "",
//     venueState: evt._embedded?.venues?.[0]?.state?.stateCode || "",
//     imageUrl: img?.url || "",
//   };
// }

// /**
//  * Fetch events from Ticketmaster based on personality and ZIP.
//  * Expands radius until it finds events; falls back to virtual events.
//  *
//  * @param {string} personalityType
//  * @param {string} zip
//  * @param {number} limit
//  * @returns {Promise<Array>}
//  */
// export async function searchEvents(personalityType, zip, limit = 20) {
//   const keyword =
//     keywordPipes[personalityType] || keywordPipes["Balanced Realist"];

//   for (const radius of RADII_MI) {
//     try {
//       const { data } = await axios.get(TM_URL, {
//         params: {
//           apikey: TM_API_KEY,
//         //   postalCode: zip,
//         //works with city not zip
//           city: "New York City",
//           radius,
//           unit: "miles",
//           keyword,
//           size: limit,
//           sort: "date,asc",
//         },
//       });
//       const events = data?._embedded?.events || [];
//       if (events.length) {
//         return events.map(normalizeTMEvent);
//       }
//     } catch (err) {
//       console.error(`Ticketmaster radius ${radius} error:`, err.message);
//     }
//   }

//   // Fallback: virtual/online events
//   try {
//     const { data } = await axios.get(TM_URL, {
//       params: { apikey: TM_API_KEY, keyword: "virtual|online", size: limit },
//     });
//     const events = data?._embedded?.events || [];
//     return events.map(normalizeTMEvent);
//   } catch (err) {
//     console.error("Ticketmaster virtual fallback error:", err.message);
//     return [];
//   }
// }
