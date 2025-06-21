# RSS Torrents Frontend

A React-based frontend application for managing RSS torrent feeds and series subscriptions. This package provides a user-friendly interface for monitoring torrents, managing series subscriptions, and viewing feed contents within the Clarion App ecosystem.

## Features

- **Feed Management**: Browse and view torrents from RSS feeds (EZTV, Nyaa Subsplease)
- **Series Management**: Create, edit, delete, and manage TV series subscriptions
- **Real-time Updates**: Automatic refresh of series data every 10 minutes
- **Bulk Operations**: Bulk subscription management for multiple series
- **Responsive UI**: Modern, responsive interface using Bulma CSS framework

## Components

### Core Components

#### `<Feeds />`
Main feeds listing component that displays available RSS feed URLs and allows navigation to individual feed contents.

**Features:**
- Lists all available RSS feed URLs
- Navigation to individual feed torrent listings
- Loading and error states
- Back navigation support

#### `<Feed />`
Individual feed viewer component that displays torrents from a specific RSS feed.

**Props:**
- `url: string` - RSS feed URL to display
- `onBack: () => void` - Callback for back navigation

**Features:**
- Displays torrents organized by show and episode
- Shows torrent metadata (resolution, file size)
- Magnet link access for downloads
- File size formatting (B, KB, MB, GB)
- Responsive table layout

#### `<Series />`
Comprehensive series management component for CRUD operations and subscription management.

**Props:**
- `onBack?: () => void` - Optional back navigation callback

**Features:**
- Series listing with pagination
- Filter by subscription status, feed URL, and search terms
- Create new series with form validation
- Edit existing series in-place
- Delete series with confirmation
- Toggle individual subscriptions
- Bulk subscription updates
- Auto-refresh every 10 minutes

### API Integration

The `rssTorrentsApi` provides a complete RTK Query API with the following endpoints:

#### Feed Operations
- `useGetFeedUrlsQuery()` - Fetch available RSS feed URLs
- `useGetTorrentsQuery(url)` - Fetch torrents from specific feed

#### Series Operations
- `useGetSeriesQuery(filters)` - Fetch series with filtering and pagination
- `useGetSeriesByIdQuery(id)` - Fetch single series by ID
- `useGetSubscribedSeriesQuery()` - Fetch only subscribed series
- `useCreateSeriesMutation()` - Create new series
- `useUpdateSeriesMutation()` - Update existing series
- `useDeleteSeriesMutation()` - Delete series
- `useToggleSeriesSubscriptionMutation()` - Toggle subscription status
- `useBulkUpdateSubscriptionMutation()` - Bulk update subscriptions

## Types

### Core Interfaces

```typescript
interface Series extends LaravelModelType {
  name: string;
  title: string;
  feed_url: string;
  subscribed: boolean;
  formatted_name: string;
  episodes?: Episode[];
}

interface Episode extends LaravelModelType {
  series_id: string;
  episode: string;
  completed: boolean;
  hash_string: string | null;
}

interface SeriesFilters {
  subscribed?: boolean;
  feed_url?: string;
  search?: string;
  page?: number;
}
```

## Clarion App Integration

This frontend package integrates seamlessly with the Clarion App framework through:

### Menu Configuration
- **RSS Torrents** main menu item
- **Feeds** submenu for feed browsing
- **Series** submenu for series management
- Both entries are pinned for easy access

### Routing
- `/clarion-app/rss-torrents/feeds` - Feeds component
- `/clarion-app/rss-torrents/series` - Series component

### API Integration
- Automatic backend configuration via `updateFrontend()`
- Authentication token management
- Base URL configuration for API calls

## Development

### Project Structure

```
src/
├── baseQuery.ts              # RTK Query base configuration
├── Feed.tsx                  # Individual feed viewer component
├── Feeds.tsx                 # Feeds listing component
├── index.ts                  # Main exports and backend configuration
├── rssTorrentsApi.ts         # RTK Query API definitions
└── Series.tsx                # Series management component
```

### Building

```bash
npm run build
```

Builds TypeScript to JavaScript in the `dist/` directory with:
- ES modules output
- React JSX compilation
- Type declarations
- Source maps

### Key Features Implementation

#### Auto-refresh
Series data automatically refreshes every 10 minutes to keep torrent information current.

#### Bulk Operations
Series component supports selecting multiple series and updating subscriptions in bulk.

#### Error Handling
Comprehensive error handling with user-friendly error messages and loading states.

#### Type Safety
Full TypeScript coverage with strict type checking and comprehensive interfaces.

## UI/UX Features

- **Responsive Design**: Works on desktop and mobile devices
- **Loading States**: Clear loading indicators for all async operations
- **Error Messages**: User-friendly error handling and messages
- **Form Validation**: Client-side validation for series creation/editing
- **Confirmation Dialogs**: Confirmation for destructive operations
- **Bulk Selection**: Checkbox-based multi-selection for series
- **Search and Filtering**: Real-time search and filtering capabilities
- **Pagination**: Server-side pagination for large series lists

## Backend Requirements

Requires the RSS Torrents Backend package to be installed and configured:
- Authentication via Laravel Passport
- CORS configuration for frontend access
- Proper API endpoints as defined in the backend documentation

## License

MIT License

## Author

**Tim Schwartz**  
Email: tim@metaverse.systems

## Contributing

This package is part of the Clarion App ecosystem. Please follow the project's contribution guidelines when submitting changes.
