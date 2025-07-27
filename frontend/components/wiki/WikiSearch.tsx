'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@heroui/input';
import { WikiPage } from '@/lib/markdown';
import { Link } from '@heroui/link';

interface WikiSearchProps {
  onResults?: (results: WikiPage[]) => void;
  currentVersion?: string;
}

export function WikiSearch({ onResults, currentVersion = 'latest' }: WikiSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<WikiPage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const searchPages = async () => {
      if (!query.trim()) {
        setResults([]);
        onResults?.([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/wiki/search?q=${encodeURIComponent(query)}&version=${encodeURIComponent(currentVersion)}`);
        const searchResults = await response.json();
        setResults(searchResults);
        onResults?.(searchResults);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
        onResults?.([]);
      }
      setIsLoading(false);
    };

    const debounceTimer = setTimeout(searchPages, 300);
    return () => clearTimeout(debounceTimer);
  }, [query, onResults, currentVersion]);

  return (
    <div className="relative">
      <Input
        type="text"
        placeholder="Search documentation..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full"
        startContent={
          <svg className="w-4 h-4 text-default-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        }
      />

      {query && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-content1 border border-divider rounded-lg shadow-lg max-h-96 overflow-y-auto z-10">
          {isLoading ? (
            <div className="p-4 text-center text-default-500">Searching...</div>
          ) : results.length > 0 ? (
            <div className="p-2">
              {results.map((page) => {
                const href = currentVersion === 'latest'
                  ? `/wiki/${page.slug.join('/')}`
                  : `/wiki/${currentVersion}/${page.slug.join('/')}`;

                return (
                  <Link
                    key={page.slug.join('/')}
                    href={href}
                    className="block p-3 hover:bg-default-100 rounded-md transition-colors"
                    onPress={() => setQuery('')}
                  >
                    <div className="font-medium text-sm text-default-700">{page.title}</div>
                    <div className="text-xs text-default-500 mt-1 flex items-center gap-2">
                      <span>/{page.slug.join('/')}</span>
                      {page.version && page.version !== 'latest' && (
                        <span className="bg-primary-100 text-primary-700 px-1 py-0.5 rounded text-xs">
                          {page.version}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="p-4 text-center text-default-500">No results found</div>
          )}
        </div>
      )}
    </div>
  );
}
