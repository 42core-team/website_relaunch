'use client';

import React from 'react';
import { WikiNavigation } from './WikiNavigation';
import { WikiSearch } from './WikiSearch';
import { VersionSelector } from './VersionSelector';
import { WikiNavItem, WikiVersion } from '@/lib/markdown';

interface WikiLayoutProps {
  children: React.ReactNode;
  navigation: WikiNavItem[];
  currentSlug: string[];
  versions?: WikiVersion[];
  currentVersion?: string;
  pageContent?: string; // Add page content for table of contents
}

export function WikiLayout({ children, navigation, currentSlug, versions = [], currentVersion = 'latest', pageContent }: WikiLayoutProps) {
  return (
    <div className="flex bg-background">
      {/* Sidebar Navigation */}
      <div className="w-64 h-[calc(100vh-60px)] sticky top-[60px] flex-shrink-0 z-0">
        <WikiNavigation
          items={navigation}
          currentSlug={currentSlug}
          currentVersion={currentVersion}
          pageContent={pageContent}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Header with Search and Version Selector */}
        <header className="border-b border-divider bg-content1 p-4 shadow-sm sticky top-[60px] z-40">
          <div className="flex items-center justify-between gap-4">
            <div className="max-w-md flex-1">
              <WikiSearch currentVersion={currentVersion} />
            </div>
            {versions.length > 1 && (
              <VersionSelector versions={versions} currentVersion={currentVersion} />
            )}
          </div>
        </header>

        {/* Content Area */}
        <main className="p-6 bg-background">
          <div className="max-w-4xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
