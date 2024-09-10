const clientId = '0b36d00c0e424ea1950ca3e859e94c06'; // Insert client ID here.
const redirectUri = 'https://mervesjammingproject.surge.sh';
let accessToken;
let tokenExpiryTime;

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
      tokenExpiryTime = new Date().getTime() + expiresIn * 1000;
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

  async search(term) {
    // Ensure the access token is obtained first before making the search call
    if (!accessToken || new Date().getTime() >= tokenExpiryTime) {
      this.getAccessToken();
      return; // Exit early if redirection occurs for authorization.
    }

    const headers = this.createHeaders();
    try {
      const response = await fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`, { headers });
      const jsonResponse = await response.json();

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
    } catch (error) {
      console.error('Error fetching search results:', error);
    }
  },

  async savePlaylist(name, trackUris) {
    if (!name || !trackUris.length) {
      return;
    }

    const headers = this.createHeaders();
    let userId;

    try {
      const userResponse = await fetch('https://api.spotify.com/v1/me', { headers });
      const userJson = await userResponse.json();
      userId = userJson.id;

      const playlistResponse = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
        headers,
        method: 'POST',
        body: JSON.stringify({ name })
      });
      const playlistJson = await playlistResponse.json();
      const playlistId = playlistJson.id;

      return fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        headers,
        method: 'POST',
        body: JSON.stringify({ uris: trackUris })
      });
    } catch (error) {
      console.error('Error saving playlist:', error);
    }
  },

  async getTrack(trackId) {
    const headers = this.createHeaders();
    try {
      const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, { headers });
      if (!response.ok) {
        return Promise.reject(new Error('Request failed!'));
      }
      const jsonResponse = await response.json();

      return {
        id: jsonResponse.id,
        name: jsonResponse.name,
        artist: jsonResponse.artists[0].name,
        album: jsonResponse.album.name,
        uri: jsonResponse.uri
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
};

export default Spotify;
