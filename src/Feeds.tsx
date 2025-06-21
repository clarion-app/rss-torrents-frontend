import React, { useState } from 'react';
import { useGetFeedUrlsQuery } from './rssTorrentsApi';
import { Feed } from './Feed';

export const Feeds: React.FC = () => {
  const [selectedFeedUrl, setSelectedFeedUrl] = useState<string | null>(null);
  const { data: feedUrls, isLoading, error } = useGetFeedUrlsQuery();

  // If a feed is selected, show the Feed component
  if (selectedFeedUrl) {
    return (
      <Feed 
        url={selectedFeedUrl} 
        onBack={() => setSelectedFeedUrl(null)} 
      />
    );
  }

  if (isLoading) {
    return (
      <div className="section">
        <div className="container">
          <div className="notification is-info">
            <span className="icon">
              <i className="fas fa-spinner fa-pulse"></i>
            </span>
            Loading feed URLs...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="section">
        <div className="container">
          <div className="notification is-danger">
            <span className="icon">
              <i className="fas fa-exclamation-triangle"></i>
            </span>
            Error loading feed URLs: {error.toString()}
          </div>
        </div>
      </div>
    );
  }

  if (!feedUrls || feedUrls.length === 0) {
    return (
      <div className="section">
        <div className="container">
          <div className="notification is-warning">
            <span className="icon">
              <i className="fas fa-info-circle"></i>
            </span>
            No feed URLs available.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="container">
        <h2 className="title is-4">
          <span className="icon-text">
            <span className="icon">
              <i className="fas fa-rss"></i>
            </span>
            <span>RSS Feed URLs</span>
          </span>
        </h2>
        <div className="content">
          <ul>
            {feedUrls.map((url, index) => (
              <li key={index} className="mb-2">
                <button 
                  onClick={() => setSelectedFeedUrl(url)}
                  className="button is-link is-outlined is-fullwidth has-text-left"
                >
                  <span className="icon">
                    <i className="fas fa-rss"></i>
                  </span>
                  <span className="is-family-monospace">{url}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
