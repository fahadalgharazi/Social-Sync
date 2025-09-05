import axios from 'axios';
import { TICKETMASTER_KEY } from './config.js';   // same folder, so just ./config.js

export const ticketmasterHttp = axios.create({
  baseURL: 'https://app.ticketmaster.com/discovery/v2',
  timeout: 10000,
  params: { apikey: TICKETMASTER_KEY },
});
