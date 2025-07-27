import { promises as fs } from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkHtml from 'remark-html';

export interface WikiPage {
  slug: string[];
  title: string;
  content: string;
  frontmatter: { [key: string]: any };
  lastModified: Date;
  version?: string;
}

export interface WikiNavItem {
  title: string;
  slug: string[];
  isFile: boolean;
  children?: WikiNavItem[];
}

export interface WikiVersion {
  name: string;
  slug: string;
  isDefault?: boolean;
}

const contentDirectory = path.join(process.cwd(), 'content/wiki');

// Configuration for the default version - change this to set which folder is the default
const DEFAULT_VERSION_FOLDER = 'latest'; // Change this to your desired default folder name

async function getDefaultVersion(): Promise<string> {
  const versions = await getAvailableVersions();
  const defaultVersion = versions.find(v => v.isDefault);
  return defaultVersion ? defaultVersion.slug : DEFAULT_VERSION_FOLDER;
}

export async function getAvailableVersions(): Promise<WikiVersion[]> {
  try {
    const entries = await fs.readdir(contentDirectory, { withFileTypes: true });
    const versions: WikiVersion[] = [];

    // Add directories as versions (no more root-level files handling)
    for (const entry of entries) {
      if (entry.isDirectory() && !entry.name.startsWith('.') &&
          entry.name !== 'images' && entry.name !== 'assets') {
        versions.push({
          name: formatVersionName(entry.name),
          slug: entry.name,
          isDefault: entry.name === DEFAULT_VERSION_FOLDER,
        });
      }
    }

    return versions.sort((a, b) => {
      if (a.isDefault) return -1;
      if (b.isDefault) return 1;
      return a.name.localeCompare(b.name);
    });
  } catch (error) {
    console.error('Error reading versions:', error);
    return [];
  }
}export async function getWikiPageWithVersion(slug: string[], version?: string): Promise<WikiPage | null> {
  try {
    const filePath = await getFilePathFromSlugWithVersion(slug, version);
    const fileContent = await fs.readFile(filePath, 'utf8');
    const { data, content } = matter(fileContent);

    // Process markdown content with a simpler approach
    const processedContent = await remark()
      .use(remarkGfm)
      .use(remarkHtml, { sanitize: false })
      .process(content);

    // Post-process the HTML to add IDs to headings
    let htmlContent = processedContent.toString();

    // Simple regex to add IDs to headings
    htmlContent = htmlContent.replace(/<h([1-6])>(.*?)<\/h[1-6]>/g, (match, level, text) => {
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .trim();
      return `<h${level} id="${id}"><a href="#${id}" class="heading-anchor">${text}</a></h${level}>`;
    });

    const stats = await fs.stat(filePath);

    return {
      slug,
      title: data.title || getTitleFromSlug(slug),
      content: htmlContent,
      frontmatter: data,
      lastModified: stats.mtime,
      version,
    };
  } catch (error) {
    console.error(`Error reading wiki page ${slug?.join('/') || 'unknown'} for version ${version}:`, error);
    return null;
  }
}

