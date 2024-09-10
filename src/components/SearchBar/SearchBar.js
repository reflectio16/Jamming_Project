import React, { useState, useCallback } from "react";
import "./SearchBar.css";

const SearchBar = (props) => {
  const [term, setTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);  // Added state for search button

  const handleTermChange = useCallback((event) => {
    setTerm(event.target.value);
  }, []);

  const search = useCallback(async () => {
    setIsSearching(true);  // Disable search button while searching
    try {
      await props.onSearch(term);
    } finally {
      setIsSearching(false);  // Re-enable button after search is complete
    }
  }, [props.onSearch, term]);

  return (
    <div className="SearchBar">
      <input
        placeholder="Enter A Song Title"
        onChange={handleTermChange}
        value={term}
      />
      <button
        className="SearchButton"
        onClick={search}
        disabled={isSearching || !term} // Disable if searching or term is empty
      >
        {isSearching ? 'Searching...' : 'SEARCH'}
      </button>
    </div>
  );
};

export default SearchBar;
