'use client';

import React from 'react';
import { WikiNavItem } from '@/lib/markdown';
import { Link } from '@heroui/link';
import { Accordion, AccordionItem } from '@heroui/react';

// Simple icon components
const DocumentIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-4.5A1.125 1.125 0 0110.5 9h-2.25A3.375 3.375 0 005.25 12.375v2.625M19.5 14.25l-2.25 2.25L15 18.75M19.5 14.25L21 15.75" />
  </svg>
);

const FolderIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25H11.69z" />
  </svg>
);

const ChevronDownIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
  </svg>
);

interface WikiNavigationProps {
  items: WikiNavItem[];
  currentSlug: string[];
  currentVersion?: string;
}

export function WikiNavigation({ items, currentSlug, currentVersion = 'latest' }: WikiNavigationProps) {
  // Remove version from currentSlug to get the actual page path
  const getPagePath = (slug: string[]) => {
    if (currentVersion !== 'latest' && slug.length > 0 && slug[0] === currentVersion) {
      return slug.slice(1).join('/');
    }
    return slug.join('/');
  };

  const currentPath = getPagePath(currentSlug);

  // Helper function to generate version-aware URLs
  const getVersionAwareUrl = (itemPath: string) => {
    if (currentVersion === 'latest') {
      return `/wiki/${itemPath}`;
    } else {
      return `/wiki/${currentVersion}/${itemPath}`;
    }
  };

  const renderNavItem = (item: WikiNavItem, depth: number = 0) => {
    const itemPath = item.slug.join('/');
    const isActive = currentPath === itemPath;
    const isParentActive = currentPath.startsWith(itemPath + '/');

    if (item.isFile) {
      return (
        <Link
          key={itemPath}
          href={getVersionAwareUrl(itemPath)}
          className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors hover:bg-default-100 ${
            isActive ? 'bg-primary-50 text-primary-600' : 'text-default-600'
          }`}
          style={{ paddingLeft: `${depth * 16 + 12}px` }}
        >
          <DocumentIcon className="w-4 h-4 flex-shrink-0" />
          {item.title}
        </Link>
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
                <FolderIcon className="w-4 h-4" />
                {item.title}
              </div>
            }
            indicator={<ChevronDownIcon className="w-4 h-4" />}
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
        <FolderIcon className="w-4 h-4 flex-shrink-0" />
        {item.title}
      </Link>
    );
  };

  return (
    <nav className="w-64 h-full overflow-y-auto border-r border-divider bg-content1">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4 text-default-700">Documentation</h2>
        <div className="space-y-1">
          {items.map(item => renderNavItem(item))}
        </div>
      </div>
    </nav>
  );
}
