import axios from 'axios';
import { TICKETMASTER_KEY } from './config.js';

export const ticketmasterHttp = axios.create({
  baseURL: 'https://app.ticketmaster.com/discovery/v2',
  params: { apikey: TICKETMASTER_KEY },
  timeout: 15000,
});

ticketmasterHttp.interceptors.request.use((cfg) => {
  const { url, params } = cfg;
  console.log('[TM] GET', url, {
    geoPoint: params?.geoPoint,
    radius: params?.radius,
    unit: params?.unit,
    segmentName: params?.segmentName,
    classificationName: params?.classificationName,
    size: params?.size,
    page: params?.page,
  });
  return cfg;
});
