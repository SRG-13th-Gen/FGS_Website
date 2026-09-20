import Image from "next/image";
import { Mail, MapPin, Phone } from "lucide-react";

import type { SchoolInfoView } from "@/lib/wordpress/sections/school-info";

export function Footer({ schoolInfo }: { schoolInfo: SchoolInfoView }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/50 bg-foreground text-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Image
                src={schoolInfo.logo.url}
                alt={schoolInfo.logo.alt}
                width={36}
                height={36}
                className="h-9 w-9 object-contain"
              />
              <span className="text-lg font-bold">{schoolInfo.schoolName}</span>
            </div>
            <p className="text-sm leading-relaxed text-background/60">
              {schoolInfo.footerTagline}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold tracking-wider text-school-yellow uppercase">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm text-background/60">
              <li>
                <a
                  href="#about"
                  className="transition-colors hover:text-school-green"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="#admission"
                  className="transition-colors hover:text-school-green"
                >
                  Admission
                </a>
              </li>
              <li>
                <a
                  href="#news"
                  className="transition-colors hover:text-school-green"
                >
                  News &amp; Events
                </a>
              </li>
              <li>
                <a
                  href="#clubs"
                  className="transition-colors hover:text-school-green"
                >
                  Clubs
                </a>
              </li>
            </ul>
          </div>

          {/* Programs */}
          <div>
            <h3 className="mb-4 text-sm font-semibold tracking-wider text-school-yellow uppercase">
              Programs
            </h3>
            <ul className="space-y-2 text-sm text-background/60">
              {schoolInfo.footerPrograms.map((program) => (
                <li key={program}>{program}</li>
              ))}
            </ul>
          </div>

          {/* Contact info */}
          <div>
            <h3 className="mb-4 text-sm font-semibold tracking-wider text-school-yellow uppercase">
              Contact Us
            </h3>
            <ul className="space-y-3 text-sm text-background/60">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-school-green" />
                <span>{schoolInfo.address}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-school-green" />
                <span>{schoolInfo.phone}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-school-green" />
                <span>{schoolInfo.email}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 border-t border-background/10 pt-6 text-center text-xs text-background/40">
          <p>
            &copy; {currentYear} {schoolInfo.schoolName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
