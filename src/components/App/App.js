import React, { useCallback, useState } from "react";
import "./App.css";

import SearchBar from "../SearchBar/SearchBar";
import SearchResults from "../SearchResults/SearchResults";
import Playlist from "../Playlist/Playlist";
import Spotify from "../../utilities/Spotify";

const App = () => {
  const [searchResults, setSearchResults] = useState([]); // Stores the results of a search from Spotify.
  const [playlistName, setPlaylistName] = useState("New Playlist"); // Holds the name of the current playlist.
  const [playlistTracks, setPlaylistTracks] = useState([]); // Maintains a list of tracks in the current playlist.
  const [isPlaylistSaved, setIsPlaylistSaved] = useState(false); // Manages state of playlist as boolean value (saved or not).
  const [savedPlaylistName, setSavedPlaylistName] = useState(""); // Manages state for displaying a confirmation message when a playlist is successfully saved to Spotify.

  const search = useCallback((term) => {
    Spotify.search(term).then((result) => setSearchResults(result));
  }, []);

  const addTrack = useCallback((track) => {
    if (playlistTracks.some((savedTrack) => savedTrack.id === track.id)) {
      return;   //prevents to add the same song in playlist twice.
    }
    setPlaylistTracks((prevTracks) => [...prevTracks, track]);
  }, [playlistTracks]);

  const removeTrack = useCallback((track) => {
    setPlaylistTracks((prevTracks) =>
      prevTracks.filter((currentTrack) => currentTrack.id !== track.id)
    );
  }, []);

  const updatePlaylistName = useCallback((name) => {
    setPlaylistName(name);
  }, []);

  const savePlaylist = useCallback(() => {
    const trackUris = playlistTracks.map((track) => track.uri);
    Spotify.savePlaylist(playlistName, trackUris).then(() => {
      setSavedPlaylistName(playlistName);
      setPlaylistName("New Playlist"); // Reset playlist name to default
      setPlaylistTracks([]); // Clear the playlist tracks
      setIsPlaylistSaved(true); // Show the confirmation message
      setTimeout(() => setIsPlaylistSaved(false), 5000); // Hide the message after 5 seconds
    });
  }, [playlistName, playlistTracks]);

  return (
    <div>
      <h1>
        Ja<span className="highlight">mmm</span>ing
      </h1>
      <div className="App">
        <SearchBar onSearch={search} />
        <div className="App-playlist">
          <SearchResults searchResults={searchResults} onAdd={addTrack} />
          <Playlist
            playlistName={playlistName}
            playlistTracks={playlistTracks}
            onNameChange={updatePlaylistName}
            onRemove={removeTrack}
            onSave={savePlaylist}
            
          />

          {isPlaylistSaved && (
            <div className="info-message">
              Your new playlist has been created as <span className="saved-playlistName">{savedPlaylistName}</span> on your Spotify account!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
