import React, { useState, useEffect } from 'react';
import {
  useGetSeriesQuery,
  useGetSubscribedSeriesQuery,
  useCreateSeriesMutation,
  useUpdateSeriesMutation,
  useDeleteSeriesMutation,
  useToggleSeriesSubscriptionMutation,
  useBulkUpdateSubscriptionMutation,
  useGetFeedUrlsQuery,
  Series as SeriesType,
  SeriesFilters,
} from './rssTorrentsApi';

interface SeriesProps {
  onBack?: () => void;
}

export const Series: React.FC<SeriesProps> = ({ onBack }) => {
  const [filters, setFilters] = useState<SeriesFilters>({ subscribed: true });
  const [selectedSeries, setSelectedSeries] = useState<string[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingSeries, setEditingSeries] = useState<SeriesType | null>(null);
  const [newSeries, setNewSeries] = useState({
    title: '',
    feed_url: '',
    subscribed: false,
  });

  const { data: seriesData, isLoading, error, refetch } = useGetSeriesQuery(filters);
  const { data: feedUrls, isLoading: isFeedUrlsLoading } = useGetFeedUrlsQuery();
  const [createSeries, { isLoading: isCreating }] = useCreateSeriesMutation();
  const [updateSeries, { isLoading: isUpdating }] = useUpdateSeriesMutation();
  const [deleteSeries] = useDeleteSeriesMutation();
  const [toggleSubscription] = useToggleSeriesSubscriptionMutation();
  const [bulkUpdateSubscription] = useBulkUpdateSubscriptionMutation();

  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearInterval(interval);
  }, [refetch]);

  const handleFilterChange = (newFilters: Partial<SeriesFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleCreateSeries = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createSeries(newSeries).unwrap();
      setNewSeries({ title: '', feed_url: '', subscribed: false });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create series:', error);
    }
  };

  const handleUpdateSeries = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSeries || !editingSeries.id) return;
    
    try {
      await updateSeries({
        id: editingSeries.id,
        data: {
          title: editingSeries.title,
          feed_url: editingSeries.feed_url,
          subscribed: editingSeries.subscribed,
        },
      }).unwrap();
      setEditingSeries(null);
    } catch (error) {
      console.error('Failed to update series:', error);
    }
  };

  const handleDeleteSeries = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this series?')) {
      try {
        await deleteSeries(id).unwrap();
      } catch (error) {
        console.error('Failed to delete series:', error);
      }
    }
  };

  const handleToggleSubscription = async (id: string) => {
    try {
      await toggleSubscription(id).unwrap();
    } catch (error) {
      console.error('Failed to toggle subscription:', error);
    }
  };

  const handleBulkSubscription = async (subscribed: boolean) => {
    if (selectedSeries.length === 0) return;
    
    try {
      await bulkUpdateSubscription({
        series_ids: selectedSeries,
        subscribed,
      }).unwrap();
      setSelectedSeries([]);
    } catch (error) {
      console.error('Failed to bulk update subscriptions:', error);
    }
  };

  const handleSelectSeries = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedSeries(prev => [...prev, id]);
    } else {
      setSelectedSeries(prev => prev.filter(seriesId => seriesId !== id));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked && seriesData?.data) {
      setSelectedSeries(seriesData.data.filter(series => series.id).map(series => series.id!));
    } else {
      setSelectedSeries([]);
    }
  };

  if (isLoading) {
    return (
      <div className="section">
        <div className="container">
          {onBack && (
            <button className="button is-light mb-4" onClick={onBack}>
              <span className="icon">
                <i className="fas fa-arrow-left"></i>
              </span>
              <span>Back</span>
            </button>
          )}
          <div className="notification is-info">
            <span className="icon">
              <i className="fas fa-spinner fa-pulse"></i>
            </span>
            Loading series...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="section">
        <div className="container">
          {onBack && (
            <button className="button is-light mb-4" onClick={onBack}>
              <span className="icon">
                <i className="fas fa-arrow-left"></i>
              </span>
              <span>Back</span>
            </button>
          )}
          <div className="notification is-danger">
            <span className="icon">
              <i className="fas fa-exclamation-triangle"></i>
            </span>
            Error loading series: {error.toString()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="container">
        {onBack && (
          <button className="button is-light mb-4" onClick={onBack}>
            <span className="icon">
              <i className="fas fa-arrow-left"></i>
            </span>
            <span>Back</span>
          </button>
        )}

        <div className="level">
          <div className="level-left">
            <div>
              <h1 className="title">RSS Torrent Series</h1>
              {seriesData && (
                <p className="subtitle">
                  {seriesData.total} series total
                  {seriesData.total !== seriesData.data.length && (
                    <span> • Showing {seriesData.data.length} on this page</span>
                  )}
                </p>
              )}
            </div>
          </div>
          <div className="level-right">
            <div className="buttons">
              <button
                className="button is-light"
                onClick={() => refetch()}
                disabled={isLoading}
              >
                <span className="icon">
                  <i className={`fas fa-sync-alt ${isLoading ? 'fa-spin' : ''}`}></i>
                </span>
                <span>Refresh</span>
              </button>
              <button
                className="button is-primary"
                onClick={() => setShowCreateForm(true)}
              >
                <span className="icon">
                  <i className="fas fa-plus"></i>
                </span>
                <span>Add Series</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="box mb-4">
          <div className="columns">
            <div className="column">
              <div className="field">
                <label className="label">Search</label>
                <div className="control">
                  <input
                    className="input"
                    type="text"
                    placeholder="Search by name or title..."
                    value={filters.search || ''}
                    onChange={(e) => handleFilterChange({ search: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="column">
              <div className="field">
                <label className="label">Subscription Status</label>
                <div className="control">
                  <div className="select is-fullwidth">
                    <select
                      value={filters.subscribed === undefined ? 'all' : filters.subscribed.toString()}
                      onChange={(e) => {
                        const value = e.target.value;
                        handleFilterChange({
                          subscribed: value === 'all' ? undefined : value === 'true'
                        });
                      }}
                    >
                      <option value="all">All</option>
                      <option value="true">Subscribed</option>
                      <option value="false">Not Subscribed</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div className="column">
              <div className="field">
                <label className="label">Feed URL</label>
                <div className="control">
                  <input
                    className="input"
                    type="text"
                    placeholder="Filter by feed URL..."
                    value={filters.feed_url || ''}
                    onChange={(e) => handleFilterChange({ feed_url: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedSeries.length > 0 && (
          <div className="notification is-info">
            <div className="level">
              <div className="level-left">
                <span>{selectedSeries.length} series selected</span>
              </div>
              <div className="level-right">
                <div className="buttons">
                  <button
                    className="button is-success is-small"
                    onClick={() => handleBulkSubscription(true)}
                  >
                    Subscribe All
                  </button>
                  <button
                    className="button is-warning is-small"
                    onClick={() => handleBulkSubscription(false)}
                  >
                    Unsubscribe All
                  </button>
                  <button
                    className="button is-light is-small"
                    onClick={() => setSelectedSeries([])}
                  >
                    Clear Selection
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Series Table */}
        {seriesData?.data && (
          <div className="table-container">
            <table className="table is-fullwidth is-striped is-hoverable">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={selectedSeries.length === seriesData.data.length && seriesData.data.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </th>
                  <th>Title</th>
                  <th>Feed URL</th>
                  <th>Latest Episode</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {seriesData.data.map((series) => (
                  <tr key={series.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={series.id ? selectedSeries.includes(series.id) : false}
                        onChange={(e) => series.id && handleSelectSeries(series.id, e.target.checked)}
                      />
                    </td>
                    <td>{series.title}</td>
                    <td>
                      <span className="tag is-light" title={series.feed_url}>
                        {new URL(series.feed_url).hostname}
                      </span>
                    </td>
                    <td>
                      {series.episodes && series.episodes.length > 0 ? (
                        <span className="tag is-info">
                          Episode {series.episodes[series.episodes.length - 1].episode}
                        </span>
                      ) : (
                        <span className="tag is-light">No episodes</span>
                      )}
                    </td>
                    <td>
                      <span className={`tag ${series.subscribed ? 'is-success' : 'is-light'}`}>
                        {series.subscribed ? 'Subscribed' : 'Not Subscribed'}
                      </span>
                    </td>
                    <td>
                      <div className="buttons are-small">
                        <button
                          className={`button ${series.subscribed ? 'is-warning' : 'is-success'}`}
                          onClick={() => series.id && handleToggleSubscription(series.id)}
                          disabled={!series.id}
                        >
                          {series.subscribed ? 'Unsubscribe' : 'Subscribe'}
                        </button>
                        <button
                          className="button is-info"
                          onClick={() => setEditingSeries(series)}
                        >
                          Edit
                        </button>
                        <button
                          className="button is-danger"
                          onClick={() => series.id && handleDeleteSeries(series.id)}
                          disabled={!series.id}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {seriesData && seriesData.last_page > 1 && (
          <nav className="pagination is-centered mt-4">
            <button
              className="pagination-previous"
              disabled={seriesData.current_page === 1}
              onClick={() => handleFilterChange({ page: seriesData.current_page - 1 })}
            >
              Previous
            </button>
            <button
              className="pagination-next"
              disabled={seriesData.current_page === seriesData.last_page}
              onClick={() => handleFilterChange({ page: seriesData.current_page + 1 })}
            >
              Next
            </button>
            <ul className="pagination-list">
              <li>
                <span className="pagination-ellipsis">
                  Page {seriesData.current_page} of {seriesData.last_page}
                </span>
              </li>
            </ul>
          </nav>
        )}

        {/* Create Series Modal */}
        <div className={`modal ${showCreateForm ? 'is-active' : ''}`}>
          <div className="modal-background" onClick={() => setShowCreateForm(false)}></div>
          <div className="modal-card">
            <header className="modal-card-head">
              <p className="modal-card-title">Add New Series</p>
              <button
                className="delete"
                onClick={() => setShowCreateForm(false)}
              ></button>
            </header>
            <form onSubmit={handleCreateSeries}>
              <section className="modal-card-body">
                <div className="field">
                  <label className="label">Title</label>
                  <div className="control">
                    <input
                      className="input"
                      type="text"
                      required
                      value={newSeries.title}
                      onChange={(e) => setNewSeries(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="field">
                  <label className="label">Feed URL</label>
                  <div className="control">
                    <div className="select is-fullwidth">
                      <select
                        required
                        value={newSeries.feed_url}
                        onChange={(e) => setNewSeries(prev => ({ ...prev, feed_url: e.target.value }))}
                        disabled={isFeedUrlsLoading}
                      >
                        <option value="">
                          {isFeedUrlsLoading ? 'Loading feed URLs...' : 'Select a feed URL'}
                        </option>
                        {feedUrls?.map((url) => (
                          <option key={url} value={url}>
                            {url}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="field">
                  <div className="control">
                    <label className="checkbox">
                      <input
                        type="checkbox"
                        checked={newSeries.subscribed}
                        onChange={(e) => setNewSeries(prev => ({ ...prev, subscribed: e.target.checked }))}
                      />
                      {' '}Subscribe to this series
                    </label>
                  </div>
                </div>
              </section>
              <footer className="modal-card-foot">
                <button
                  className={`button is-success ${isCreating ? 'is-loading' : ''}`}
                  type="submit"
                  disabled={isCreating}
                >
                  Create Series
                </button>
                <button
                  className="button"
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </button>
              </footer>
            </form>
          </div>
        </div>

        {/* Edit Series Modal */}
        <div className={`modal ${editingSeries ? 'is-active' : ''}`}>
          <div className="modal-background" onClick={() => setEditingSeries(null)}></div>
          <div className="modal-card">
            <header className="modal-card-head">
              <p className="modal-card-title">Edit Series</p>
              <button
                className="delete"
                onClick={() => setEditingSeries(null)}
              ></button>
            </header>
            {editingSeries && (
              <form onSubmit={handleUpdateSeries}>
                <section className="modal-card-body">
                  <div className="field">
                    <label className="label">Title</label>
                    <div className="control">
                      <input
                        className="input"
                        type="text"
                        required
                        value={editingSeries.title}
                        onChange={(e) => setEditingSeries((prev: SeriesType | null) => prev ? { ...prev, title: e.target.value } : null)}
                      />
                    </div>
                  </div>
                  <div className="field">
                    <label className="label">Feed URL</label>
                    <div className="control">
                      <div className="select is-fullwidth">
                        <select
                          required
                          value={editingSeries.feed_url}
                          onChange={(e) => setEditingSeries((prev: SeriesType | null) => prev ? { ...prev, feed_url: e.target.value } : null)}
                          disabled={isFeedUrlsLoading}
                        >
                          <option value="">
                            {isFeedUrlsLoading ? 'Loading feed URLs...' : 'Select a feed URL'}
                          </option>
                          {feedUrls?.map((url) => (
                            <option key={url} value={url}>
                              {url}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="field">
                    <div className="control">
                      <label className="checkbox">
                        <input
                          type="checkbox"
                          checked={editingSeries.subscribed}
                          onChange={(e) => setEditingSeries((prev: SeriesType | null) => prev ? { ...prev, subscribed: e.target.checked } : null)}
                        />
                        {' '}Subscribe to this series
                      </label>
                    </div>
                  </div>
                </section>
                <footer className="modal-card-foot">
                  <button
                    className={`button is-success ${isUpdating ? 'is-loading' : ''}`}
                    type="submit"
                    disabled={isUpdating}
                  >
                    Update Series
                  </button>
                  <button
                    className="button"
                    type="button"
                    onClick={() => setEditingSeries(null)}
                  >
                    Cancel
                  </button>
                </footer>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
