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
}

export interface WikiNavItem {
  title: string;
  slug: string[];
  isFile: boolean;
  children?: WikiNavItem[];
}

const contentDirectory = path.join(process.cwd(), 'content/wiki');

export async function getWikiPage(slug: string[]): Promise<WikiPage | null> {
  try {
    const filePath = getFilePathFromSlug(slug);
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
    };
  } catch (error) {
    console.error(`Error reading wiki page ${slug.join('/')}:`, error);
    return null;
  }
}

export async function getAllWikiPages(): Promise<WikiPage[]> {
  const pages: WikiPage[] = [];

  async function walkDirectory(dir: string, basePath: string[] = []): Promise<void> {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        await walkDirectory(path.join(dir, entry.name), [...basePath, entry.name]);
      } else if (entry.name.endsWith('.md')) {
        const slug = [...basePath, entry.name.replace('.md', '')];
        const page = await getWikiPage(slug);
        if (page) {
          pages.push(page);
        }
      }
    }
  }

  await walkDirectory(contentDirectory);
  return pages;
}

export async function getWikiNavigation(): Promise<WikiNavItem[]> {
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

      // Put directories before files
      if (!a.isFile && b.isFile) return -1;
      if (a.isFile && !b.isFile) return 1;

      return a.title.localeCompare(b.title);
    });
  };

  return buildNavigation(contentDirectory);
}

function getFilePathFromSlug(slug: string[]): string {
  // Handle root README
  if (slug.length === 0 || (slug.length === 1 && slug[0] === '')) {
    return path.join(contentDirectory, 'README.md');
  }

  // Try direct file path first
  const directPath = path.join(contentDirectory, ...slug) + '.md';

  // If direct path doesn't exist, try README in directory
  try {
    const fs = require('fs');
    fs.accessSync(directPath);
    return directPath;
  } catch {
    return path.join(contentDirectory, ...slug, 'README.md');
  }
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

export async function searchWikiPages(query: string): Promise<WikiPage[]> {
  const allPages = await getAllWikiPages();
  const lowercaseQuery = query.toLowerCase();

  return allPages.filter(page =>
    page.title.toLowerCase().includes(lowercaseQuery) ||
    page.content.toLowerCase().includes(lowercaseQuery)
  );
}
