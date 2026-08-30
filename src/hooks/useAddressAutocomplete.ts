import { useState, useEffect, useRef, useCallback } from 'react';

export interface AddressSuggestion {
  displayName: string;
  address: string;
  suburb: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
}

const AU_STATES: Record<string, string> = {
  'new south wales': 'NSW',
  'victoria': 'VIC',
  'queensland': 'QLD',
  'western australia': 'WA',
  'south australia': 'SA',
  'tasmania': 'TAS',
  'australian capital territory': 'ACT',
  'northern territory': 'NT',
  nsw: 'NSW',
  vic: 'VIC',
  qld: 'QLD',
  wa: 'WA',
  sa: 'SA',
  tas: 'TAS',
  act: 'ACT',
  nt: 'NT',
};

function normaliseState(raw: string): string {
  if (!raw) return '';
  const lower = raw.toLowerCase().trim();
  return AU_STATES[lower] || raw.toUpperCase();
}

function parseNominatim(item: any): AddressSuggestion {
  const a = item.address || {};
  const road = a.road || a.pedestrian || a.path || '';
  const houseNumber = a.house_number || '';
  const streetAddress = houseNumber ? `${houseNumber} ${road}` : road;

  // Build a clean display name limited to Australia context
  const suburb = a.suburb || a.neighbourhood || a.quarter || a.hamlet || '';
  const city = a.city || a.town || a.village || a.county || suburb;
  const stateRaw = a.state || '';
  const state = normaliseState(stateRaw);
  const postcode = a.postcode || '';

  // Reconstruct the suggestion label to match AU format: "Road Name, Suburb STATE POSTCODE, Australia"
  const parts = [streetAddress, suburb, state && postcode ? `${state} ${postcode}` : (state || postcode), 'Australia']
    .filter(Boolean)
    .filter((v, i, arr) => arr.indexOf(v) === i); // dedupe

  return {
    displayName: parts.join(', '),
    address: streetAddress,
    suburb,
    city,
    state,
    postcode,
    country: 'Australia',
  };
}

export function useAddressAutocomplete() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const search = useCallback(async (value: string) => {
    if (value.trim().length < 3) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setIsLoading(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?` +
        new URLSearchParams({
          q: value,
          countrycodes: 'au',
          addressdetails: '1',
          format: 'json',
          limit: '6',
        }).toString();

      const res = await fetch(url, {
        signal: abortRef.current.signal,
        headers: { 'Accept-Language': 'en-AU' },
      });

      if (!res.ok) throw new Error('Nominatim error');
      const data: any[] = await res.json();

      const parsed = data
        .filter((item) => item.address)
        .map(parseNominatim)
        .filter((s) => s.address); // only items that resolved to a street address

      setSuggestions(parsed);
      setIsOpen(parsed.length > 0);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setSuggestions([]);
        setIsOpen(false);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, search]);

  const clear = useCallback(() => {
    setSuggestions([]);
    setIsOpen(false);
    if (abortRef.current) abortRef.current.abort();
  }, []);

  return { query, setQuery, suggestions, isOpen, setIsOpen, isLoading, clear };
}
