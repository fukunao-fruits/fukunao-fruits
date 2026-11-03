import {proxy} from '../_lib/meguri-proxy.js';
export const onRequest=({request})=>proxy(request);
