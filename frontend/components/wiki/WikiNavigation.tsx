'use client';

import React, { useEffect, useState } from 'react';
import { WikiNavItem } from '@/lib/markdown';
import { Link } from '@heroui/link';
import { Accordion, AccordionItem } from '@heroui/react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface WikiNavigationProps {
  items: WikiNavItem[];
  currentSlug: string[];
  currentVersion?: string;
  pageContent?: string; // Add page content for table of contents
}

export function WikiNavigation({ items, currentSlug, currentVersion = 'latest', pageContent }: WikiNavigationProps) {
  const [toc, setToc] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  // Parse table of contents from page content
  useEffect(() => {
    if (!pageContent) {
      setToc([]);
      return;
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(pageContent, 'text/html');
    const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');

    const tocItems: TocItem[] = Array.from(headings).map((heading) => ({
      id: heading.id,
      text: heading.textContent || '',
      level: parseInt(heading.tagName.charAt(1)),
    })).filter(item => item.id && item.text);

    setToc(tocItems);
  }, [pageContent]);

  // Track which heading is currently visible
  useEffect(() => {
    if (toc.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0% -35% 0%' }
    );

    toc.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [toc]);
  // Remove version from currentSlug to get the actual page path
  const getPagePath = (slug: string[]) => {
    return slug.join('/');
  };

  const currentPath = getPagePath(currentSlug);

  // Helper function to generate version-aware URLs
  const getVersionAwareUrl = (itemPath: string) => {
    return `/wiki/${currentVersion}/${itemPath}`;
  };

  const renderNavItem = (item: WikiNavItem, depth: number = 0) => {
    const itemPath = item.slug.join('/');
    const isActive = currentPath === itemPath;
    const isParentActive = currentPath.startsWith(itemPath + '/');

    if (item.isFile) {
      return (
        <div key={itemPath}>
          <Link
            href={getVersionAwareUrl(itemPath)}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors hover:bg-default-100 ${
              isActive ? 'bg-primary-50 text-primary-600' : 'text-default-600'
            }`}
            style={{ paddingLeft: `${depth * 16 + 12}px` }}
          >
            {item.title}
          </Link>

          {/* Show table of contents under the active page */}
          {isActive && toc.length > 0 && (
            <div className="ml-4 mt-1 mb-2 bg-default-50 border border-default-200 rounded-md p-2">
              <div className="text-xs font-semibold text-default-600 mb-2 px-2 py-1 bg-default-100 rounded">
                On this page
              </div>
              <div className="space-y-0.5">
                {toc.map((tocItem) => (
                  <Link
                    key={tocItem.id}
                    href={`#${tocItem.id}`}
                    className={`block text-xs px-2 py-1 rounded-sm transition-colors hover:bg-default-100 hover:text-primary ${
                      activeId === tocItem.id
                        ? 'text-primary font-medium bg-primary-50 border-l-2 border-primary'
                        : 'text-default-500'
                    }`}
                    style={{ paddingLeft: `${(tocItem.level - 1) * 8 + 8}px` }}
                  >
                    {tocItem.text}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    if (item.children && item.children.length > 0) {
      return (
        <Accordion
          key={itemPath}
          variant="light"
          defaultExpandedKeys={isParentActive ? [itemPath] : []}
        >
          <AccordionItem
            key={itemPath}
            aria-label={item.title}
            title={
              <div className="flex items-center gap-2 text-default-700">
                {item.title}
              </div>
            }
            indicator={<span className="text-default-400">▼</span>}
            className="border-none"
          >
            <div className="ml-4">
              {item.children.map(child => renderNavItem(child, depth + 1))}
            </div>
          </AccordionItem>
        </Accordion>
      );
    }

    return (
      <Link
        key={itemPath}
        href={getVersionAwareUrl(itemPath)}
        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors hover:bg-default-100 ${
          isActive ? 'bg-primary-50 text-primary-600' : 'text-default-600'
        }`}
        style={{ paddingLeft: `${depth * 16 + 12}px` }}
      >
        {item.title}
      </Link>
    );
  };

  return (
    <nav className="w-64 h-full overflow-y-auto border-r border-divider bg-content1">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4 text-default-700">Wiki</h2>
        <div className="space-y-1">
          {items.map(item => renderNavItem(item))}
        </div>
      </div>
    </nav>
  );
}
