import { createApi } from '@reduxjs/toolkit/query/react';
import baseQuery from './baseQuery';
import { LaravelModelType } from '@clarion-app/types';

export interface Episode extends LaravelModelType {
  series_id: string;
  episode: string;
  completed: boolean;
  hash_string: string | null;
}

export interface Series extends LaravelModelType {
  name: string;
  title: string;
  feed_url: string;
  subscribed: boolean;
  formatted_name: string;
  episodes?: Episode[];
}

export interface SeriesResponse {
  data: Series[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface SeriesFilters {
  subscribed?: boolean;
  feed_url?: string;
  search?: string;
  page?: number;
}

export const rssTorrentsApi = createApi({
  reducerPath: 'clarion-app-rss-torrents-api',
  baseQuery: baseQuery(),
  tagTypes: ['Feeds', 'Torrents', 'Series'],
  endpoints: (builder) => ({
    getFeedUrls: builder.query<string[], void>({
      query: () => '/feeds/urls',
      providesTags: ['Feeds'],
    }),
    getTorrents: builder.query<any, string>({
      query: (url) => `/feeds/torrents?url=${encodeURIComponent(url)}`,
      providesTags: ['Torrents'],
    }),
    getSeries: builder.query<SeriesResponse, SeriesFilters>({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            searchParams.append(key, value.toString());
          }
        });
        return `/series?${searchParams.toString()}`;
      },
      providesTags: ['Series'],
    }),
    getSeriesById: builder.query<Series, string>({
      query: (id) => `/series/${id}`,
      providesTags: (result, error, id) => [{ type: 'Series', id }],
    }),
    getSubscribedSeries: builder.query<Series[], void>({
      query: () => '/series-subscribed',
      providesTags: ['Series'],
    }),
    createSeries: builder.mutation<Series, Partial<Series>>({
      query: (series) => ({
        url: '/series',
        method: 'POST',
        body: series,
      }),
      invalidatesTags: ['Series'],
    }),
    updateSeries: builder.mutation<Series, { id: string; data: Partial<Series> }>({
      query: ({ id, data }) => ({
        url: `/series/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Series', id }, 'Series'],
    }),
    deleteSeries: builder.mutation<void, string>({
      query: (id) => ({
        url: `/series/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Series'],
    }),
    toggleSeriesSubscription: builder.mutation<{ message: string; series: Series }, string>({
      query: (id) => ({
        url: `/series/${id}/toggle-subscription`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Series', id }, 'Series'],
    }),
    bulkUpdateSubscription: builder.mutation<
      { message: string; updated_count: number },
      { series_ids: string[]; subscribed: boolean }
    >({
      query: (data) => ({
        url: '/series/bulk-subscription',
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Series'],
    }),
  }),
});

// Extract hooks
export const {
  useGetFeedUrlsQuery,
  useGetTorrentsQuery,
  useGetSeriesQuery,
  useGetSeriesByIdQuery,
  useGetSubscribedSeriesQuery,
  useCreateSeriesMutation,
  useUpdateSeriesMutation,
  useDeleteSeriesMutation,
  useToggleSeriesSubscriptionMutation,
  useBulkUpdateSubscriptionMutation,
} = rssTorrentsApi;
