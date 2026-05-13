import { useState } from 'react';
import { useDebounce } from './useDebounce';

export function useSearch(delay = 300) {
  const [searchText, setSearchText] = useState('');
  const debouncedSearch = useDebounce(searchText, delay);
  return { searchText, setSearchText, debouncedSearch } as const;
}

export function matchesSearch(text: string, query: string): boolean {
  return !query || text.toLowerCase().includes(query.toLowerCase());
}
