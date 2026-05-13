'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Loader2 } from 'lucide-react';

function extractCityName(suggestion) {
  var a = suggestion.address || {};
  var city  = a.city || a.town || a.village || a.municipality || suggestion.display_name.split(',')[0];
  var state = a.state || '';
  return state ? city + ', ' + state : city;
}

export default function CityAutocomplete({ value, onChange, placeholder, iconColor, required, name }) {
  var [query,       setQuery]       = useState(value || '');
  var [suggestions, setSuggestions] = useState([]);
  var [loading,     setLoading]     = useState(false);
  var [open,        setOpen]        = useState(false);
  var debounceRef  = useRef(null);
  var containerRef = useRef(null);

  // Sync external value
  useEffect(function() { setQuery(value || ''); }, [value]);

  // Close dropdown on outside click
  useEffect(function() {
    function fn(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', fn);
    return function() { document.removeEventListener('mousedown', fn); };
  }, []);

  var search = useCallback(function(q) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.length < 3) { setSuggestions([]); setOpen(false); return; }

    debounceRef.current = setTimeout(async function() {
      setLoading(true);
      try {
        var params = new URLSearchParams({
          q: q, format: 'json', countrycodes: 'br',
          limit: '6', addressdetails: '1',
        });
        var res  = await fetch('https://nominatim.openstreetmap.org/search?' + params.toString(), {
          headers: { 'Accept-Language': 'pt-BR', 'User-Agent': 'BoraRodar/1.0' },
        });
        var data = await res.json();
        // Filtrar apenas resultados com cidade definida
        var filtered = data.filter(function(s) {
          var a = s.address || {};
          return a.city || a.town || a.village || a.municipality;
        });
        setSuggestions(filtered.slice(0, 6));
        setOpen(filtered.length > 0);
      } catch (_) {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 500);
  }, []);

  function handleChange(e) {
    var q = e.target.value;
    setQuery(q);
    onChange(q);
    search(q);
  }

  function select(s) {
    var label = extractCityName(s);
    setQuery(label);
    onChange(label);
    setSuggestions([]);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Icone colorido */}
      <MapPin
        className="absolute top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none z-10"
        style={{ left: '12px', color: iconColor || '#39FF14' }}
      />

      {/* Input */}
      <input
        type="text"
        name={name}
        className="br-input"
        style={{ paddingLeft: '2.25rem', paddingRight: loading ? '2.5rem' : undefined }}
        placeholder={placeholder}
        value={query}
        onChange={handleChange}
        onFocus={function() { if (suggestions.length > 0) setOpen(true); }}
        required={required}
        autoComplete="off"
      />

      {/* Spinner de carregamento */}
      {loading && (
        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 animate-spin"/>
      )}

      {/* Dropdown de sugestoes */}
      {open && suggestions.length > 0 && (
        <div
          className="absolute z-50 top-full left-0 right-0 mt-1 rounded-xl overflow-hidden shadow-card"
          style={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          {suggestions.map(function(s, i) {
            var a    = s.address || {};
            var city = a.city || a.town || a.village || a.municipality || s.display_name.split(',')[0];
            var state= a.state || '';
            var extra= [a.county, a.region].filter(Boolean).join(', ');
            return (
              <button
                key={i}
                type="button"
                className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-white/5 last:border-0"
                style={{ background: 'transparent' }}
                onMouseEnter={function(e) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                onMouseLeave={function(e) { e.currentTarget.style.background = 'transparent'; }}
                onClick={function() { select(s); }}
              >
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: iconColor || '#39FF14' }}/>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-white truncate">
                    {city}{state ? ', ' + state : ''}
                  </div>
                  {extra && <div className="text-xs text-gray-500 truncate">{extra}</div>}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
