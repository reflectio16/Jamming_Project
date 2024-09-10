import Spotify from './Spotify';

// Mock fetch globally
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
    ok: true,
  })
);

// Mock the window object for location manipulation in getAccessToken
global.window = {
  location: {
    href: '',
    assign: jest.fn(),
  },
  setTimeout: jest.fn(),
  history: {
    pushState: jest.fn(),
  },
};

describe('Spotify API', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  describe('search()', () => {
    it('should fetch search results from Spotify', async () => {
      // Mock a successful fetch response
      fetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              tracks: {
                items: [
                  {
                    id: '123',
                    name: 'Test Song',
                    artists: [{ name: 'Test Artist' }],
                    album: { name: 'Test Album' },
                    uri: 'spotify:track:123',
                  },
                ],
              },
            }),
        })
      );

      const term = 'Test Song';
      const tracks = await Spotify.search(term);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(`q=${term}`),
        expect.objectContaining({
          headers: expect.objectContaining({ Authorization: expect.any(String) }),
        })
      );
      expect(tracks).toHaveLength(1);
      expect(tracks[0]).toEqual({
        id: '123',
        name: 'Test Song',
        artist: 'Test Artist',
        album: 'Test Album',
        uri: 'spotify:track:123',
      });
    });

    it('should return an empty array if no tracks are found', async () => {
      // Mock an empty fetch response
      fetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ tracks: { items: [] } }),
        })
      );

      const tracks = await Spotify.search('Non-existent Song');
      expect(tracks).toEqual([]);
    });
  });

  describe('savePlaylist()', () => {
    it('should save a playlist and add tracks to it', async () => {
      // Mock user ID response
      fetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ id: 'test_user_id' }),
        })
      );

      // Mock playlist creation response
      fetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ id: 'test_playlist_id' }),
        })
      );

      // Mock adding tracks to playlist
      fetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        })
      );

      const playlistName = 'Test Playlist';
      const trackUris = ['spotify:track:123', 'spotify:track:456'];
      await Spotify.savePlaylist(playlistName, trackUris);

      expect(fetch).toHaveBeenCalledTimes(3); // One for getting user ID, one for creating playlist, one for adding tracks
      expect(fetch).toHaveBeenCalledWith(
        'https://api.spotify.com/v1/users/test_user_id/playlists',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: playlistName }),
        })
      );
      expect(fetch).toHaveBeenCalledWith(
        'https://api.spotify.com/v1/playlists/test_playlist_id/tracks',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ uris: trackUris }),
        })
      );
    });

    it('should not save a playlist if name or trackUris are missing', async () => {
      await Spotify.savePlaylist('', ['spotify:track:123']);
      expect(fetch).not.toHaveBeenCalled();

      await Spotify.savePlaylist('Test Playlist', []);
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe('getTrack()', () => {
    it('should fetch a track by its ID', async () => {
      // Mock fetch response for track details
      fetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              id: '123',
              name: 'Test Song',
              artists: [{ name: 'Test Artist' }],
              album: { name: 'Test Album' },
              uri: 'spotify:track:123',
            }),
        })
      );

      const trackId = '123';
      const track = await Spotify.getTrack(trackId);

      expect(fetch).toHaveBeenCalledWith(
        `https://api.spotify.com/v1/tracks/${trackId}`,
        expect.objectContaining({
          headers: expect.objectContaining({ Authorization: expect.any(String) }),
        })
      );
      expect(track).toEqual({
        id: '123',
        name: 'Test Song',
        artist: 'Test Artist',
        album: 'Test Album',
        uri: 'spotify:track:123',
      });
    });

    it('should throw an error if the track is not found', async () => {
      fetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: false, // Simulating a failed request
        })
      );
    
      await expect(Spotify.getTrack('invalid_id')).rejects.toThrow('Request failed!');
    });    
  });
});
