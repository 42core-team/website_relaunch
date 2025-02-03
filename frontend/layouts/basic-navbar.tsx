"use client";

import type {NavbarProps} from "@heroui/react";

import React from "react";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
  Link,
  Button,
  Divider,
  cn,
} from "@heroui/react";
import {Icon} from "@iconify/react";

import { CoreLogoWhite} from "../components/social";
import { ThemeSwitch } from "@/components/theme-switch";

const menuItems = [
  "About",
  "Blog",
  "Customers",
  "Pricing",
  "Enterprise",
  "Changelog",
  "Documentation",
  "Contact Us",
];

const BasicNavbar = React.forwardRef<HTMLElement, NavbarProps>(
  ({classNames = {}, ...props}, ref) => {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';

    return (
      <Navbar
        ref={ref}
        {...props}
        classNames={{
          base: cn("border-default-100 bg-transparent", {
            "bg-default-200/50 dark:bg-default-100/50": isMenuOpen,
          }),
          wrapper: "w-full justify-center",
          item: "hidden md:flex",
          ...classNames,
        }}
        height="60px"
        isMenuOpen={isMenuOpen}
        onMenuOpenChange={setIsMenuOpen}
      >
        {/* Left Content */}
        <NavbarBrand>
          <Link href="/">
            <img src="/logo-white.svg" alt="CORE" className="w-10 h-10" />
            <span className="ml-2 text-small font-medium text-default-foreground">CORE</span>
          </Link>
        </NavbarBrand>

        {/* Center Content */}
        <NavbarContent justify="center">
          <NavbarItem>
            <Link 
              className={cn("text-default-500", {
                "font-bold text-default-foreground": pathname === "/"
              })} 
              href="/" 
              size="sm"
            >
              Home
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link 
              className={cn("text-default-500", {
                "font-bold text-default-foreground": pathname === "/wiki/season1"
              })} 
              href="https://wiki.coregame.de" 
              size="sm"
            >
              Wiki
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link 
              className={cn("text-default-500", {
                "font-bold text-default-foreground": pathname === "/about"
              })} 
              href="/about" 
              size="sm"
            >
              About Us
            </Link>
          </NavbarItem>
        </NavbarContent>

        {/* Right Content */}
        <NavbarContent className="hidden md:flex" justify="end">
          <NavbarItem className="ml-2 !flex gap-2">
            <ThemeSwitch />
            <Button
              className="bg-default-foreground font-medium text-background"
              color="secondary"
              endContent={<Icon icon="solar:alt-arrow-right-linear" />}
              radius="full"
              variant="flat"
              onClick={() => window.open("https://wiki.coregame.de", "_blank")}
            >
              Get Started
            </Button>
          </NavbarItem>
        </NavbarContent>

        <NavbarMenuToggle className="text-default-400 md:hidden" />

        <NavbarMenu
          className="top-[calc(var(--navbar-height)_-_1px)] max-h-fit bg-default-200/50 pb-6 pt-6 shadow-medium backdrop-blur-md backdrop-saturate-150 dark:bg-default-100/50"
          motionProps={{
            initial: {opacity: 0, y: -20},
            animate: {opacity: 1, y: 0},
            exit: {opacity: 0, y: -20},
            transition: {
              ease: "easeInOut",
              duration: 0.2,
            },
          }}
        >
          <NavbarMenuItem className="mb-4">
            <Button fullWidth as={Link} className="bg-foreground text-background" href="/#">
              Get Started
            </Button>
          </NavbarMenuItem>
          {menuItems.map((item, index) => (
            <NavbarMenuItem key={`${item}-${index}`}>
              <Link className="mb-2 w-full text-default-500" href="#" size="md">
                {item}
              </Link>
              {index < menuItems.length - 1 && <Divider className="opacity-50" />}
            </NavbarMenuItem>
          ))}
        </NavbarMenu>
      </Navbar>
    );
  },
);

BasicNavbar.displayName = "BasicNavbar";

export default BasicNavbar;
