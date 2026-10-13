export const dynamic = "force-dynamic";

import Image from "next/image";
import { CheckCircle2, Compass, Lightbulb, Check } from "lucide-react";

import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";
import { Reveal } from "@/components/public/reveal";
import { NewsSection } from "@/components/public/news-section";
import { ClubsSection } from "@/components/public/clubs-section";
import { GallerySection } from "@/components/public/gallery-section";
import { getPublishedArticles } from "@/lib/content/reads";
import { SEPARATE_AREA_CATEGORIES } from "@/lib/content/display";
import {
  aboutContent,
  admissionContent,
  clubsContent,
  contactContent,
  galleryContent,
  heroContent,
  schoolInfoContent,
} from "@/lib/content/sections/content";
import { SECTION_ICON_OPTIONS } from "@/lib/content/sections/icons";

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
    getPublishedArticles({ excludeCategories: SEPARATE_AREA_CATEGORIES }),
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

      <main id="main-content">
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
            sizes="100vw"
            className="scale-105 object-cover transition-transform duration-1000 ease-out"
            priority
            quality={90}
          />

          {/* Balanced cinematic ambient overlay - keeps graduation photo bright, vibrant, and clear */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-black/40" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(0,0,0,0)_0%,_rgba(0,0,0,0.35)_100%)]" />

          {/* Ambient glowing starlight & botanical particles in background */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <span className="animate-particle-1 absolute top-[15%] left-[8%] h-1.5 w-1.5 rounded-full bg-white/70 blur-[0.5px]" />
            <span
              className="animate-particle-2 absolute top-[22%] left-[25%] h-2 w-2 rounded-full bg-school-yellow/60 blur-[1px]"
              style={{ animationDelay: "1s" }}
            />
            <span
              className="animate-particle-3 absolute top-[12%] right-[15%] h-2.5 w-2.5 rounded-full bg-school-green/50 blur-[1px]"
              style={{ animationDelay: "2s" }}
            />
            <span
              className="animate-particle-1 absolute top-[28%] right-[32%] h-1 w-1 rounded-full bg-white/80"
              style={{ animationDelay: "3s" }}
            />
            <span
              className="animate-particle-2 absolute top-[45%] left-[12%] h-2 w-2 rounded-full bg-emerald-300/50 blur-[1px]"
              style={{ animationDelay: "4s" }}
            />
            <span
              className="animate-particle-3 absolute top-[40%] left-[38%] h-1.5 w-1.5 rounded-full bg-school-yellow/70"
              style={{ animationDelay: "1.5s" }}
            />
            <span
              className="animate-particle-1 absolute top-[48%] right-[10%] h-2.5 w-2.5 rounded-full bg-white/60 blur-[1px]"
              style={{ animationDelay: "5s" }}
            />
            <span
              className="animate-particle-2 absolute top-[52%] right-[28%] h-2 w-2 rounded-full bg-school-yellow/60 blur-[1px]"
              style={{ animationDelay: "2.5s" }}
            />
            <span
              className="animate-particle-3 absolute bottom-[30%] left-[18%] h-3 w-3 rounded-full bg-school-green/40 blur-[2px]"
              style={{ animationDelay: "6s" }}
            />
            <span
              className="animate-particle-1 absolute bottom-[25%] left-[42%] h-1.5 w-1.5 rounded-full bg-white/75"
              style={{ animationDelay: "3.5s" }}
            />
            <span
              className="animate-particle-2 absolute right-[18%] bottom-[28%] h-2 w-2 rounded-full bg-school-yellow/60 blur-[1px]"
              style={{ animationDelay: "4.5s" }}
            />
            <span
              className="animate-particle-3 absolute right-[38%] bottom-[35%] h-1 w-1 rounded-full bg-emerald-200/80"
              style={{ animationDelay: "7s" }}
            />
            <span
              className="animate-particle-1 absolute bottom-[15%] left-[10%] h-2 w-2 rounded-full bg-white/65 blur-[1px]"
              style={{ animationDelay: "5.5s" }}
            />
            <span
              className="animate-particle-2 absolute bottom-[12%] left-[28%] h-2.5 w-2.5 rounded-full bg-school-yellow/50 blur-[1.5px]"
              style={{ animationDelay: "8s" }}
            />
            <span
              className="animate-particle-3 absolute right-[12%] bottom-[18%] h-1.5 w-1.5 rounded-full bg-school-green/60"
              style={{ animationDelay: "6.5s" }}
            />
            <span
              className="animate-particle-1 absolute right-[30%] bottom-[10%] h-2 w-2 rounded-full bg-white/70 blur-[1px]"
              style={{ animationDelay: "7.5s" }}
            />
          </div>

          {/* Centered content with 3D perspective and subtle floating depth */}
          <div className="animate-float-hero relative z-10 mx-auto max-w-4xl px-4 py-20 text-center">
            {/* 3D Animated Headline */}
            <h1
              className="motion-enter text-4xl leading-tight font-black tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
              style={{ "--motion-step": 0 } as React.CSSProperties}
            >
              {hero.heading.split("\n").map((line, index, lines) => (
                <span
                  key={index}
                  className={
                    index === 0
                      ? "block text-2xl font-bold tracking-wide text-white/95 drop-shadow-md sm:text-3xl md:text-4xl"
                      : "text-3d-hero mt-1 block text-4xl font-black tracking-tight text-white drop-shadow-2xl sm:text-6xl md:text-7xl lg:text-8xl"
                  }
                >
                  {line}
                  {index < lines.length - 1 && <br />}
                </span>
              ))}
            </h1>

            {/* 3D Tagline - Crisp, Bright White & Perfectly Legible */}
            <div
              className="motion-enter mx-auto mt-8 max-w-3xl px-4"
              style={{ "--motion-step": 1 } as React.CSSProperties}
            >
              <p className="text-3d-tagline animate-tagline-glow font-serif text-2xl font-normal tracking-wide italic sm:text-3xl md:text-4xl lg:text-[2.5rem]">
                {hero.tagline}
              </p>
            </div>
          </div>
        </section>

        {/* ───────────────────── MONTESSORI QUOTE ───────────────────── */}
        <section className="relative overflow-hidden bg-surface-soft py-20 sm:py-24">
          {/* Subtle decorative background watermark */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.03]">
            <div className="h-[420px] w-[420px] rounded-full border-[18px] border-school-green" />
          </div>

          <div className="relative mx-auto max-w-4xl px-4 sm:px-6">
            <Reveal>
              <div className="relative overflow-hidden rounded-3xl border border-neutral-200/90 bg-white p-8 text-center shadow-[0_15px_35px_rgba(0,0,0,0.03)] ring-1 ring-school-yellow/30 sm:p-12 lg:p-16">
                {/* Decorative Corner Filigree Accents */}
                <div className="absolute top-3.5 left-3.5 h-4 w-4 border-t-2 border-l-2 border-school-green/50" />
                <div className="absolute top-3.5 right-3.5 h-4 w-4 border-t-2 border-r-2 border-school-green/50" />
                <div className="absolute bottom-3.5 left-3.5 h-4 w-4 border-b-2 border-l-2 border-school-green/50" />
                <div className="absolute right-3.5 bottom-3.5 h-4 w-4 border-r-2 border-b-2 border-school-green/50" />

                {/* Giant Quote Graphic Mark */}
                <div className="text-school-yellow-dark mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-school-yellow-light shadow-inner sm:h-14 sm:w-14">
                  <span className="font-serif text-4xl font-black text-amber-600 sm:text-5xl">
                    &ldquo;
                  </span>
                </div>

                <blockquote className="mt-6 text-xl leading-relaxed font-medium text-neutral-800 italic sm:text-2xl md:text-3xl">
                  {about.quote.text}
                </blockquote>

                <div className="mt-8 flex items-center justify-center gap-3">
                  <span className="h-[1px] w-8 bg-school-green/40 sm:w-12" />
                  <cite className="text-sm font-bold tracking-wider text-school-green-dark uppercase not-italic sm:text-base">
                    {about.quote.author}
                  </cite>
                  <span className="h-[1px] w-8 bg-school-green/40 sm:w-12" />
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ───────────────────── CLASSROOM FEATURE BANNER ───────────────────── */}
        <section className="relative flex min-h-[460px] items-center overflow-hidden sm:min-h-[520px] lg:min-h-[580px]">
          {/* Background image */}
          <Image
            src={about.featureBanner.image.url}
            alt={about.featureBanner.image.alt}
            fill
            sizes="100vw"
            className="object-cover object-center"
            quality={90}
          />

          {/* Gradient overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/40" />

          {/* Content */}
          <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
            <div className="max-w-2xl">
              <span className="text-xs font-bold tracking-[0.2em] text-school-yellow uppercase">
                Montessori Learning Environment
              </span>
              <h2 className="mt-3 text-3xl leading-tight font-extrabold tracking-tight text-white drop-shadow-md sm:text-4xl lg:text-5xl">
                {about.featureBanner.heading}
              </h2>
              <div className="mt-4 h-1 w-16 rounded-full bg-school-green" />
              <p className="mt-6 text-base leading-relaxed text-white/90 sm:max-w-xl sm:text-lg">
                {about.featureBanner.body}
              </p>
              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="border-l-2 border-school-green pl-3.5">
                  <span className="block text-sm font-bold text-white">
                    Child-Centered
                  </span>
                  <span className="mt-0.5 block text-xs text-white/75">
                    Atmosphere
                  </span>
                </div>
                <div className="border-l-2 border-school-green pl-3.5">
                  <span className="block text-sm font-bold text-white">
                    Hands-On
                  </span>
                  <span className="mt-0.5 block text-xs text-white/75">
                    Discovery
                  </span>
                </div>
                <div className="border-l-2 border-school-green pl-3.5">
                  <span className="block text-sm font-bold text-white">
                    Values-Centered
                  </span>
                  <span className="mt-0.5 block text-xs text-white/75">
                    Formation
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ───────────────────── ABOUT US ───────────────────── */}
        <section id="about" className="bg-white py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <Reveal className="mx-auto max-w-3xl text-center">
              <span className="text-xs font-bold tracking-widest text-school-green-dark uppercase">
                {about.sectionLabel}
              </span>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl">
                {about.heading}
              </h2>
              <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-school-green" />
            </Reveal>

            {/* Two-Column Story Paragraphs */}
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
                <Reveal
                  key={columnIndex}
                  step={columnIndex}
                  className="rounded-3xl border border-neutral-100 bg-surface-soft p-8 shadow-sm transition-all duration-300 hover:border-neutral-200 hover:shadow-md sm:p-10"
                >
                  <div className="space-y-6">
                    {column.map((paragraph, index) => (
                      <p
                        key={index}
                        className={
                          columnIndex === 0 && index === 0
                            ? "text-lg leading-relaxed font-medium text-neutral-800"
                            : ""
                        }
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </Reveal>
              ))}
            </div>

            {/* Mission & Vision Cards */}
            <div className="mt-16 grid gap-8 md:grid-cols-2">
              {/* Mission */}
              <Reveal className="h-full">
                <div className="group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border-2 border-school-green/20 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-school-green/50 hover:shadow-xl sm:p-10">
                  <div>
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-school-green to-school-green-dark text-white shadow-md shadow-school-green/30 transition-transform duration-300 group-hover:scale-105">
                        <Compass className="h-7 w-7" />
                      </div>
                      <div>
                        <span className="text-xs font-bold tracking-wider text-school-green-dark uppercase">
                          Our Purpose
                        </span>
                        <h3 className="text-2xl font-extrabold tracking-tight text-neutral-900">
                          Our Mission
                        </h3>
                      </div>
                    </div>
                    <p className="mt-6 text-base leading-relaxed text-neutral-700 sm:text-lg">
                      {about.mission}
                    </p>
                  </div>
                  <div className="mt-8 flex items-center gap-2 border-t border-neutral-100 pt-4 text-xs font-semibold text-school-green-dark">
                    <CheckCircle2 className="h-4 w-4 text-school-green" />
                    <span>Dedicated to student holistic excellence</span>
                  </div>
                </div>
              </Reveal>

              {/* Vision */}
              <Reveal step={1} className="h-full">
                <div className="group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border-2 border-amber-400/25 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-amber-400/60 hover:shadow-xl sm:p-10">
                  <div>
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-md shadow-amber-500/30 transition-transform duration-300 group-hover:scale-105">
                        <Lightbulb className="h-7 w-7" />
                      </div>
                      <div>
                        <span className="text-xs font-bold tracking-wider text-amber-700 uppercase">
                          Our Horizon
                        </span>
                        <h3 className="text-2xl font-extrabold tracking-tight text-neutral-900">
                          Our Vision
                        </h3>
                      </div>
                    </div>
                    <p className="mt-6 text-base leading-relaxed text-neutral-700 sm:text-lg">
                      {about.vision}
                    </p>
                  </div>
                  <div className="mt-8 flex items-center gap-2 border-t border-neutral-100 pt-4 text-xs font-semibold text-amber-700">
                    <CheckCircle2 className="h-4 w-4 text-amber-500" />
                    <span>
                      Nurturing tomorrow&apos;s transformative leaders
                    </span>
                  </div>
                </div>
              </Reveal>
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
            sizes="100vw"
            className="object-cover object-center"
            quality={85}
          />

          {/* Light overlay for readability */}
          <div className="absolute inset-0 bg-neutral-50/92" />

          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal className="mx-auto max-w-2xl text-center">
              <span className="text-xs font-bold tracking-widest text-school-green-dark uppercase">
                {admission.sectionLabel}
              </span>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl">
                {admission.heading}
              </h2>
              <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-school-green" />
              <p className="mt-4 text-base text-neutral-600 sm:text-lg">
                {admission.intro}
              </p>
            </Reveal>

            {/* Programs offered */}
            <div className="mx-auto mt-14 grid max-w-4xl gap-8 sm:grid-cols-2">
              {admission.programs.map((program, index) => {
                const Icon = SECTION_ICON_OPTIONS[program.icon];
                const isFirst = index % 2 === 0;
                return (
                  <Reveal
                    key={program.name}
                    step={index % 2}
                    className="h-full"
                  >
                    <div
                      className={`group relative flex h-full flex-col justify-between rounded-3xl border-2 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-10 ${
                        isFirst
                          ? "border-school-green/30 hover:border-school-green/60"
                          : "border-amber-400/30 hover:border-amber-400/60"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <div
                            className={`flex h-16 w-16 items-center justify-center rounded-2xl shadow-md transition-transform duration-300 group-hover:scale-110 ${
                              isFirst
                                ? "bg-gradient-to-br from-school-green to-school-green-dark text-white shadow-school-green/25"
                                : "bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-amber-500/25"
                            }`}
                          >
                            <Icon className="h-8 w-8" strokeWidth={2.2} />
                          </div>
                          <span
                            className={`rounded-full px-3.5 py-1 text-xs font-bold tracking-wide uppercase ${
                              isFirst
                                ? "bg-school-green-light text-school-green-dark"
                                : "bg-amber-50 text-amber-800"
                            }`}
                          >
                            {program.levelLabel}
                          </span>
                        </div>
                        <h3 className="mt-6 text-2xl font-extrabold text-neutral-900">
                          {program.name}
                        </h3>
                        <p className="mt-3 text-sm leading-relaxed text-neutral-600 sm:text-base">
                          {program.description}
                        </p>
                      </div>

                      <div className="mt-8 border-t border-neutral-100 pt-4">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                            isFirst
                              ? "text-school-green-dark"
                              : "text-amber-700"
                          }`}
                        >
                          <CheckCircle2 className="h-4 w-4" /> Comprehensive
                          Montessori curriculum
                        </span>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>

            {/* Requirements List */}
            <div className="mt-24">
              <Reveal className="mx-auto max-w-2xl text-center">
                <span className="text-xs font-bold tracking-wider text-neutral-600 uppercase">
                  Documentation Checklist
                </span>
                <h3 className="mt-3 text-2xl font-extrabold tracking-tight text-neutral-900 sm:text-3xl">
                  Admission Requirements
                </h3>
                <p className="mt-2 text-sm text-neutral-600 sm:text-base">
                  Please prepare the following documents upon application
                  according to your student category.
                </p>
              </Reveal>

              <div className="mt-12 grid gap-6 md:grid-cols-3">
                {admission.requirementCategories.map((category, index) => {
                  const isFeatured = index === 1;
                  return (
                    <Reveal
                      key={category.title}
                      step={index % 3}
                      className="h-full"
                    >
                      <div
                        className={`relative flex h-full flex-col overflow-hidden rounded-3xl bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                          isFeatured
                            ? "border-2 border-school-green ring-2 shadow-school-green/10 ring-school-green/20"
                            : "border border-neutral-200/90"
                        }`}
                      >
                        {isFeatured && (
                          <div className="absolute top-0 right-0 left-0 bg-school-green py-1 text-center text-[11px] font-bold tracking-widest text-white uppercase shadow-xs">
                            Primary Applicant Pathway
                          </div>
                        )}
                        <div
                          className={`border-b border-neutral-100 pb-5 ${
                            isFeatured ? "pt-3" : ""
                          }`}
                        >
                          <span
                            className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${
                              isFeatured
                                ? "bg-school-green-light text-school-green-dark"
                                : index === 2
                                  ? "bg-school-yellow/30 text-amber-900"
                                  : "bg-neutral-100 text-neutral-700"
                            }`}
                          >
                            {category.badgeLabel}
                          </span>
                          <h4 className="mt-2 text-xl font-bold text-neutral-900">
                            {category.title}
                          </h4>
                        </div>
                        <ul className="mt-6 flex-1 space-y-4 text-sm text-neutral-700">
                          {category.items.map((item) => (
                            <li key={item} className="flex items-start gap-3">
                              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-school-green/10 text-school-green">
                                <Check className="h-3.5 w-3.5 stroke-[3]" />
                              </div>
                              <span className="leading-relaxed">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </Reveal>
                  );
                })}
              </div>
            </div>

            {/* Enrollment steps */}
            <div className="mt-24">
              <Reveal>
                <div className="mx-auto max-w-2xl text-center">
                  <span className="text-xs font-bold tracking-wider text-school-green-dark uppercase">
                    Simple 3-Step Journey
                  </span>
                  <h3 className="mt-3 text-2xl font-extrabold tracking-tight text-neutral-900 sm:text-3xl">
                    Enrollment Process
                  </h3>
                </div>
              </Reveal>

              <div className="relative mt-12 grid gap-6 md:grid-cols-3">
                {/* Connecting track across cards on desktop */}
                <div className="pointer-events-none absolute top-16 right-16 left-16 hidden h-1 bg-gradient-to-r from-school-green/30 via-school-green to-school-green/30 md:block" />

                {admission.enrollmentSteps.map((item, index) => (
                  <Reveal key={item.title} step={index % 3} className="h-full">
                    <div className="group relative flex h-full flex-col rounded-3xl border border-neutral-200/90 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-school-green/50 hover:shadow-xl sm:p-8">
                      {/* Step Number Badge */}
                      <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-school-green to-school-green-dark text-lg font-black text-white shadow-md shadow-school-green/30 transition-transform duration-300 group-hover:scale-110">
                        {String(index + 1).padStart(2, "0")}
                      </div>
                      <h4 className="mt-6 text-xl font-bold text-neutral-900 transition-colors group-hover:text-school-green">
                        {item.title}
                      </h4>
                      <p className="mt-3 text-sm leading-relaxed text-neutral-600 sm:text-base">
                        {item.description}
                      </p>
                    </div>
                  </Reveal>
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
          className="relative overflow-hidden bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 py-20 text-white lg:py-28"
        >
          {/* Subtle radial emerald aura in background */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(84,180,53,0.25)_0%,_rgba(0,0,0,0)_70%)]" />

          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal className="mx-auto max-w-2xl text-center">
              <span className="text-xs font-bold tracking-widest text-school-yellow uppercase">
                {contact.sectionLabel}
              </span>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
                {contact.heading}
              </h2>
              <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-school-yellow" />
              <p className="mt-4 text-base leading-relaxed text-neutral-300 sm:text-lg">
                {contact.intro}
              </p>
            </Reveal>

            <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {contact.cards.map((card, index) => {
                const Icon = SECTION_ICON_OPTIONS[card.icon];
                return (
                  <Reveal key={card.title} step={index % 3} className="h-full">
                    <div className="group flex h-full flex-col justify-between rounded-3xl border border-white/15 bg-white/5 p-8 text-center shadow-lg backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-school-green/50 hover:bg-white/10 hover:shadow-2xl sm:p-10">
                      <div>
                        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-school-yellow/40 bg-gradient-to-br from-school-yellow/20 to-school-green/20 shadow-md shadow-school-yellow/10 transition-transform duration-300 group-hover:scale-110">
                          <Icon
                            className="h-7 w-7 text-school-yellow"
                            strokeWidth={2.2}
                          />
                        </div>
                        <h3 className="text-xl font-bold text-white">
                          {card.title}
                        </h3>
                        <p className="mt-3 text-base font-medium text-white/95">
                          {card.detail}
                        </p>
                      </div>
                      <p className="mt-4 border-t border-white/10 pt-4 text-xs tracking-wide text-neutral-400">
                        {card.sub}
                      </p>
                    </div>
                  </Reveal>
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
