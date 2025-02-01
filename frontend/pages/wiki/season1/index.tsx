import { NextPage } from 'next';
import { WikiLayout } from '@/components/wiki/WikiLayout';
import { Header } from '@/components/wiki/elements/Header';
import { SubHeader } from '@/components/wiki/elements/SubHeader';
import { InfoBox } from '@/components/wiki/elements/InfoBox';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface NavLink {
  title: string;
  id: string;
  subSections: NavLink[];
}

const SeasonSidebar = () => {
  const [activeSection, setActiveSection] = useState<string>('');
  const [links, setLinks] = useState<NavLink[]>([]);

  useEffect(() => {
    // Generate links by scanning the DOM for sections
    const generateLinks = () => {
      const sections = document.querySelectorAll('[data-section]');
      const newLinks: NavLink[] = [];

      sections.forEach((section) => {
        const id = section.id;
        // Find the header element within the section
        const headerElement = section.querySelector('h1, h2');
        if (headerElement && id) {
          newLinks.push({
            title: headerElement.textContent || '',
            id: id,
            subSections: []
          });
        }
      });

      setLinks(newLinks);
    };

    generateLinks();

    // Set up intersection observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.5 }
    );

    document.querySelectorAll('[data-section]').forEach((section) => {
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-64 sticky top-[64px] h-[calc(100vh-64px)] bg-background border-r border-default-200 p-4 overflow-y-auto">
      <nav className="space-y-2">
        {links.map((link) => (
          <div key={link.id}>
            <button
              onClick={() => scrollToSection(link.id)}
              className={`block w-full text-left px-4 py-2 rounded hover:bg-default-100 ${
                activeSection === link.id ? 'bg-default-100 font-medium' : ''
              }`}
            >
              {link.title}
            </button>
            {link.subSections.map((sub) => (
              <button
                key={sub.id}
                onClick={() => scrollToSection(sub.id)}
                className={`block w-full text-left px-6 py-1 text-sm rounded hover:bg-default-100 ${
                  activeSection === sub.id ? 'bg-default-100 font-medium' : ''
                }`}
              >
                {sub.title}
              </button>
            ))}
          </div>
        ))}
      </nav>
    </div>
  );
};

const Season1: NextPage = () => {
  return (
    <WikiLayout>
      <div className="flex">
        <SeasonSidebar />
        <div className="flex-1 max-w-4xl mx-auto px-8 overflow-y-auto">
          <div data-section id="overview">
            <Header>Season 1</Header>
            
            <div className="prose max-w-none">
              <p className="text-xl mb-8">
                Welcome to Season 1, where our journey begins. This inaugural season sets the foundation
                for the epic adventures that follow, introducing key characters and establishing the core narrative.
              </p>

              <InfoBox title="Season Overview">
                <ul className="list-none space-y-2">
                  <li><strong>Episodes:</strong> 12</li>
                  <li><strong>Originally Aired:</strong> 2023</li>
                  <li><strong>Main Story Arc:</strong> The Beginning</li>
                </ul>
              </InfoBox>
            </div>
          </div>

          <div data-section id="key-episodes">
            <SubHeader>Key Episodes</SubHeader>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="border p-4 rounded-lg">
                <h3 className="text-xl font-medium mb-2">Episode 1: Pilot</h3>
                <p>The episode that started it all, introducing our main characters and setting up the world.</p>
              </div>
              <div className="border p-4 rounded-lg">
                <h3 className="text-xl font-medium mb-2">Episode 6: Mid-Season</h3>
                <p>A pivotal episode that changes everything and raises the stakes.</p>
              </div>
              <div className="border p-4 rounded-lg">
                <h3 className="text-xl font-medium mb-2">Episode 12: Finale</h3>
                <p>The season finale that brings everything together and sets up Season 2.</p>
              </div>
            </div>
          </div>

          <div data-section id="major-plot-points">
            <SubHeader>Major Plot Points</SubHeader>
            <ul className="list-disc pl-6 space-y-2">
              <li>Introduction of the main characters and their relationships</li>
              <li>Discovery of the central conflict</li>
              <li>Development of key story arcs</li>
              <li>Setup for future seasons</li>
            </ul>

            <div className="mt-8">
              <Link 
                href="/wiki/season2" 
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Continue to Season 2 →
              </Link>
            </div>
            <div data-section id="season-2">
              <Header>Season 2</Header>
              <p>Season 2 is the second season of CORE Game. It is a continuation of the story from Season 1 and introduces new characters and plot points.</p>

              <Link 
                href="/wiki/season2" 
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Continue to Season 2 →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </WikiLayout>
  );
};

export default Season1;
