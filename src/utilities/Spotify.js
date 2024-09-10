const clientId = '0b36d00c0e424ea1950ca3e859e94c06'; // Insert client ID here.
const redirectUri = 'https://mervesjammingproject.surge.sh';
let accessToken;

const Spotify = {
  getAccessToken() {
    if (accessToken) {
      return accessToken;
    }

    const accessTokenMatch = window.location.href.match(/access_token=([^&]*)/);
    const expiresInMatch = window.location.href.match(/expires_in=([^&]*)/);

    if (accessTokenMatch && expiresInMatch) {
      accessToken = accessTokenMatch[1];
      const expiresIn = Number(expiresInMatch[1]);
      window.setTimeout(() => accessToken = '', expiresIn * 1000);
      window.history.pushState('Access Token', null, '/');
      return accessToken;
    } else {
      const accessUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectUri}`;
      window.location = accessUrl;
    }
  },

  createHeaders() {
    const accessToken = this.getAccessToken();
    return { Authorization: `Bearer ${accessToken}` };
  },

  search(term) {
    const headers = this.createHeaders();
    return fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`, { headers })
      .then(response => response.json())
      .then(jsonResponse => {
        if (!jsonResponse.tracks) {
          return [];
        }
        return jsonResponse.tracks.items.map(track => ({
          id: track.id,
          name: track.name,
          artist: track.artists[0].name,
          album: track.album.name,
          uri: track.uri
        }));
      }).catch(error => {
        console.error('Error fetching search results:', error);
      });
  },

  savePlaylist(name, trackUris) {
    if (!name || !trackUris.length) {
      return;
    }

    const headers = this.createHeaders();
    let userId;

    return fetch('https://api.spotify.com/v1/me', { headers })
      .then(response => response.json())
      .then(jsonResponse => {
        userId = jsonResponse.id;
        return fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
          headers,
          method: 'POST',
          body: JSON.stringify({ name })
        });
      })
      .then(response => response.json())
      .then(jsonResponse => {
        const playlistId = jsonResponse.id;
        return fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
          headers,
          method: 'POST',
          body: JSON.stringify({ uris: trackUris })
        });
      }).catch(error => {
        console.error('Error saving playlist:', error);
      });
  },

  getTrack(trackId) {
    const headers = this.createHeaders();
    return fetch(`https://api.spotify.com/v1/tracks/${trackId}`, { headers })
      .then(response => {
        if (!response.ok) {
          // Explicitly reject the promise here to ensure it's caught as a rejected promise
          return Promise.reject(new Error('Request failed!'));
        }
        return response.json();
      })
      .then(jsonResponse => ({
        id: jsonResponse.id,
        name: jsonResponse.name,
        artist: jsonResponse.artists[0].name,
        album: jsonResponse.album.name,
        uri: jsonResponse.uri
      }))
      .catch(error => {
        console.error(error);
        throw error; // Rethrow the error for proper error handling in tests
      });
  }
  
};

export default Spotify;
