import React, { useCallback } from "react";

import "./Playlist.css";

import TrackList from "../TrackList/TrackList";

const Playlist = (props) => {
  const handleNameChange = useCallback(
    (event) => {
      props.onNameChange(event.target.value);
    },
    [props, props.onNameChange]
  );

  const inputClass = props.playlistName === "New Playlist" ? "input-default" : "input-updated";

  return (
    <div className="Playlist">
      <input onChange={handleNameChange}  value={props.playlistName}  className={inputClass} />
      <TrackList
        tracks={props.playlistTracks}
        isRemoval={true}
        onRemove={props.onRemove}
      />
      <button className="Playlist-save" onClick={props.onSave}>
        SAVE TO SPOTIFY
      </button>
    </div>
  );
};

export default Playlist;
