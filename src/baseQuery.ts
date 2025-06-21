import { BaseQueryFn, FetchArgs, fetchBaseQuery, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { backend } from '.';

const rawBaseQuery = (baseUrl: string) => fetchBaseQuery({ 
    baseUrl: baseUrl,
    prepareHeaders: (headers) => {
        headers.set('Content-Type', 'application/json');
        headers.set('Authorization', 'Bearer ' + backend.token);
        return headers;
    }
});

const routePrefix = '/api/clarion-app/rss-torrents';
  
export default function baseQuery(): BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> {
    return async (args, api, extraOptions) => {
        let result = await rawBaseQuery(backend.url + routePrefix)(args, api, extraOptions);
        return result;
    };
}
