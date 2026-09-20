import Image from "next/image";
import {
  Mail,
  Phone,
  MapPin,
  BookOpen,
  CheckCircle2,
  Blocks,
} from "lucide-react";

import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";
import { NewsSection } from "@/components/public/news-section";
import { ClubsSection } from "@/components/public/clubs-section";
import { GallerySection } from "@/components/public/gallery-section";
import { getPublishedArticles } from "@/lib/wordpress/reads";

export default async function Home() {
  const articlesResult = await getPublishedArticles();

  return (
    <>
      <Navbar />

      <main>
        {/* ───────────────────── HERO ───────────────────── */}
        <section
          id="home"
          className="relative flex min-h-svh items-center justify-center overflow-hidden"
        >
          {/* Background image */}
          <Image
            src="/images/hero/fgs-website-e1760252687123.png"
            alt="Flor de Grace School graduation ceremony"
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
              Welcome to
              <br />
              Flor de Grace School Inc.
            </h1>

            {/* Green divider */}
            <div className="mx-auto mt-6 h-1 w-32 rounded-full bg-school-green sm:w-40" />

            <p className="mt-6 text-lg text-white/90 italic sm:text-xl md:text-2xl">
              &ldquo;Where Excellence Blooms and Futures Begin.&rdquo;
            </p>
          </div>
        </section>

        {/* ───────────────────── MONTESSORI QUOTE ───────────────────── */}
        <section className="bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
            <blockquote className="text-lg leading-relaxed text-neutral-700 italic sm:text-xl md:text-2xl">
              &ldquo;It is true that we cannot make a genius.
              <br className="hidden sm:inline" /> We can only give the child the
              chance to fulfil his potential possibilities.&rdquo;
            </blockquote>
            <cite className="mt-4 block text-sm font-normal text-neutral-500 not-italic sm:text-base">
              ~ Maria Montessori ~
            </cite>
          </div>
        </section>

        {/* ───────────────────── CLASSROOM FEATURE BANNER ───────────────────── */}
        <section className="relative flex min-h-[460px] items-center overflow-hidden sm:min-h-[520px] lg:min-h-[580px]">
          {/* Background image */}
          <Image
            src="/images/general/classroom.webp"
            alt="Flor de Grace School classroom learning"
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
                Nurturing Young Minds Through Curiosity, Critical Thinking, and
                a Love for Learning
              </h2>
              <p className="mt-6 text-base leading-relaxed text-white/90 sm:max-w-xl sm:text-lg">
                Join our community where children develop strong foundations
                through exploration, thoughtful learning, and academic growth.
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
                About Us
              </span>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
                Building Futures, One Student at a Time
              </h2>
              <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-school-green" />
            </div>

            {/* Two-Column Story Paragraphs */}
            <div className="mt-14 grid gap-8 text-base leading-relaxed text-neutral-600 md:grid-cols-2 lg:gap-12">
              {/* Column 1 */}
              <div className="space-y-6">
                <p>
                  For over two decades, since its establishment in 2001,{" "}
                  <strong className="font-semibold text-neutral-800">
                    Flor de Grace School Inc.
                  </strong>{" "}
                  has stood as a nurturing ground, diligently cultivating the
                  seeds of potential within each student. Rooted in a profound
                  mission to provide a quality education through a holistic
                  approach that fosters academic excellence, character
                  development, and lifelong learning, the school has become an
                  integral part of our community, shaping not just minds, but
                  also hearts and souls.
                </p>
                <p>
                  Flor de Grace School’s vision is ambitious and inspiring: to
                  become a model institution of learning that shapes
                  well-rounded individuals—academically excellent, morally
                  upright, and committed to lifelong growth and service to
                  others. This is not merely a statement etched on a wall; it is
                  a living ethos that permeates every classroom, every
                  interaction, and every activity within the school’s vibrant
                  walls.
                </p>
                <p>
                  The commitment to a holistic approach is particularly
                  noteworthy. Education at Flor de Grace School extends far
                  beyond the acquisition of facts and figures. It recognizes the
                  intricate tapestry of a child&apos;s development, weaving
                  together intellectual rigor with the cultivation of strong
                  moral principles and a genuine thirst for knowledge.
                </p>
              </div>

              {/* Column 2 */}
              <div className="space-y-6">
                <p>
                  Academic excellence is undoubtedly a cornerstone. Flor de
                  Grace School strives to equip its students with the critical
                  thinking skills, problem-solving abilities, and subject matter
                  mastery necessary to thrive in an increasingly complex world.
                  However, these pursuits of knowledge are never at the expense
                  of character development.
                </p>
                <p>
                  The school understands that true success lies not just in what
                  one knows, but in who one becomes. Through its programs and
                  guidance, Flor de Grace School instills values such as
                  integrity, respect, responsibility, and empathy, nurturing
                  individuals who will contribute positively to society.
                </p>
                <p>
                  Furthermore, the emphasis on lifelong learning is crucial in
                  today’s rapidly evolving landscape. Flor de Grace School
                  empowers its students to become active and engaged learners,
                  fostering curiosity, adaptability, and a passion for
                  continuous growth. This ensures that graduates are equipped
                  with the mindset and skills to navigate the challenges and
                  opportunities of their future endeavors.
                </p>
                <p>
                  As Flor de Grace School continues its journey, it remains
                  steadfast in its commitment to its mission and vision. It is a
                  place where academic excellence flourishes alongside moral
                  fortitude, and where the seeds of lifelong learning are sown
                  with care and intention. Flor de Grace School is not just an
                  institution of learning; it is a community that nurtures
                  well-rounded individuals ready to make their mark on the
                  world.
                </p>
              </div>
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
                  We are committed to providing quality education through a
                  holistic approach that fosters academic excellence, character
                  development, and lifelong learning.
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
                  Our vision is to become a model institution of learning that
                  shapes well-rounded individuals—academically excellent,
                  morally upright, and committed to lifelong growth and service
                  to others.
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
            src="/images/general/Admission.webp"
            alt="Flor de Grace School students and admission"
            fill
            className="object-cover object-center"
            quality={85}
          />

          {/* Light overlay for readability */}
          <div className="absolute inset-0 bg-neutral-50/90" />

          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-sm font-semibold tracking-widest text-school-green uppercase">
                Admission
              </span>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
                Start Your Journey with Us
              </h2>
              <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-school-green" />
              <p className="mt-4 text-neutral-600">
                We welcome young learners who are eager to explore, discover,
                and grow. Here&apos;s everything you need to join the FGS
                family.
              </p>
            </div>

            {/* Programs offered (Preschool & Elementary only) */}
            <div className="mx-auto mt-14 grid max-w-3xl gap-6 sm:grid-cols-2">
              <div className="group rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-school-green/40 hover:shadow-md">
                <div className="mx-auto flex h-14 w-14 items-center justify-center transition-transform duration-300 group-hover:scale-110">
                  <Blocks
                    className="h-10 w-10 text-school-green"
                    strokeWidth={2.2}
                  />
                </div>
                <h3 className="mt-4 text-xl font-bold text-neutral-900">
                  Preschool
                </h3>
                <p className="mt-1 text-sm font-medium text-school-green">
                  Kinder 1–2 / Preparatory
                </p>
                <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                  A play-based, nurturing environment designed to build
                  foundational social, emotional, and cognitive skills.
                </p>
              </div>

              <div className="group rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-school-green/40 hover:shadow-md">
                <div className="mx-auto flex h-14 w-14 items-center justify-center transition-transform duration-300 group-hover:scale-110">
                  <BookOpen
                    className="h-10 w-10 text-amber-500"
                    strokeWidth={2.2}
                  />
                </div>
                <h3 className="mt-4 text-xl font-bold text-neutral-900">
                  Elementary
                </h3>
                <p className="mt-1 text-sm font-medium text-amber-500">
                  Grades 1–6
                </p>
                <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                  A strong academic curriculum emphasizing critical thinking,
                  values formation, and a genuine love for learning.
                </p>
              </div>
            </div>

            {/* Requirements List (3 categories) */}
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
                {/* Old Students */}
                <div className="flex flex-col rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                  <div className="border-b border-neutral-100 pb-4">
                    <span className="inline-block rounded-full bg-school-green/10 px-3 py-1 text-xs font-semibold text-school-green">
                      Returning
                    </span>
                    <h4 className="mt-2 text-lg font-bold text-neutral-900">
                      Old Students
                    </h4>
                  </div>
                  <ul className="mt-5 flex-1 space-y-3.5 text-sm text-neutral-700">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-school-green" />
                      <span>Form 137 (Kinder / Preschool)</span>
                    </li>
                  </ul>
                </div>

                {/* New Students */}
                <div className="flex flex-col rounded-2xl border-2 border-school-green/30 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                  <div className="border-b border-neutral-100 pb-4">
                    <span className="inline-block rounded-full bg-school-green px-3 py-1 text-xs font-semibold text-white">
                      New Enrollment
                    </span>
                    <h4 className="mt-2 text-lg font-bold text-neutral-900">
                      New Students
                    </h4>
                  </div>
                  <ul className="mt-5 flex-1 space-y-3.5 text-sm text-neutral-700">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-school-green" />
                      <span>Birth Certificate</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-school-green" />
                      <span>Form 137 (Kinder / Preschool)</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-school-green" />
                      <span>ECCD (for Preparatory Class)</span>
                    </li>
                  </ul>
                </div>

                {/* Transferees */}
                <div className="flex flex-col rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                  <div className="border-b border-neutral-100 pb-4">
                    <span className="inline-block rounded-full bg-school-yellow/30 px-3 py-1 text-xs font-semibold text-neutral-800">
                      All Levels
                    </span>
                    <h4 className="mt-2 text-lg font-bold text-neutral-900">
                      Transferees
                    </h4>
                  </div>
                  <ul className="mt-5 flex-1 space-y-3.5 text-sm text-neutral-700">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-school-green" />
                      <span>Birth Certificate</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-school-green" />
                      <span>Form 137 (Kinder / Preschool)</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-school-green" />
                      <span>Good Moral Certificate</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-school-green" />
                      <span>ECCD (for Preparatory Class)</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Enrollment steps */}
            <div className="mt-20">
              <h3 className="mb-8 text-center text-xl font-bold text-neutral-900">
                Enrollment Process
              </h3>
              <div className="grid gap-6 md:grid-cols-3">
                {[
                  {
                    step: "01",
                    title: "Inquire",
                    description:
                      "Visit the school or reach out through our contact form to learn about available slots and requirements.",
                  },
                  {
                    step: "02",
                    title: "Submit Requirements",
                    description:
                      "Prepare and submit the required documents for your student category (Old, New, or Transferee).",
                  },
                  {
                    step: "03",
                    title: "Enroll",
                    description:
                      "Complete the enrollment form, settle fees, and officially welcome your child to the FGS family!",
                  },
                ].map((item) => (
                  <div
                    key={item.step}
                    className="relative rounded-2xl border border-neutral-200 bg-white p-6 pl-8 shadow-sm"
                  >
                    <span className="absolute top-6 left-0 flex h-12 w-1 rounded-r-full bg-school-green" />
                    <span className="text-3xl font-black text-school-green/20">
                      {item.step}
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
        <ClubsSection />

        {/* ───────────────────── GALLERY ───────────────────── */}
        <GallerySection />

        {/* ───────────────────── CONTACT US ───────────────────── */}
        <section
          id="contact"
          className="bg-gradient-to-br from-school-green via-school-green-dark to-school-green py-20 lg:py-28"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-sm font-semibold tracking-widest text-school-yellow uppercase">
                Contact Us
              </span>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Get in Touch
              </h2>
              <p className="mt-4 text-white/70">
                Have questions? We&apos;d love to hear from you. Reach out to us
                through any of the channels below.
              </p>
            </div>

            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: MapPin,
                  title: "Visit Us",
                  detail: "Flor de Grace School Inc.",
                  sub: "74 Gold St, Quezon City, 1121 Metro Manila",
                },
                {
                  icon: Phone,
                  title: "Call Us",
                  detail: "09682200677",
                  sub: "Mon–Fri, 7:00 AM – 5:00 PM",
                },
                {
                  icon: Mail,
                  title: "Email Us",
                  detail: "flordegrace.school2001@gmail.com",
                  sub: "We reply within 24 hours",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-sm transition-colors hover:bg-white/10"
                >
                  <div className="mx-auto mb-4 inline-flex rounded-xl bg-school-yellow/20 p-3">
                    <item.icon className="h-6 w-6 text-school-yellow" />
                  </div>
                  <h3 className="text-base font-semibold text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-white/80">{item.detail}</p>
                  <p className="mt-1 text-xs text-white/50">{item.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
