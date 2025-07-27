import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getWikiPage, getWikiNavigation } from '@/lib/markdown';
import { WikiLayout } from '@/components/wiki/WikiLayout';
import { TableOfContents } from '@/components/wiki/TableOfContents';

interface WikiPageProps {
  params: Promise<{
    slug?: string[];
  }>;
}

export async function generateMetadata({ params }: WikiPageProps): Promise<Metadata> {
  const { slug = [] } = await params;
  const page = await getWikiPage(slug);

  if (!page) {
    return {
      title: 'Page Not Found - CORE Wiki',
    };
  }

  return {
    title: `${page.title} - CORE Wiki`,
    description: `Documentation for ${page.title}`,
  };
}

export default async function WikiPage({ params }: WikiPageProps) {
  const { slug = [] } = await params;
  const [page, navigation] = await Promise.all([
    getWikiPage(slug),
    getWikiNavigation(),
  ]);

  if (!page) {
    notFound();
  }

  return (
    <WikiLayout navigation={navigation} currentSlug={slug}>
      <div className="flex gap-8">
        <article className="prose prose-lg dark:prose-invert max-w-none flex-1">
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">
              {page.title}
            </h1>
            <div className="text-sm text-default-500">
              Last updated: {page.lastModified.toLocaleDateString()}
            </div>
          </header>
          
          <div
            className="wiki-content"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        </article>
        
        <aside className="w-64 flex-shrink-0">
          <TableOfContents content={page.content} />
        </aside>
      </div>
    </WikiLayout>
  );
}
