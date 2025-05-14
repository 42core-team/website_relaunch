"use client";

import type { NavbarProps } from "@heroui/react";

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
  cn,
  Avatar,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import { usePathname } from "next/navigation";
import { ThemeSwitch } from "@/components/theme-switch";
import GithubLoginButton from "@/components/github";
import router from "next/router";
import { signOut, useSession } from "next-auth/react";

const BasicNavbar = React.forwardRef<HTMLElement, NavbarProps>(
  ({ classNames = {}, ...props }, ref) => {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const pathname = usePathname();
    const session = useSession();

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
            <span className="ml-2 text-small font-medium text-default-foreground">
              CORE
            </span>
          </Link>
        </NavbarBrand>

        {/* Center Content */}
        <NavbarContent justify="center">
          <NavbarItem>
            <Link
              className={cn("text-default-500", {
                "font-bold text-default-foreground": pathname === "/",
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
                "font-bold text-default-foreground": pathname === "/events",
              })}
              href="/events"
              size="sm"
            >
              Events
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link
              className={"text-default-500"}
              href="https://wiki.coregame.de"
              size="sm"
              isExternal
              showAnchorIcon
            >
              Wiki
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link
              className={cn("text-default-500", {
                "font-bold text-default-foreground": pathname === "/about",
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
            {session.data?.user.id ? (
              <Dropdown placement="bottom-end">
                <DropdownTrigger>
                  <Avatar
                    as="button"
                    className="transition-transform"
                    size="sm"
                    src={session.data?.user.image}
                    name={(session.data.user?.name || "User")
                      .substring(0, 2)
                      .toUpperCase()}
                  ></Avatar>
                </DropdownTrigger>
                <DropdownMenu aria-label="Profile Actions" variant="flat">
                  {/* <DropdownItem key="profile" href="/profile">
                                        Profile
                                    </DropdownItem>
                                    <DropdownItem key="settings" href="/settings">
                                        Settings
                                    </DropdownItem> */}
                  <DropdownItem
                    key="logout"
                    color="danger"
                    onPress={() => {
                      signOut().then(() => {
                        router.push("/");
                      });
                    }}
                  >
                    Log Out
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            ) : (
              <GithubLoginButton />
            )}
          </NavbarItem>
        </NavbarContent>

        <NavbarMenuToggle className="text-default-400 md:hidden" />

        <NavbarMenu
          className="top-[calc(var(--navbar-height)_-_1px)] max-h-fit bg-default-200/50 pb-6 pt-6 shadow-medium backdrop-blur-md backdrop-saturate-150 dark:bg-default-100/50"
          motionProps={{
            initial: { opacity: 0, y: -20 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: -20 },
            transition: {
              ease: "easeInOut",
              duration: 0.2,
            },
          }}
        >
          <NavbarMenuItem className="mb-4">
            <Button
              fullWidth
              as={Link}
              className="bg-foreground text-background"
              href="/#"
            >
              Get Started
            </Button>
          </NavbarMenuItem>
          <NavbarMenuItem>
            <Link
              className={cn("mb-2 w-full text-default-500", {
                "font-bold text-default-foreground": pathname === "/",
              })}
              href="/"
              size="md"
            >
              Home
            </Link>
          </NavbarMenuItem>
          <NavbarMenuItem>
            <Link
              className={cn("mb-2 w-full text-default-500", {
                "font-bold text-default-foreground": pathname === "/events",
              })}
              href="/events"
              size="md"
            >
              Events
            </Link>
          </NavbarMenuItem>
          <NavbarMenuItem>
            <Link
              className={cn("mb-2 w-full text-default-500", {
                "font-bold text-default-foreground":
                  pathname === "/wiki/season1",
              })}
              href="https://wiki.coregame.de"
              size="md"
            >
              Wiki
            </Link>
          </NavbarMenuItem>
          <NavbarMenuItem>
            <Link
              className={cn("mb-2 w-full text-default-500", {
                "font-bold text-default-foreground": pathname === "/about",
              })}
              href="/about"
              size="md"
            >
              About us
            </Link>
          </NavbarMenuItem>

          {/* Theme Switch and Login/Logout in mobile menu */}
          <NavbarMenuItem className="mt-4 pt-4 border-t border-default-200 flex flex-col gap-4">
            {session.data?.user.id ? (
              <Button
                color="danger"
                variant="flat"
                fullWidth
                onPress={() => {
                  signOut().then(() => {
                    router.push("/");
                  });
                }}
              >
                Log Out
              </Button>
            ) : (
              <GithubLoginButton />
            )}
          </NavbarMenuItem>
        </NavbarMenu>
      </Navbar>
    );
  },
);

BasicNavbar.displayName = "BasicNavbar";

export default BasicNavbar;
