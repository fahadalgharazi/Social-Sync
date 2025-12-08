import axios from 'axios';
import { TICKETMASTER_KEY } from './config.js';

export const ticketmasterHttp = axios.create({
  baseURL: 'https://app.ticketmaster.com/discovery/v2',
  params: { apikey: TICKETMASTER_KEY },
  timeout: 15000,
});
