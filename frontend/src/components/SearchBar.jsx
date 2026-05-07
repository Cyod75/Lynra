import { useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import useStore from '../store/useStore';

export default function SearchBar() {
  const { searchQuery, setSearchQuery, fetchBookmarks } = useStore();
  const debounceRef = useRef(null);

  const handleChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchBookmarks(), 300);
  };

  const handleClear = () => {
    setSearchQuery('');
    clearTimeout(debounceRef.current);
    fetchBookmarks();
  };

  useEffect(() => () => clearTimeout(debounceRef.current), []);

  return (
    <div className="relative flex-1 max-w-xl">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
        style={{ color: 'var(--app-faint)' }} />
      <input
        id="search-input"
        type="text"
        value={searchQuery}
        onChange={handleChange}
        placeholder="Buscar enlaces…"
        className="input-base pl-9 pr-9 text-sm"
      />
      {searchQuery && (
        <button onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
          style={{ color: 'var(--app-faint)' }}>
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
