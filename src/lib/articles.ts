export interface Article {
  slug: string;
  title: string;
  category: "Announcements" | "Events" | "Clubs" | "Advisory";
  date: string;
  excerpt: string;
  content: string[];
  coverImage?: string;
  coverImageCaption?: string;
  gallery?: Array<{
    url: string;
    caption?: string;
  }>;
}

export const ARTICLES: Article[] = [
  {
    slug: "enrollment-sy-2026-2027-now-open",
    title: "Enrollment for SY 2026–2027 Now Open",
    category: "Announcements",
    date: "September 2026",
    excerpt:
      "We are now accepting enrollees for the upcoming school year. Secure your child's slot today!",
    coverImage: "/images/general/Admission.webp",
    coverImageCaption: "School orientation and welcoming our growing FGS family",
    content: [
      "Flor de Grace School Inc. is pleased to announce that official enrollment for School Year 2026–2027 is now officially open for Preschool (Kinder 1 & 2 / Preparatory) and Elementary (Grades 1 through 6).",
      "We welcome both returning students, new learners, and transferees to experience our nurturing educational environment grounded in academic rigor, character development, and a holistic approach to child growth.",
      "Parents and guardians are encouraged to visit the school administration office located at 74 Gold St, Quezon City, Metro Manila, from Monday to Friday between 7:00 AM and 5:00 PM. Early enrollment helps secure classroom slots and allows our teachers to prepare customized learning materials ahead of the school term.",
      "For inquiries regarding tuition, documentary requirements (such as Form 137, PSA Birth Certificates, and ECCD checklists), please feel free to reach out to us at 09682200677 or via email at flordegrace.school2001@gmail.com.",
    ],
  },
  {
    slug: "foundation-day-celebration",
    title: "Foundation Day Celebration",
    category: "Events",
    date: "October 2026",
    excerpt:
      "Join us for a day of fun, games, and performances as we celebrate our school's founding anniversary.",
    coverImage: "/images/hero/fgs-website-e1760252687123.png",
    coverImageCaption: "Celebrating decades of academic excellence and community milestones",
    content: [
      "Founded in 2001, Flor de Grace School Inc. has stood for over two decades as a beacon of academic excellence and values-centered formation in our community. Next month, we commemorate our founding anniversary with our annual Foundation Day Celebration!",
      "The festivities will feature student musical and dance presentations, academic exhibit booths from our various student clubs, friendly sports matches, and community games designed for students and parents alike.",
      "A special thanksgiving gathering and ceremony will open the celebration, recognizing the dedicated educators, supportive families, and alumni who have contributed to the school's enduring legacy.",
      "Detailed event schedules and activity guidelines will be distributed to students and posted on the official school bulletin board. We look forward to celebrating this proud milestone with the entire FGS community!",
    ],
  },
  {
    slug: "parent-teacher-conference-schedule",
    title: "Parent-Teacher Conference Schedule",
    category: "Advisory",
    date: "November 2026",
    excerpt:
      "The quarterly parent-teacher conference will be held next month. Please check the consultation schedule.",
    coverImage: "/images/general/classroom.webp",
    coverImageCaption: "Dedicated teachers meeting to discuss student progress and milestones",
    content: [
      "Open communication between families and educators is key to every child's academic and emotional success. Flor de Grace School Inc. invites all parents and guardians to our upcoming quarterly Parent-Teacher Conference (PTC).",
      "During the conference, teachers will discuss students' academic progress, quarterly report cards, behavioral milestones, and collaborative goals for the succeeding grading period.",
      "Consultation schedules will be arranged by class advisers to ensure each parent receives adequate dedicated time with the faculty. Preschool sessions will take place in the morning, followed by Elementary grade levels in the afternoon.",
      "We strongly encourage all parents to attend and participate actively in their children's educational journey. For schedule rescheduling or special appointments, please coordinate directly with your child's class adviser.",
    ],
  },
  {
    slug: "buwan-ng-wika-2026-celebration",
    title: "Buwan ng Wika 2026: Pagdiriwang ng Wikang Filipino",
    category: "Events",
    date: "August 2026",
    excerpt:
      "Students showcase Filipino heritage, traditional attire, poetic recitations, and folk dances in our annual Buwan ng Wika festival.",
    coverImage: "/images/general/Admission.webp",
    coverImageCaption: "Students performing traditional cultural presentations on stage",
    content: [
      "Ang Flor de Grace School Inc. ay nakiisa sa buong bansa sa pagdiriwang ng Buwan ng Wikang Pambansa, na may temang nagtatampok sa yaman ng kulturang Pilipino at kahalagahan ng sariling wika sa paghubog ng kabataang may pagmamahal sa bayan.",
      "Lahat ng antas mula Preschool hanggang Elementary ay nagsuot ng makukulay na kasuotang Pilipino, lumahok sa sabayang pagbigkas, tula, at nagtanghal ng mga katutubong sayaw.",
      "Nagkaroon din ng munting salu-salo tampok ang mga tradisyunal na kakanin at pagkaing Pilipino sa bawat silid-aralan upang maranasan ng bawat mag-aaral ang diwa ng bayanihan at pagkakaisa.",
    ],
  },
  {
    slug: "robotics-and-science-exhibition",
    title: "Annual Robotics & Science Exhibition Highlights",
    category: "Clubs",
    date: "July 2026",
    excerpt:
      "Young innovators from the Tech & Science clubs exhibit creative STEM models and interactive projects for fellow classmates.",
    coverImage: "/images/general/classroom.webp",
    coverImageCaption: "Student innovators demonstrating hands-on science projects",
    content: [
      "Curiosity, problem-solving, and ingenuity took center stage during the Flor de Grace School Annual Robotics and Science Fair.",
      "Elementary students collaborated in teams to design mechanical models, test basic electronic circuits, and explain ecological preservation concepts through vibrant interactive display boards.",
      "The event provided an invaluable platform for young learners to apply classroom theories to practical, real-world solutions under the guidance of our STEM faculty mentors.",
    ],
  },
  {
    slug: "reading-month-book-fair",
    title: "National Reading Month & Book Fair",
    category: "Announcements",
    date: "June 2026",
    excerpt:
      "Join us as we foster a lifelong passion for reading with story hours, guest readers, and our campus book fair.",
    coverImage: "/images/hero/fgs-website-e1760252687123.png",
    coverImageCaption: "Fostering early literacy and a genuine love for reading",
    content: [
      "In celebration of National Reading Month, Flor de Grace School launched a month-long series of literacy and reading promotion activities across all grade levels.",
      "Highlights included 'Drop Everything and Read' (DEAR) sessions, character costume parades, and visits by guest storytellers who inspired students to embark on new literary adventures.",
      "A book fair on campus allowed parents and students to discover curated, age-appropriate books to build home reading libraries.",
    ],
  },
];

export function getAllArticles(): Article[] {
  return ARTICLES;
}

export function getArticleBySlug(slug: string): Article | undefined {
  return ARTICLES.find((article) => article.slug === slug);
}
