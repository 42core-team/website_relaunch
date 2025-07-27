import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getWikiPageWithVersion, getWikiNavigationWithVersion, getAvailableVersions } from '@/lib/markdown';
import { WikiLayout } from '@/components/wiki/WikiLayout';

interface WikiPageProps {
  params: Promise<{
    slug?: string[];
  }>;
}

async function parseSlugForVersion(slug: string[]) {
  // Check if first segment is a version
  if (slug.length === 0) {
    return { version: 'latest', pagePath: [] };
  }

  // Get available versions to check against
  const versions = await getAvailableVersions();
  const possibleVersion = slug[0];

  // Check if the first segment matches any available version
  const isVersion = versions.some(v => v.slug === possibleVersion);

  if (isVersion) {
    return {
      version: possibleVersion,
      pagePath: slug.slice(1)
    };
  }

  return {
    version: 'latest',
    pagePath: slug
  };
}

export async function generateMetadata({ params }: WikiPageProps): Promise<Metadata> {
  const { slug = [] } = await params;
  const { version, pagePath } = await parseSlugForVersion(slug);
  const page = await getWikiPageWithVersion(pagePath, version);

  if (!page) {
    return {
      title: 'Page Not Found - CORE Wiki',
    };
  }

  const versionSuffix = version !== 'latest' ? ` (${version})` : '';
  return {
    title: `${page.title}${versionSuffix} - CORE Wiki`,
    description: `Documentation for ${page.title}`,
  };
}

export default async function WikiPage({ params }: WikiPageProps) {
  const { slug = [] } = await params;
  const { version, pagePath } = await parseSlugForVersion(slug);

  const [page, navigation, versions] = await Promise.all([
    getWikiPageWithVersion(pagePath, version),
    getWikiNavigationWithVersion(version),
    getAvailableVersions(),
  ]);

  // If page doesn't exist and we have a specific path, try to fallback
  if (!page && pagePath.length > 0) {
    // Try to get the version home page instead
    const homePage = await getWikiPageWithVersion([], version);
    if (homePage) {
      return (
        <WikiLayout
          navigation={navigation}
          currentSlug={slug}
          versions={versions}
          currentVersion={version}
          pageContent={homePage.content}
        >
          <article className="prose prose-lg dark:prose-invert max-w-none">
            <div className="bg-warning-50 border border-warning-200 rounded-lg p-4 mb-6">
              <h3 className="text-warning-800 font-semibold mb-2">Content Not Available</h3>
              <p className="text-warning-700">
                The page <code>{pagePath.join('/')}</code> is not available in {version === 'latest' ? 'the latest version' : version}.
                Showing the home page for this version instead.
              </p>
            </div>

            <header className="mb-8">
              <h1 className="text-4xl font-bold text-foreground mb-2">
                {homePage.title}
              </h1>
              <div className="text-sm text-default-500 flex items-center gap-4">
                <span>Last updated: {homePage.lastModified.toLocaleDateString()}</span>
                {version !== 'latest' && (
                  <span className="bg-primary-100 text-primary-700 px-2 py-1 rounded text-xs font-medium">
                    {version}
                  </span>
                )}
              </div>
            </header>

            <div
              className="wiki-content"
              dangerouslySetInnerHTML={{ __html: homePage.content }}
            />
          </article>
        </WikiLayout>
      );
    }
  }

  if (!page) {
    notFound();
  }

  return (
    <WikiLayout
      navigation={navigation}
      currentSlug={slug}
      versions={versions}
      currentVersion={version}
      pageContent={page.content}
    >
      <article className="prose prose-lg dark:prose-invert max-w-none">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            {page.title}
          </h1>
          <div className="text-sm text-default-500 flex items-center gap-4">
            <span>Last updated: {page.lastModified.toLocaleDateString()}</span>
            {version !== 'latest' && (
              <span className="bg-primary-100 text-primary-700 px-2 py-1 rounded text-xs font-medium">
                {version}
              </span>
            )}
          </div>
        </header>

        <div
          className="wiki-content"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </article>
    </WikiLayout>
  );
}
