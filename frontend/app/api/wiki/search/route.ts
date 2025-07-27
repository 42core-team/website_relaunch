import { NextRequest, NextResponse } from 'next/server';
import { searchWikiPages } from '@/lib/markdown';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const version = searchParams.get('version') || 'latest';

  if (!query) {
    return NextResponse.json([]);
  }

  try {
    const results = await searchWikiPages(query, version);
    return NextResponse.json(results);
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json([], { status: 500 });
  }
}
