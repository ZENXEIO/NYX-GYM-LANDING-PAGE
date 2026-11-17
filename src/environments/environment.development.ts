import { config } from './config';

/** `ng serve` and development builds (swapped in by angular.json). Edit values in config.ts. */
export const environment = { production: false, ...config, siteUrl: 'http://localhost:4200' };