export async function getWikiNavigationWithVersion(version?: string): Promise<WikiNavItem[]> {
  // Get the default version if none specified
  const actualVersion = version || (await getDefaultVersion());
  const versionDir = path.join(contentDirectory, actualVersion);

  const buildNavigation = async (dir: string, basePath: string[] = []): Promise<WikiNavItem[]> => {
    const items: WikiNavItem[] = [];

    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.name.startsWith('.') || entry.name === 'index.html' || entry.name === 'script.js' || entry.name === 'style.css' || entry.name === 'favicon.ico') {
          continue;
        }

        if (entry.isDirectory()) {
          const children = await buildNavigation(path.join(dir, entry.name), [...basePath, entry.name]);
          items.push({
            title: formatTitle(entry.name),
            slug: [...basePath, entry.name],
            isFile: false,
            children: children.length > 0 ? children : undefined,
          });
        } else if (entry.name.endsWith('.md')) {
          const slug = [...basePath, entry.name.replace('.md', '')];
          items.push({
            title: formatTitle(entry.name.replace('.md', '')),
            slug,
            isFile: true,
          });
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${dir}:`, error);
    }

    return items.sort((a, b) => {
      // Put README files first
      if (a.title.toLowerCase().includes('readme') && !b.title.toLowerCase().includes('readme')) return -1;
      if (!a.title.toLowerCase().includes('readme') && b.title.toLowerCase().includes('readme')) return 1;

      // Put files before directories
      if (a.isFile && !b.isFile) return -1;
      if (!a.isFile && b.isFile) return 1;

      return a.title.localeCompare(b.title);
    });
  };

  return buildNavigation(versionDir);
}

export async function getAllWikiPages(): Promise<WikiPage[]> {
  const defaultVersion = await getDefaultVersion();
  return getAllWikiPagesForVersion(defaultVersion);
}

// Legacy function for backward compatibility
export async function getWikiPage(slug: string[]): Promise<WikiPage | null> {
  const defaultVersion = await getDefaultVersion();
  return getWikiPageWithVersion(slug, defaultVersion);
}

// Legacy function for backward compatibility
export async function getWikiNavigation(): Promise<WikiNavItem[]> {
  const defaultVersion = await getDefaultVersion();
  return getWikiNavigationWithVersion(defaultVersion);
}

async function getFilePathFromSlugWithVersion(slug: string[], version?: string): Promise<string> {
  // Get the default version if none specified
  const actualVersion = version || (await getDefaultVersion());
  const versionDir = path.join(contentDirectory, actualVersion);

  // Handle root README
  if (slug.length === 0 || (slug.length === 1 && slug[0] === '')) {
    return path.join(versionDir, 'README.md');
  }

  // Try direct file path first
  const directPath = path.join(versionDir, ...slug) + '.md';

  // Check if direct path exists
  try {
    await fs.access(directPath);
    return directPath;
  } catch {
    // If direct path doesn't exist, try README in directory
    return path.join(versionDir, ...slug, 'README.md');
  }
}async function getFilePathFromSlug(slug: string[]): Promise<string> {
  return getFilePathFromSlugWithVersion(slug, 'latest');
}

function formatVersionName(slug: string): string {
  // Handle special version naming
  if (slug.toLowerCase().includes('season')) {
    return slug.replace(/([a-z])(\d)/, '$1 $2').replace(/^./, c => c.toUpperCase());
  }
  if (slug.toLowerCase().includes('rush')) {
    return slug.replace(/([a-z])(\d)/, '$1 $2').replace(/^./, c => c.toUpperCase());
  }

  // Convert kebab-case or snake_case to Title Case
  return slug
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
}

function getTitleFromSlug(slug: string[]): string {
  if (slug.length === 0) return 'Home';
  const lastSegment = slug[slug.length - 1];
  return formatTitle(lastSegment);
}

function formatTitle(name: string): string {
  // Handle special cases
  if (name.toLowerCase() === 'readme') return 'Overview';
  if (name.toLowerCase() === 'api-reference') return 'API Reference';
  if (name.toLowerCase() === 'faq') return 'FAQ';

  // Convert kebab-case or snake_case to Title Case
  return name
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
}

export async function searchWikiPages(query: string, version?: string): Promise<WikiPage[]> {
  const allPages = await getAllWikiPagesForVersion(version);
  const lowercaseQuery = query.toLowerCase();

  return allPages.filter(page =>
    page.title.toLowerCase().includes(lowercaseQuery) ||
    page.content.toLowerCase().includes(lowercaseQuery)
  );
}

export async function getAllWikiPagesForVersion(version?: string): Promise<WikiPage[]> {
  const pages: WikiPage[] = [];
  const versionDir = version && version !== 'latest'
    ? path.join(contentDirectory, version)
    : contentDirectory;

  async function walkDirectory(dir: string, basePath: string[] = []): Promise<void> {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isDirectory()) {
          // Skip version directories when we're in the root and looking at latest
          if (basePath.length === 0 && version === 'latest') {
            const versions = await getAvailableVersions();
            if (versions.some(v => v.slug === entry.name && !v.isDefault)) {
              continue;
            }
          }
          await walkDirectory(path.join(dir, entry.name), [...basePath, entry.name]);
        } else if (entry.name.endsWith('.md')) {
          const slug = [...basePath, entry.name.replace('.md', '')];
          const page = await getWikiPageWithVersion(slug, version);
          if (page) {
            pages.push(page);
          }
        }
      }
    } catch (error) {
      console.error(`Error walking directory ${dir}:`, error);
    }
  }

  await walkDirectory(versionDir);
  return pages;
}
