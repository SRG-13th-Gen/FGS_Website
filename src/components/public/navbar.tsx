"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Menu, X } from "lucide-react";

import type { SchoolInfoView } from "@/lib/wordpress/sections/school-info";

/** Navigation items — each `href` targets a section id on the landing page. */
const NAV_ITEMS = [
  { label: "Home", href: "#home" },
  { label: "About Us", href: "#about" },
  { label: "Admission", href: "#admission" },
  { label: "News & Events", href: "#news" },
  { label: "Clubs", href: "#clubs" },
  { label: "Gallery", href: "#gallery" },
  { label: "Contact Us", href: "#contact" },
] as const;

export function Navbar({ schoolInfo }: { schoolInfo: SchoolInfoView }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const [activeSection, setActiveSection] = useState("#home");

  /* Add shadow and track when scrolled past the hero section. */
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
      setPastHero(window.scrollY > 250);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Track which section is currently in view via IntersectionObserver. */
  useEffect(() => {
    const ids = NAV_ITEMS.map((item) => item.href.slice(1));
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(`#${entry.target.id}`);
          }
        }
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 },
    );

    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  const handleNavClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      e.preventDefault();
      const el = document.getElementById(href.slice(1));
      if (el) {
        const reduceMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;
        el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
        window.history.replaceState(null, "", href);
        setActiveSection(href);
      }
      setMobileOpen(false);
    },
    [],
  );

  /* Escape closes the mobile menu. */
  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  return (
    <header
      id="main-navbar"
      className={`fixed top-0 right-0 left-0 z-50 transition-shadow duration-300 ${
        scrolled ? "bg-white/95 shadow-md backdrop-blur-sm" : "bg-white"
      }`}
    >
      <a
        href="#main-content"
        className="sr-only rounded-md bg-white px-4 py-2 text-sm font-semibold text-school-green-dark focus:not-sr-only focus:absolute focus:top-2 focus:left-4 focus:z-50 focus-visible:ring-2 focus-visible:ring-school-green focus-visible:outline-none"
      >
        Skip to main content
      </a>
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo / School name */}
        <a
          href="#home"
          onClick={(e) => handleNavClick(e, "#home")}
          className="flex min-h-11 items-center gap-2.5 rounded-md text-lg font-normal tracking-tight focus-visible:ring-2 focus-visible:ring-school-green focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <Image
            src={schoolInfo.logo.url}
            alt={schoolInfo.logo.alt}
            width={40}
            height={40}
            className="h-10 w-10 shrink-0 object-contain"
            priority
          />
          <div
            className={`overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out ${
              pastHero || (activeSection !== "#home" && scrolled)
                ? "max-w-[260px] translate-x-0 opacity-100"
                : "max-w-0 -translate-x-2 opacity-0"
            }`}
          >
            <span className="hidden sm:inline">{schoolInfo.schoolName}</span>
            <span className="sm:hidden">{schoolInfo.shortName}</span>
          </div>
        </a>

        {/* Desktop nav links */}
        <ul className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                aria-current={
                  activeSection === item.href ? "location" : undefined
                }
                className={`relative inline-flex min-h-11 items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-school-green-dark focus-visible:ring-2 focus-visible:ring-school-green focus-visible:outline-none ${
                  activeSection === item.href
                    ? "text-school-green-dark"
                    : "text-foreground/70"
                }`}
              >
                {item.label}
                {/* Active indicator underline */}
                <span
                  className={`absolute bottom-0 left-1/2 h-0.5 -translate-x-1/2 rounded-full bg-school-green transition-all duration-300 ${
                    activeSection === item.href ? "w-4/5" : "w-0"
                  }`}
                />
              </a>
            </li>
          ))}
        </ul>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-md text-foreground/70 transition-colors hover:bg-school-green-light hover:text-school-green-dark focus-visible:ring-2 focus-visible:ring-school-green focus-visible:outline-none md:hidden"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
        >
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </nav>

      {/* Mobile slide-down menu */}
      <div
        id="mobile-menu"
        inert={!mobileOpen}
        className={`overflow-hidden border-b border-border/50 bg-white transition-all duration-300 ease-in-out md:hidden ${
          mobileOpen
            ? "max-h-[28rem] opacity-100"
            : "invisible max-h-0 border-transparent opacity-0"
        }`}
      >
        <ul className="space-y-1 px-4 pt-2 pb-4">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                aria-current={
                  activeSection === item.href ? "location" : undefined
                }
                className={`block rounded-lg px-4 py-3 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-school-green focus-visible:outline-none ${
                  activeSection === item.href
                    ? "bg-school-green-light text-school-green-dark"
                    : "text-foreground/70 hover:bg-muted hover:text-foreground"
                }`}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
