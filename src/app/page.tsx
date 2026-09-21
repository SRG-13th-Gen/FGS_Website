import Image from "next/image";
import { CheckCircle2 } from "lucide-react";

import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";
import { NewsSection } from "@/components/public/news-section";
import { ClubsSection } from "@/components/public/clubs-section";
import { GallerySection } from "@/components/public/gallery-section";
import { getPublishedArticles } from "@/lib/wordpress/reads";
import {
  aboutContent,
  admissionContent,
  clubsContent,
  contactContent,
  galleryContent,
  heroContent,
  schoolInfoContent,
} from "@/lib/wordpress/sections/content";
import { SECTION_ICON_OPTIONS } from "@/lib/wordpress/sections/icons";

export default async function Home() {
  const [
    articlesResult,
    hero,
    schoolInfo,
    about,
    admission,
    contact,
    clubs,
    gallery,
  ] = await Promise.all([
    getPublishedArticles(),
    heroContent.get(),
    schoolInfoContent.get(),
    aboutContent.get(),
    admissionContent.get(),
    contactContent.get(),
    clubsContent.get(),
    galleryContent.get(),
  ]);

  return (
    <>
      <Navbar schoolInfo={schoolInfo} />

      <main>
        {/* ───────────────────── HERO ───────────────────── */}
        <section
          id="home"
          className="relative flex min-h-svh items-center justify-center overflow-hidden"
        >
          {/* Background image */}
          <Image
            src={hero.backgroundImage.url}
            alt={hero.backgroundImage.alt}
            fill
            className="object-cover"
            priority
            quality={85}
          />

          {/* Dark overlay for text contrast */}
          <div className="absolute inset-0 bg-black/40" />

          {/* Centered content */}
          <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
            <h1 className="text-4xl leading-tight font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
              {hero.heading.split("\n").map((line, index, lines) => (
                <span key={index}>
                  {line}
                  {index < lines.length - 1 && <br />}
                </span>
              ))}
            </h1>

            {/* Green divider */}
            <div className="mx-auto mt-6 h-1 w-32 rounded-full bg-school-green sm:w-40" />

            <p className="mt-6 text-lg text-white/90 italic sm:text-xl md:text-2xl">
              {hero.tagline}
            </p>
          </div>
        </section>

        {/* ───────────────────── MONTESSORI QUOTE ───────────────────── */}
        <section className="bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
            <blockquote className="text-lg leading-relaxed text-neutral-700 italic sm:text-xl md:text-2xl">
              &ldquo;{about.quote.text}&rdquo;
            </blockquote>
            <cite className="mt-4 block text-sm font-normal text-neutral-500 not-italic sm:text-base">
              ~ {about.quote.author} ~
            </cite>
          </div>
        </section>

        {/* ───────────────────── CLASSROOM FEATURE BANNER ───────────────────── */}
        <section className="relative flex min-h-[460px] items-center overflow-hidden sm:min-h-[520px] lg:min-h-[580px]">
          {/* Background image */}
          <Image
            src={about.featureBanner.image.url}
            alt={about.featureBanner.image.alt}
            fill
            className="object-cover object-center"
            quality={90}
          />

          {/* Gradient overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/30" />

          {/* Content */}
          <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
            <div className="max-w-2xl">
              <h2 className="text-3xl leading-tight font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
                {about.featureBanner.heading}
              </h2>
              <p className="mt-6 text-base leading-relaxed text-white/90 sm:max-w-xl sm:text-lg">
                {about.featureBanner.body}
              </p>
            </div>
          </div>
        </section>

        {/* ───────────────────── ABOUT US ───────────────────── */}
        <section id="about" className="bg-white py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <div className="mx-auto max-w-3xl text-center">
              <span className="text-sm font-semibold tracking-widest text-school-green uppercase">
                {about.sectionLabel}
              </span>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
                {about.heading}
              </h2>
              <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-school-green" />
            </div>

            {/* Two-Column Story Paragraphs, auto-balanced */}
            <div className="mt-14 grid gap-8 text-base leading-relaxed text-neutral-600 md:grid-cols-2 lg:gap-12">
              {[
                about.storyParagraphs.slice(
                  0,
                  Math.ceil(about.storyParagraphs.length / 2),
                ),
                about.storyParagraphs.slice(
                  Math.ceil(about.storyParagraphs.length / 2),
                ),
              ].map((column, columnIndex) => (
                <div key={columnIndex} className="space-y-6">
                  {column.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              ))}
            </div>

            {/* Mission & Vision Cards */}
            <div className="mt-16 grid gap-8 md:grid-cols-2">
              {/* Mission */}
              <div className="relative overflow-hidden rounded-2xl border border-school-green/25 bg-gradient-to-br from-school-green/15 via-school-green/[0.07] to-white/60 p-8 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-school-green/40 hover:shadow-lg sm:p-10">
                <div className="flex items-center justify-center gap-3">
                  <h3 className="text-2xl font-bold tracking-tight text-school-green-dark">
                    Our Mission
                  </h3>
                </div>
                <p className="mt-5 text-base leading-relaxed text-neutral-700 sm:text-lg">
                  {about.mission}
                </p>
              </div>

              {/* Vision */}
              <div className="relative overflow-hidden rounded-2xl border border-school-yellow/50 bg-gradient-to-br from-school-yellow/25 via-school-yellow/[0.12] to-white/60 p-8 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-school-yellow/70 hover:shadow-lg sm:p-10">
                <div className="flex items-center justify-center gap-3">
                  <h3 className="text-2xl font-bold tracking-tight text-amber-900">
                    Our Vision
                  </h3>
                </div>
                <p className="mt-5 text-base leading-relaxed text-neutral-700 sm:text-lg">
                  {about.vision}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ───────────────────── ADMISSION ───────────────────── */}
        <section
          id="admission"
          className="relative overflow-hidden py-20 lg:py-28"
        >
          {/* Background image */}
          <Image
            src={admission.backgroundImage.url}
            alt={admission.backgroundImage.alt}
            fill
            className="object-cover object-center"
            quality={85}
          />

          {/* Light overlay for readability */}
          <div className="absolute inset-0 bg-neutral-50/90" />

          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-sm font-semibold tracking-widest text-school-green uppercase">
                {admission.sectionLabel}
              </span>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
                {admission.heading}
              </h2>
              <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-school-green" />
              <p className="mt-4 text-neutral-600">{admission.intro}</p>
            </div>

            {/* Programs offered */}
            <div className="mx-auto mt-14 grid max-w-3xl gap-6 sm:grid-cols-2">
              {admission.programs.map((program, index) => {
                const Icon = SECTION_ICON_OPTIONS[program.icon];
                // Static class strings so Tailwind's scanner can see them —
                // dynamic `text-${accent}` interpolation would not be generated.
                const iconClass =
                  index % 2 === 0
                    ? "h-10 w-10 text-school-green"
                    : "h-10 w-10 text-amber-500";
                const levelClass =
                  index % 2 === 0
                    ? "mt-1 text-sm font-medium text-school-green"
                    : "mt-1 text-sm font-medium text-amber-500";
                return (
                  <div
                    key={program.name}
                    className="group rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-school-green/40 hover:shadow-md"
                  >
                    <div className="mx-auto flex h-14 w-14 items-center justify-center transition-transform duration-300 group-hover:scale-110">
                      <Icon className={iconClass} strokeWidth={2.2} />
                    </div>
                    <h3 className="mt-4 text-xl font-bold text-neutral-900">
                      {program.name}
                    </h3>
                    <p className={levelClass}>{program.levelLabel}</p>
                    <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                      {program.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Requirements List */}
            <div className="mt-20">
              <div className="mx-auto max-w-2xl text-center">
                <h3 className="mt-3 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
                  Admission Requirements
                </h3>
                <p className="mt-2 text-sm text-neutral-600">
                  Please prepare the following documents upon application
                  according to your student category.
                </p>
              </div>

              <div className="mt-10 grid gap-6 md:grid-cols-3">
                {admission.requirementCategories.map((category, index) => (
                  <div
                    key={category.title}
                    className={`flex flex-col rounded-2xl bg-white p-6 shadow-sm transition-all hover:shadow-md ${
                      index === 1
                        ? "border-2 border-school-green/30"
                        : "border border-neutral-200"
                    }`}
                  >
                    <div className="border-b border-neutral-100 pb-4">
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                          index === 1
                            ? "bg-school-green text-white"
                            : index === 2
                              ? "bg-school-yellow/30 text-neutral-800"
                              : "bg-school-green/10 text-school-green"
                        }`}
                      >
                        {category.badgeLabel}
                      </span>
                      <h4 className="mt-2 text-lg font-bold text-neutral-900">
                        {category.title}
                      </h4>
                    </div>
                    <ul className="mt-5 flex-1 space-y-3.5 text-sm text-neutral-700">
                      {category.items.map((item) => (
                        <li key={item} className="flex items-start gap-2.5">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-school-green" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Enrollment steps */}
            <div className="mt-20">
              <h3 className="mb-8 text-center text-xl font-bold text-neutral-900">
                Enrollment Process
              </h3>
              <div className="grid gap-6 md:grid-cols-3">
                {admission.enrollmentSteps.map((item, index) => (
                  <div
                    key={item.title}
                    className="relative rounded-2xl border border-neutral-200 bg-white p-6 pl-8 shadow-sm"
                  >
                    <span className="absolute top-6 left-0 flex h-12 w-1 rounded-r-full bg-school-green" />
                    <span className="text-3xl font-black text-school-green/20">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h4 className="mt-1 text-base font-semibold text-neutral-900">
                      {item.title}
                    </h4>
                    <p className="mt-2 text-sm text-neutral-600">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ───────────────────── NEWS & EVENTS ───────────────────── */}
        <NewsSection result={articlesResult} />

        {/* ───────────────────── CLUBS ───────────────────── */}
        <ClubsSection content={clubs} />

        {/* ───────────────────── GALLERY ───────────────────── */}
        <GallerySection content={gallery} />

        {/* ───────────────────── CONTACT US ───────────────────── */}
        <section
          id="contact"
          className="bg-gradient-to-br from-school-green via-school-green-dark to-school-green py-20 lg:py-28"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-sm font-semibold tracking-widest text-school-yellow uppercase">
                {contact.sectionLabel}
              </span>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                {contact.heading}
              </h2>
              <p className="mt-4 text-white/70">{contact.intro}</p>
            </div>

            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {contact.cards.map((card) => {
                const Icon = SECTION_ICON_OPTIONS[card.icon];
                return (
                  <div
                    key={card.title}
                    className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-sm transition-colors hover:bg-white/10"
                  >
                    <div className="mx-auto mb-4 inline-flex rounded-xl bg-school-yellow/20 p-3">
                      <Icon className="h-6 w-6 text-school-yellow" />
                    </div>
                    <h3 className="text-base font-semibold text-white">
                      {card.title}
                    </h3>
                    <p className="mt-2 text-sm text-white/80">{card.detail}</p>
                    <p className="mt-1 text-xs text-white/50">{card.sub}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <Footer schoolInfo={schoolInfo} />
    </>
  );
}
