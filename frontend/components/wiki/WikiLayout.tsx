import { FC, ReactNode } from 'react';
import DefaultLayout from '@/layouts/default';
import { wikiStructure } from '@/config/wiki';


interface WikiLayoutProps {
  children: ReactNode;
}

export const WikiLayout: FC<WikiLayoutProps> = ({ children }) => {
  return (
    <DefaultLayout>
      <div className="flex h-[calc(100vh-64px)]">
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};