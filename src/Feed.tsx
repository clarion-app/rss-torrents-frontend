import React from 'react';
import { useGetTorrentsQuery } from './rssTorrentsApi';

interface FeedProps {
  url: string;
  onBack: () => void;
}

interface TorrentItem {
  magnetURI: string;
  size: string;
  resolution: string;
}

interface TorrentData {
  [showName: string]: {
    [episode: string]: TorrentItem[];
  };
}

export const Feed: React.FC<FeedProps> = ({ url, onBack }) => {
  const { data: torrentData, isLoading, error } = useGetTorrentsQuery(url);

  // Helper function to format file size
  const formatFileSize = (bytes: string): string => {
    const size = parseInt(bytes);
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  // Helper function to flatten the nested data structure
  const flattenTorrentData = (data: TorrentData) => {
    const flattened: Array<{
      showName: string;
      episode: string;
      torrents: TorrentItem[];
    }> = [];

    Object.entries(data).forEach(([showName, episodes]) => {
      Object.entries(episodes).forEach(([episode, torrents]) => {
        flattened.push({
          showName,
          episode,
          torrents
        });
      });
    });

    return flattened;
  };

  if (isLoading) {
    return (
      <div className="section">
        <div className="container">
          <button className="button is-light mb-4" onClick={onBack}>
            <span className="icon">
              <i className="fas fa-arrow-left"></i>
            </span>
            <span>Back to Feeds</span>
          </button>
          <div className="notification is-info">
            <span className="icon">
              <i className="fas fa-spinner fa-pulse"></i>
            </span>
            Loading torrents from feed...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="section">
        <div className="container">
          <button className="button is-light mb-4" onClick={onBack}>
            <span className="icon">
              <i className="fas fa-arrow-left"></i>
            </span>
            <span>Back to Feeds</span>
          </button>
          <div className="notification is-danger">
            <span className="icon">
              <i className="fas fa-exclamation-triangle"></i>
            </span>
            Error loading torrents: {error.toString()}
          </div>
        </div>
      </div>
    );
  }

  if (!torrentData || Object.keys(torrentData).length === 0) {
    return (
      <div className="section">
        <div className="container">
          <button className="button is-light mb-4" onClick={onBack}>
            <span className="icon">
              <i className="fas fa-arrow-left"></i>
            </span>
            <span>Back to Feeds</span>
          </button>
          <div className="notification is-warning">
            <span className="icon">
              <i className="fas fa-info-circle"></i>
            </span>
            No torrents found in this feed.
          </div>
        </div>
      </div>
    );
  }

  const flattenedData = flattenTorrentData(torrentData as unknown as TorrentData);

  return (
    <div className="section">
      <div className="container">
        <button className="button is-light mb-4" onClick={onBack}>
          <span className="icon">
            <i className="fas fa-arrow-left"></i>
          </span>
          <span>Back to Feeds</span>
        </button>
        
        <div className="box mb-4">
          <h2 className="title is-5">
            <span className="icon-text">
              <span className="icon">
                <i className="fas fa-rss"></i>
              </span>
              <span>Feed URL</span>
            </span>
          </h2>
          <p className="is-family-monospace is-size-7 has-text-grey">{url}</p>
        </div>

        <h3 className="title is-4 mb-4">
          <span className="icon-text">
            <span className="icon">
              <i className="fas fa-download"></i>
            </span>
            <span>Shows ({flattenedData.length})</span>
          </span>
        </h3>

        {flattenedData.map((show, index) => (
          <div key={index} className="box mb-4">
            <h4 className="title is-5 has-text-primary mb-3">
              <span className="icon-text">
                <span className="icon">
                  <i className="fas fa-tv"></i>
                </span>
                <span className="has-text-capitalized">{show.showName}</span>
              </span>
            </h4>
            
            <h5 className="subtitle is-6 mb-3">
              <span className="icon-text">
                <span className="icon">
                  <i className="fas fa-play-circle"></i>
                </span>
                <span>{show.episode}</span>
              </span>
            </h5>

            <div className="columns is-multiline">
              {show.torrents.map((torrent, torrentIndex) => (
                <div key={torrentIndex} className="column is-full-mobile is-half-tablet is-one-third-desktop">
                  <div className="card">
                    <div className="card-content">
                      <div className="media">
                        <div className="media-left">
                          <span className="icon is-large has-text-info">
                            <i className="fas fa-file-video fa-2x"></i>
                          </span>
                        </div>
                        <div className="media-content">
                          <p className="title is-6">
                            <span className="tag is-primary mr-2">{torrent.resolution}</span>
                          </p>
                          <p className="subtitle is-7 has-text-grey">
                            <span className="icon">
                              <i className="fas fa-hdd"></i>
                            </span>
                            {formatFileSize(torrent.size)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="buttons">
                        <a 
                          href={torrent.magnetURI} 
                          className="button is-primary is-small is-fullwidth"
                        >
                          <span className="icon">
                            <i className="fas fa-magnet"></i>
                          </span>
                          <span>Download Magnet</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
