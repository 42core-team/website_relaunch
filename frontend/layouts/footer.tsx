import { Link } from "@heroui/link";
import { Button } from "@heroui/button";
import { siteConfig } from "@/config/site";

export default function Footer() {
  return (
    <footer className="w-full border-t border-default-200">
      <div className="container mx-auto max-w-7xl py-12 px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo-white.svg" alt="CORE" className="w-8 h-8" />
              <span className="font-bold text-xl">CORE</span>
            </Link>
            <p className="mt-4 text-default-500">
              CORE Game is a competitive coding challenge where you design and program 
              your own bots to battle it out in a dynamic 2D arena.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold mb-4">Quick Links</h3>
            <div className="flex flex-col gap-2">
              <Link href="/" className="text-default-500 hover:text-primary">Home</Link>
              <Link href="/about" className="text-default-500 hover:text-primary">About</Link>
              <Link href="https://wiki.coregame.de" 
                className="text-default-500 hover:text-primary">
                Documentation
              </Link>
            </div>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="font-bold mb-4">Connect</h3>
            <div className="flex flex-col gap-2">
              <Link 
                href={siteConfig.links.github} 
                isExternal
                className="text-default-500 hover:text-primary"
              >
                GitHub
              </Link>
              <Button
                className="max-w-fit px-4 mt-2"
                color="primary"
                variant="flat"
                size="sm"
                as={Link}
                href="https://wiki.coregame.de"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t border-default-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-default-500 text-sm">
              © 2024 CORE Game. All rights reserved.
            </p>
            <div className="flex gap-4 text-sm">
              <Link href="https://github.com/42core-team/core/blob/dev/LICENSE" className="text-default-500 hover:text-primary">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 