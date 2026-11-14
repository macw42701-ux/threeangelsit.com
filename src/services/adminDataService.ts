import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
  type DocumentData,
  type Unsubscribe,
} from 'firebase/firestore';
import heroWorkbenchImg from '../assets/images/hero_it_workbench_1794586743951.jpg';
import awarenessPhishingImg from '../assets/images/awareness_phishing_briefing_1794586743313.jpg';
import {
  AWARENESS_LESSONS,
  DIGITAL_RESOURCES,
  FREE_COURSES,
  IT_BLOG_POSTS,
  KNOWLEDGE_BASE,
} from '../data/itData';
import {
  db,
  handleFirestoreError,
  isSparkQuotaError,
  OperationType,
  SPARK_QUOTA_USER_MESSAGE,
} from '../firebase';
import type {
  AdminArticle,
  AdminAwarenessPost,
  AdminContactInquiry,
  AdminCourse,
  AdminDashboardSnapshot,
  AdminDigitalResource,
  AdminKBGuide,
  AdminLesson,
  AdminQuiz,
  AdminUser,
  AwarenessCategory,
  CategoryItem,
  CourseCategory,
  KBCategory,
  MediaAsset,
  PlatformUser,
  WebsiteSettings,
} from '../types/admin';

export const FIRESTORE_COLLECTIONS = [
  'admins',
  'users',
  'articles',
  'categories',
  'courses',
  'lessons',
  'quizzes',
  'awareness_posts',
  'knowledge_base',
  'digital_resources',
  'media',
  'website_settings',
  'contact_inquiries',
] as const;

export const AWARENESS_CATEGORIES: AwarenessCategory[] = [
  'Cybersecurity',
  'Online Safety',
  'Password Security',
  'Email Security',
  'Digital Privacy',
  'Scam Awareness',
  'Safe Internet Usage',
];

export const COURSE_CATEGORIES: CourseCategory[] = [
  'Computer Fundamentals',
  'Networking',
  'Windows',
  'Linux',
  'Cybersecurity',
  'Cloud Computing',
  'Hardware and Troubleshooting',
  'Programming',
  'IT Helpdesk',
  'System Administration',
];

export const KB_CATEGORIES: KBCategory[] = [
  'Networking',
  'Windows Support',
  'Linux Support',
  'Hardware',
  'Software',
  'Email Problems',
  'Printer Problems',
  'Cybersecurity',
  'IT Infrastructure',
];

export function formatFirestoreDate(value: unknown, fallback = ''): string {
  if (!value) return fallback || new Date().toISOString().slice(0, 10);
  if (typeof value === 'string') return value.slice(0, 10);
  if (value instanceof Timestamp) return value.toDate().toISOString().slice(0, 10);
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === 'object' && 'toDate' in (value as Record<string, unknown>)) {
    const fn = (value as { toDate?: () => Date }).toDate;
    if (typeof fn === 'function') return fn().toISOString().slice(0, 10);
  }
  return fallback || new Date().toISOString().slice(0, 10);
}

function mapCourseCategory(raw: string): CourseCategory {
  if (raw === 'Foundations') return 'Computer Fundamentals';
  if (raw === 'Networking') return 'Networking';
  if (raw === 'Administration') return 'System Administration';
  if (raw === 'Security & Cloud') return 'Cybersecurity';
  return 'IT Helpdesk';
}

function mapAwarenessCategory(raw: string): AwarenessCategory {
  if (raw.includes('Phishing')) return 'Email Security';
  if (raw.includes('Network')) return 'Online Safety';
  if (raw.includes('Data')) return 'Digital Privacy';
  return 'Cybersecurity';
}

function mapKBCategory(raw: string): KBCategory {
  if (raw === 'Networking') return 'Networking';
  if (raw === 'Windows') return 'Windows Support';
  if (raw === 'Linux') return 'Linux Support';
  if (raw === 'Identity & Access' || raw === 'Security') return 'Cybersecurity';
  return 'IT Infrastructure';
}

export function buildDefaultSnapshot(): AdminDashboardSnapshot {
  const logoPath = `${import.meta.env.BASE_URL}assets/aistudio/logo_three_angels_new_c1509518.png`;

  const media: MediaAsset[] = [
    {
      id: 'media-logo-brand',
      title: 'THREE ANGELS IT SERVICES Official Logo',
      description: 'Official Three Angels IT Services emblem with cloud laptop, wings, and brand tagline.',
      altText: 'Three Angels IT Services — Your Trusted IT Partner for a Smarter Tomorrow logo',
      category: 'Branding',
      fileName: 'logo_three_angels_new_c1509518.png',
      mimeType: 'image/png',
      sizeBytes: 1228800,
      url: logoPath,
      uploadedAt: '2026-11-14',
    },
    {
      id: 'media-it-workbench',
      title: 'Engineering Diagnostics Workbench',
      description: 'Clean workstation environment used in the About & Support overview.',
      altText: 'IT engineer workstation with diagnostic consoles and structured cabling',
      category: 'Engineering',
      fileName: 'hero_it_workbench_1794586743951.jpg',
      mimeType: 'image/jpeg',
      sizeBytes: 718010,
      url: heroWorkbenchImg,
      uploadedAt: '2026-11-10',
    },
    {
      id: 'media-phishing-briefing',
      title: 'Security Awareness Briefing Visual',
      description: 'Visual briefing illustration for weekly IT awareness lessons.',
      altText: 'Digital security awareness briefing showing email header verification',
      category: 'Cybersecurity',
      fileName: 'awareness_phishing_briefing_1794586743313.jpg',
      mimeType: 'image/jpeg',
      sizeBytes: 428500,
      url: awarenessPhishingImg,
      uploadedAt: '2026-11-11',
    },
  ];

  const articles: AdminArticle[] = IT_BLOG_POSTS.map((post, idx) => ({
    id: post.id,
    title: post.title,
    subtitle: post.excerpt,
    content: post.sections.map((s) => `## ${s.heading}\n\n${s.body}`).join('\n\n'),
    featuredImage: idx === 2 ? awarenessPhishingImg : heroWorkbenchImg,
    author: 'THREE ANGELS Editorial Team',
    category: post.category,
    tags: [post.category, 'IT Diagnostics', 'Practical Guide'],
    seoTitle: `${post.title} | THREE ANGELS IT SERVICES`,
    seoDescription: post.excerpt,
    status: 'Published',
    publishedDate: '2026-11-10',
    featured: idx === 0,
    updatedAt: '2026-11-12',
  }));

  const awareness_posts: AdminAwarenessPost[] = AWARENESS_LESSONS.map((lesson) => ({
    id: lesson.id,
    weekLabel: lesson.weekLabel,
    title: lesson.title,
    category: mapAwarenessCategory(lesson.category),
    summary: lesson.summary,
    imageUrl: awarenessPhishingImg,
    cybersecurityTips: lesson.keyTakeaways,
    digitalSafetyGuidance: lesson.defenseChecklist,
    weeklyContent: lesson.bodyLines.join('\n\n'),
    status: 'Published',
    updatedAt: '2026-11-12',
  }));

  const lessons: AdminLesson[] = [];
  const quizzes: AdminQuiz[] = [];

  const courses: AdminCourse[] = FREE_COURSES.map((course) => {
    const courseLessonIds: string[] = [];
    course.modules.forEach((mod, modIdx) => {
      const lessonId = `lesson-${mod.id}`;
      courseLessonIds.push(lessonId);
      const quizId = `quiz-${mod.id}`;
      const sampleQuizQuestion = {
        id: `q-${mod.id}-1`,
        prompt: `Which engineering practice aligns best with "${mod.title}"?`,
        options: [
          'Verify evidence with diagnostic checks before changing configuration',
          'Restart devices repeatedly without inspecting logs',
          'Disable security controls permanently during testing',
        ],
        correctIndex: 0,
      };
      quizzes.push({
        id: quizId,
        lessonId,
        questions: [sampleQuizQuestion],
      });
      lessons.push({
        id: lessonId,
        courseId: course.id,
        title: mod.title,
        description: `Self-paced practical module (${mod.duration}) inside ${course.title}.`,
        content: `## Lesson Objectives\n\nComplete the step-by-step walkthrough and verify outputs in the browser Virtual IT Lab.`,
        videoUrl: '',
        pdfResourceIds: [DIGITAL_RESOURCES[0].id],
        practicalExercise: `Open ${course.practiceTarget.label} and verify every diagnostic check step by step.`,
        quizQuestions: [sampleQuizQuestion],
        sequence: modIdx + 1,
        status: 'Published',
        updatedAt: '2026-11-11',
      });
    });

    return {
      id: course.id,
      title: course.title,
      description: course.summary,
      thumbnailUrl: heroWorkbenchImg,
      level: course.level,
      category: mapCourseCategory(course.category),
      learningObjectives: course.outcomes,
      lessonIds: courseLessonIds,
      materialIds: [DIGITAL_RESOURCES[0].id, DIGITAL_RESOURCES[1].id],
      duration: course.duration,
      status: 'Published',
      updatedAt: '2026-11-12',
    };
  });

  const knowledge_base: AdminKBGuide[] = KNOWLEDGE_BASE.map((item) => ({
    id: item.id,
    title: item.title,
    category: mapKBCategory(item.category),
    difficulty: item.difficulty,
    keywords: [item.category, item.difficulty, 'Runbook'],
    diagramUrl: heroWorkbenchImg,
    steps: item.solutions,
    commands: item.diagnosticCommands.map((c) => `${c.label}: ${c.command}`),
    status: 'Published',
    updatedAt: '2026-11-11',
  }));

  const digital_resources: AdminDigitalResource[] = DIGITAL_RESOURCES.map((res) => ({
    id: res.id,
    title: res.title,
    fileName: res.fileName,
    fileType: res.format,
    fileSizeBytes: new Blob([res.content]).size,
    category: res.category,
    uploadDate: '2026-11-10',
    status: 'Published',
    description: res.summary,
    content: res.content,
  }));

  const categories: CategoryItem[] = [
    ...COURSE_CATEGORIES.map((name) => ({
      id: `cat-course-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      name,
      scope: 'course' as const,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    })),
    ...AWARENESS_CATEGORIES.map((name) => ({
      id: `cat-aware-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      name,
      scope: 'awareness' as const,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    })),
    ...KB_CATEGORIES.map((name) => ({
      id: `cat-kb-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      name,
      scope: 'knowledge_base' as const,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    })),
  ];

  return {
    admins: [],
    users: [],
    articles,
    categories,
    courses,
    lessons,
    quizzes,
    awareness_posts,
    knowledge_base,
    digital_resources,
    media,
    contact_inquiries: [],
    website_settings: {
      companyName: 'THREE ANGELS IT SERVICES',
      tagline: 'Learn Technology. Build Skills. Solve Real Problems.',
      supportNote:
        'Verified support inquiries are saved directly to our support queue. Public administrator registration is disabled.',
      openAccessEnabled: true,
      homepage: {
        mainHeading: 'Learn Technology. Build Skills. Solve Real Problems.',
        description:
          'Discover practical IT knowledge, digital awareness, beginner-friendly courses and technical solutions designed to help you grow in the digital world.',
        heroBannerImage: heroWorkbenchImg,
        primaryButtonText: 'Explore Free Courses',
        secondaryButtonText: 'Discover IT Solutions',
        featuredCourseIds: courses.slice(0, 2).map((c) => c.id),
        featuredArticleIds: articles.slice(0, 2).map((a) => a.id),
        awarenessSectionHeading: 'IT Awareness of the Week',
        awarenessSectionSummary:
          'Concise weekly briefings on phishing, rogue Wi-Fi hotspots, data protection, and credential hygiene. Inspect the simulated prompt below to uncover every threat indicator.',
        solutionsSectionHeading: 'Technical Solutions',
        solutionsSectionSummary:
          'Practical engineering architectures and troubleshooting checklists across campus networks, endpoint hardware, operating systems, and infrastructure security.',
        announcementText:
          'Open single-page access: Explore Free Courses, Virtual IT Labs, and Real-Life Tickets without login.',
        announcementEnabled: false,
        updatedAt: '2026-11-12',
      },
      menuItems: [
        { id: 'top', label: 'Home', url: '#top', enabled: true, order: 1, protectedSystem: true },
        { id: 'awareness', label: 'IT Awareness', url: '#awareness', enabled: true, order: 2, protectedSystem: false },
        { id: 'blog', label: 'IT Blog', url: '#blog', enabled: true, order: 3, protectedSystem: false },
        { id: 'courses', label: 'Free Courses', url: '#courses', enabled: true, order: 4, protectedSystem: false },
        { id: 'roadmap', label: 'Career Roadmap', url: '#roadmap', enabled: true, order: 5, protectedSystem: false },
        { id: 'solutions', label: 'Technical Solutions', url: '#solutions', enabled: true, order: 6, protectedSystem: false },
        { id: 'kb', label: 'Knowledge Base', url: '#kb', enabled: true, order: 7, protectedSystem: false },
        { id: 'resources', label: 'Digital Resources', url: '#resources', enabled: true, order: 8, protectedSystem: false },
        { id: 'about', label: 'About Us', url: '#about', enabled: true, order: 9, protectedSystem: false },
        { id: 'contact', label: 'Contact Us', url: '#contact', enabled: true, order: 10, protectedSystem: true },
        { id: 'admin', label: 'Admin Portal', url: '/admin', enabled: true, order: 11, protectedSystem: true },
      ],
      seo: {
        pageTitle: 'THREE ANGELS IT SERVICES — Learn Technology. Build Skills. Solve Real Problems.',
        metaDescription:
          'Discover practical IT knowledge, digital awareness, beginner-friendly courses, virtual IT labs, and technical solutions from THREE ANGELS IT SERVICES.',
        keywords: [
          'THREE ANGELS IT SERVICES',
          'IT awareness',
          'free IT courses',
          'virtual IT lab',
          'technical troubleshooting',
        ],
        canonicalUrl: 'https://solankimansukh.github.io/threeangelsit.com/',
        socialImage: logoPath,
        socialImageAlt: 'THREE ANGELS IT SERVICES official technology education emblem',
        robotsIndex: true,
        robotsFollow: true,
        sitemapPaths: ['/', '/#awareness', '/#courses', '/#blog', '/#roadmap', '/#solutions', '/#kb', '/#resources'],
      },
      updatedAt: '2026-11-12',
    },
    activity: [],
  };
}

function normalizeArticle(id: string, data: DocumentData): AdminArticle {
  return {
    id,
    title: String(data.title ?? ''),
    subtitle: String(data.subtitle ?? ''),
    content: String(data.content ?? ''),
    featuredImage: String(data.featuredImage ?? ''),
    author: String(data.author ?? 'THREE ANGELS Editorial Team'),
    category: String(data.category ?? 'IT Helpdesk'),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    seoTitle: String(data.seoTitle ?? ''),
    seoDescription: String(data.seoDescription ?? ''),
    status: data.status === 'Published' ? 'Published' : 'Draft',
    publishedDate: String(data.publishedDate ?? formatFirestoreDate(data.updatedAt)),
    featured: Boolean(data.featured),
    updatedAt: formatFirestoreDate(data.updatedAt),
  };
}

function normalizeAwareness(id: string, data: DocumentData): AdminAwarenessPost {
  return {
    id,
    weekLabel: String(data.weekLabel ?? 'Weekly Briefing'),
    title: String(data.title ?? ''),
    category: (data.category as AwarenessCategory) ?? 'Cybersecurity',
    summary: String(data.summary ?? ''),
    imageUrl: String(data.imageUrl ?? ''),
    cybersecurityTips: Array.isArray(data.cybersecurityTips) ? data.cybersecurityTips.map(String) : [],
    digitalSafetyGuidance: Array.isArray(data.digitalSafetyGuidance)
      ? data.digitalSafetyGuidance.map(String)
      : [],
    weeklyContent: String(data.weeklyContent ?? ''),
    status: data.status === 'Published' ? 'Published' : 'Draft',
    updatedAt: formatFirestoreDate(data.updatedAt),
  };
}

function normalizeCourse(id: string, data: DocumentData): AdminCourse {
  return {
    id,
    title: String(data.title ?? ''),
    description: String(data.description ?? ''),
    thumbnailUrl: String(data.thumbnailUrl ?? ''),
    level: (data.level as AdminCourse['level']) ?? 'Beginner',
    category: (data.category as CourseCategory) ?? 'Computer Fundamentals',
    learningObjectives: Array.isArray(data.learningObjectives)
      ? data.learningObjectives.map(String)
      : [],
    lessonIds: Array.isArray(data.lessonIds) ? data.lessonIds.map(String) : [],
    materialIds: Array.isArray(data.materialIds) ? data.materialIds.map(String) : [],
    duration: String(data.duration ?? 'Self-Paced'),
    status: data.status === 'Published' ? 'Published' : 'Draft',
    updatedAt: formatFirestoreDate(data.updatedAt),
  };
}

function normalizeLesson(id: string, data: DocumentData): AdminLesson {
  return {
    id,
    courseId: String(data.courseId ?? ''),
    title: String(data.title ?? ''),
    description: String(data.description ?? ''),
    content: String(data.content ?? ''),
    videoUrl: String(data.videoUrl ?? ''),
    pdfResourceIds: Array.isArray(data.pdfResourceIds) ? data.pdfResourceIds.map(String) : [],
    practicalExercise: String(data.practicalExercise ?? ''),
    quizQuestions: Array.isArray(data.quizQuestions) ? data.quizQuestions : [],
    sequence: typeof data.sequence === 'number' ? data.sequence : 1,
    status: data.status === 'Published' ? 'Published' : 'Draft',
    updatedAt: formatFirestoreDate(data.updatedAt),
  };
}

function normalizeKBGuide(id: string, data: DocumentData): AdminKBGuide {
  return {
    id,
    title: String(data.title ?? ''),
    category: (data.category as KBCategory) ?? 'Networking',
    difficulty: (data.difficulty as AdminKBGuide['difficulty']) ?? 'Beginner',
    keywords: Array.isArray(data.keywords) ? data.keywords.map(String) : [],
    diagramUrl: String(data.diagramUrl ?? ''),
    steps: Array.isArray(data.steps) ? data.steps.map(String) : [],
    commands: Array.isArray(data.commands) ? data.commands.map(String) : [],
    status: data.status === 'Published' ? 'Published' : 'Draft',
    updatedAt: formatFirestoreDate(data.updatedAt),
  };
}

function normalizeResource(id: string, data: DocumentData): AdminDigitalResource {
  return {
    id,
    title: String(data.title ?? ''),
    fileName: String(data.fileName ?? ''),
    fileType: String(data.fileType ?? 'Document'),
    fileSizeBytes: typeof data.fileSizeBytes === 'number' ? data.fileSizeBytes : 0,
    category: String(data.category ?? 'Study Guides'),
    uploadDate: String(data.uploadDate ?? formatFirestoreDate(data.updatedAt)),
    status: data.status === 'Published' ? 'Published' : 'Draft',
    description: String(data.description ?? ''),
    content: typeof data.content === 'string' ? data.content : undefined,
    downloadUrl: typeof data.downloadUrl === 'string' ? data.downloadUrl : undefined,
  };
}

function normalizeWebsiteSettings(data: DocumentData, defaults: WebsiteSettings): WebsiteSettings {
  return {
    companyName: String(data.companyName ?? defaults.companyName),
    tagline: String(data.tagline ?? defaults.tagline),
    supportNote: String(data.supportNote ?? defaults.supportNote),
    openAccessEnabled:
      typeof data.openAccessEnabled === 'boolean'
        ? data.openAccessEnabled
        : defaults.openAccessEnabled,
    homepage: {
      ...defaults.homepage,
      ...(typeof data.homepage === 'object' && data.homepage !== null ? data.homepage : {}),
    },
    menuItems: Array.isArray(data.menuItems) ? data.menuItems : defaults.menuItems,
    seo: {
      ...defaults.seo,
      ...(typeof data.seo === 'object' && data.seo !== null ? data.seo : {}),
    },
    updatedAt: formatFirestoreDate(data.updatedAt, defaults.updatedAt),
  };
}

export interface PublicSiteContent {
  isHydrated: boolean;
  isLiveFirestore: boolean;
  articles: AdminArticle[];
  awareness_posts: AdminAwarenessPost[];
  courses: AdminCourse[];
  lessons: AdminLesson[];
  knowledge_base: AdminKBGuide[];
  digital_resources: AdminDigitalResource[];
  media: MediaAsset[];
  website_settings: WebsiteSettings;
}

class FirestoreAdminRepository {
  getInitialSnapshot(): AdminDashboardSnapshot {
    return buildDefaultSnapshot();
  }

  /**
   * Idempotently seeds Stage 1 content into Firestore if website_settings/public does not exist yet
   * (or overwrites when force === true). Only succeeds when called by an authorized admin.
   */
  async seedDefaultContentToFirestore(force = false): Promise<boolean> {
    const settingsRef = doc(db, 'website_settings', 'public');
    try {
      if (!force) {
        const snap = await getDoc(settingsRef);
        if (snap.exists()) return false;
      }

      const defaults = buildDefaultSnapshot();
      const batch = writeBatch(db);

      defaults.categories.forEach((cat) => {
        batch.set(doc(db, 'categories', cat.id), cat);
      });
      defaults.media.forEach((asset) => {
        batch.set(doc(db, 'media', asset.id), asset);
      });
      defaults.articles.forEach((article) => {
        batch.set(doc(db, 'articles', article.id), {
          ...article,
          updatedAt: serverTimestamp(),
        });
      });
      defaults.awareness_posts.forEach((post) => {
        batch.set(doc(db, 'awareness_posts', post.id), {
          ...post,
          updatedAt: serverTimestamp(),
        });
      });
      defaults.courses.forEach((course) => {
        batch.set(doc(db, 'courses', course.id), {
          ...course,
          updatedAt: serverTimestamp(),
        });
      });
      defaults.lessons.forEach((lesson) => {
        batch.set(doc(db, 'lessons', lesson.id), {
          ...lesson,
          updatedAt: serverTimestamp(),
        });
      });
      defaults.quizzes.forEach((quiz) => {
        batch.set(doc(db, 'quizzes', quiz.id), quiz);
      });
      defaults.knowledge_base.forEach((guide) => {
        batch.set(doc(db, 'knowledge_base', guide.id), {
          ...guide,
          updatedAt: serverTimestamp(),
        });
      });
      defaults.digital_resources.forEach((res) => {
        const clean: Record<string, unknown> = {
          id: res.id,
          title: res.title,
          fileName: res.fileName,
          fileType: res.fileType,
          fileSizeBytes: res.fileSizeBytes,
          category: res.category,
          uploadDate: res.uploadDate,
          status: res.status,
          description: res.description,
        };
        if (res.content) clean.content = res.content;
        if (res.downloadUrl) clean.downloadUrl = res.downloadUrl;
        batch.set(doc(db, 'digital_resources', res.id), clean);
      });

      batch.set(settingsRef, {
        ...defaults.website_settings,
        updatedAt: serverTimestamp(),
      });

      await batch.commit();
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'website_settings/public');
    }
  }

  /**
   * Real-time public subscription. Strictly filters status == 'Published'
   * so unauthenticated readers comply with zero-trust Firestore rules.
   */
  subscribePublicContent(
    onUpdate: (data: PublicSiteContent) => void,
    onError?: (msg: string) => void
  ): Unsubscribe {
    const defaults = buildDefaultSnapshot();
    const state: PublicSiteContent = {
      isHydrated: false,
      isLiveFirestore: false,
      articles: defaults.articles,
      awareness_posts: defaults.awareness_posts,
      courses: defaults.courses,
      lessons: defaults.lessons,
      knowledge_base: defaults.knowledge_base,
      digital_resources: defaults.digital_resources,
      media: defaults.media,
      website_settings: defaults.website_settings,
    };

    const emit = () => onUpdate({ ...state });
    const unsubs: Unsubscribe[] = [];

    const handleErr = (op: OperationType, path: string) => (err: unknown) => {
      if (isSparkQuotaError(err)) {
        console.warn(`Spark quota warning (${op} ${path}):`, SPARK_QUOTA_USER_MESSAGE);
        onError?.(SPARK_QUOTA_USER_MESSAGE);
        return;
      }
      console.error(`Public subscription warning (${op} ${path}):`, err);
      onError?.(err instanceof Error ? err.message : String(err));
    };

    unsubs.push(
      onSnapshot(
        doc(db, 'website_settings', 'public'),
        (snap) => {
          state.isHydrated = true;
          if (snap.exists()) {
            state.isLiveFirestore = true;
            state.website_settings = normalizeWebsiteSettings(
              snap.data(),
              defaults.website_settings
            );
          }
          emit();
        },
        handleErr(OperationType.GET, 'website_settings/public')
      )
    );

    unsubs.push(
      onSnapshot(
        query(collection(db, 'articles'), where('status', '==', 'Published')),
        (snap) => {
          if (state.isLiveFirestore || !snap.empty) {
            state.articles = snap.docs.map((d) => normalizeArticle(d.id, d.data()));
          }
          emit();
        },
        handleErr(OperationType.LIST, 'articles')
      )
    );

    unsubs.push(
      onSnapshot(
        query(collection(db, 'awareness_posts'), where('status', '==', 'Published')),
        (snap) => {
          if (state.isLiveFirestore || !snap.empty) {
            state.awareness_posts = snap.docs.map((d) => normalizeAwareness(d.id, d.data()));
          }
          emit();
        },
        handleErr(OperationType.LIST, 'awareness_posts')
      )
    );

    unsubs.push(
      onSnapshot(
        query(collection(db, 'courses'), where('status', '==', 'Published')),
        (snap) => {
          if (state.isLiveFirestore || !snap.empty) {
            state.courses = snap.docs.map((d) => normalizeCourse(d.id, d.data()));
          }
          emit();
        },
        handleErr(OperationType.LIST, 'courses')
      )
    );

    unsubs.push(
      onSnapshot(
        query(collection(db, 'lessons'), where('status', '==', 'Published')),
        (snap) => {
          if (state.isLiveFirestore || !snap.empty) {
            state.lessons = snap.docs.map((d) => normalizeLesson(d.id, d.data()));
          }
          emit();
        },
        handleErr(OperationType.LIST, 'lessons')
      )
    );

    unsubs.push(
      onSnapshot(
        query(collection(db, 'knowledge_base'), where('status', '==', 'Published')),
        (snap) => {
          if (state.isLiveFirestore || !snap.empty) {
            state.knowledge_base = snap.docs.map((d) => normalizeKBGuide(d.id, d.data()));
          }
          emit();
        },
        handleErr(OperationType.LIST, 'knowledge_base')
      )
    );

    unsubs.push(
      onSnapshot(
        query(collection(db, 'digital_resources'), where('status', '==', 'Published')),
        (snap) => {
          if (state.isLiveFirestore || !snap.empty) {
            state.digital_resources = snap.docs.map((d) => normalizeResource(d.id, d.data()));
          }
          emit();
        },
        handleErr(OperationType.LIST, 'digital_resources')
      )
    );

    unsubs.push(
      onSnapshot(
        collection(db, 'media'),
        (snap) => {
          if (state.isLiveFirestore || !snap.empty) {
            state.media = snap.docs.map((d) => d.data() as MediaAsset);
          }
          emit();
        },
        handleErr(OperationType.LIST, 'media')
      )
    );

    return () => {
      unsubs.forEach((fn) => fn());
    };
  }

  /**
   * Real-time admin subscription to all CMS collections, plus owner-only collections
   * (admins, users, contact_inquiries) when signed in as the bootstrapped owner.
   */
  subscribeAdminSnapshot(
    isOwner: boolean,
    onUpdate: (snapshot: AdminDashboardSnapshot) => void,
    onError?: (errMsg: string) => void
  ): Unsubscribe {
    const snapshot = buildDefaultSnapshot();
    const emit = () => onUpdate({ ...snapshot });
    const unsubs: Unsubscribe[] = [];

    const qFor = (colName: string) =>
      isOwner
        ? collection(db, colName)
        : query(collection(db, colName), where('status', '==', 'Published'));

    const onSubErr = (col: string) => (err: unknown) => {
      if (isSparkQuotaError(err)) {
        onError?.(SPARK_QUOTA_USER_MESSAGE);
        return;
      }
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`Admin subscription error [${col}]:`, msg);
      onError?.(`Firestore sync warning (${col}): ${msg}`);
    };

    unsubs.push(
      onSnapshot(
        doc(db, 'website_settings', 'public'),
        (snap) => {
          if (snap.exists()) {
            snapshot.website_settings = normalizeWebsiteSettings(
              snap.data(),
              snapshot.website_settings
            );
          }
          emit();
        },
        onSubErr('website_settings')
      )
    );

    unsubs.push(
      onSnapshot(
        qFor('articles'),
        (snap) => {
          snapshot.articles = snap.docs.map((d) => normalizeArticle(d.id, d.data()));
          emit();
        },
        onSubErr('articles')
      )
    );

    unsubs.push(
      onSnapshot(
        qFor('awareness_posts'),
        (snap) => {
          snapshot.awareness_posts = snap.docs.map((d) => normalizeAwareness(d.id, d.data()));
          emit();
        },
        onSubErr('awareness_posts')
      )
    );

    unsubs.push(
      onSnapshot(
        qFor('courses'),
        (snap) => {
          snapshot.courses = snap.docs.map((d) => normalizeCourse(d.id, d.data()));
          emit();
        },
        onSubErr('courses')
      )
    );

    unsubs.push(
      onSnapshot(
        qFor('lessons'),
        (snap) => {
          snapshot.lessons = snap.docs.map((d) => normalizeLesson(d.id, d.data()));
          emit();
        },
        onSubErr('lessons')
      )
    );

    unsubs.push(
      onSnapshot(
        collection(db, 'quizzes'),
        (snap) => {
          snapshot.quizzes = snap.docs.map((d) => d.data() as AdminQuiz);
          emit();
        },
        onSubErr('quizzes')
      )
    );

    unsubs.push(
      onSnapshot(
        qFor('knowledge_base'),
        (snap) => {
          snapshot.knowledge_base = snap.docs.map((d) => normalizeKBGuide(d.id, d.data()));
          emit();
        },
        onSubErr('knowledge_base')
      )
    );

    unsubs.push(
      onSnapshot(
        qFor('digital_resources'),
        (snap) => {
          snapshot.digital_resources = snap.docs.map((d) => normalizeResource(d.id, d.data()));
          emit();
        },
        onSubErr('digital_resources')
      )
    );

    unsubs.push(
      onSnapshot(
        collection(db, 'media'),
        (snap) => {
          snapshot.media = snap.docs.map((d) => d.data() as MediaAsset);
          emit();
        },
        onSubErr('media')
      )
    );

    unsubs.push(
      onSnapshot(
        collection(db, 'categories'),
        (snap) => {
          if (!snap.empty) {
            snapshot.categories = snap.docs.map((d) => d.data() as CategoryItem);
          }
          emit();
        },
        onSubErr('categories')
      )
    );

    if (isOwner) {
      unsubs.push(
        onSnapshot(
          collection(db, 'admins'),
          (snap) => {
            snapshot.admins = snap.docs.map((d) => {
              const data = d.data();
              return {
                uid: d.id,
                displayName: String(data.displayName ?? ''),
                email: String(data.email ?? ''),
                role: (data.role as AdminUser['role']) ?? 'Content Editor',
                status: (data.status as AdminUser['status']) ?? 'Active',
                createdAt: formatFirestoreDate(data.createdAt),
                lastSignInAt: data.lastSignInAt ? String(data.lastSignInAt) : null,
              };
            });
            emit();
          },
          onSubErr('admins')
        )
      );

      unsubs.push(
        onSnapshot(
          collection(db, 'users'),
          (snap) => {
            snapshot.users = snap.docs.map((d) => {
              const data = d.data();
              return {
                id: d.id,
                name: String(data.name ?? ''),
                email: String(data.email ?? ''),
                role: (data.role as PlatformUser['role']) ?? 'Reader',
                status: (data.status as PlatformUser['status']) ?? 'Active',
                createdAt: formatFirestoreDate(data.createdAt),
              };
            });
            emit();
          },
          onSubErr('users')
        )
      );

      unsubs.push(
        onSnapshot(
          collection(db, 'contact_inquiries'),
          (snap) => {
            snapshot.contact_inquiries = snap.docs
              .map((d) => {
                const data = d.data();
                return {
                  id: d.id,
                  name: String(data.name ?? ''),
                  email: String(data.email ?? ''),
                  topic: String(data.topic ?? ''),
                  message: String(data.message ?? ''),
                  status: data.status === 'Reviewed' ? ('Reviewed' as const) : ('New' as const),
                  createdAt: formatFirestoreDate(data.createdAt),
                };
              })
              .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
            emit();
          },
          onSubErr('contact_inquiries')
        )
      );
    }

    return () => {
      unsubs.forEach((fn) => fn());
    };
  }

  // --- CRUD Operations ---

  async saveArticle(article: AdminArticle, isNew: boolean): Promise<void> {
    const path = `articles/${article.id}`;
    try {
      const payload = { ...article, updatedAt: serverTimestamp() };
      if (isNew) {
        await setDoc(doc(db, 'articles', article.id), payload);
      } else {
        await setDoc(doc(db, 'articles', article.id), payload, { merge: true });
      }
    } catch (err) {
      handleFirestoreError(err, isNew ? OperationType.CREATE : OperationType.UPDATE, path);
    }
  }

  async deleteArticle(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'articles', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `articles/${id}`);
    }
  }

  async saveAwareness(post: AdminAwarenessPost, isNew: boolean): Promise<void> {
    const path = `awareness_posts/${post.id}`;
    try {
      await setDoc(doc(db, 'awareness_posts', post.id), {
        ...post,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, isNew ? OperationType.CREATE : OperationType.UPDATE, path);
    }
  }

  async deleteAwareness(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'awareness_posts', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `awareness_posts/${id}`);
    }
  }

  async saveCourse(course: AdminCourse, isNew: boolean): Promise<void> {
    const path = `courses/${course.id}`;
    try {
      await setDoc(doc(db, 'courses', course.id), {
        ...course,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, isNew ? OperationType.CREATE : OperationType.UPDATE, path);
    }
  }

  async deleteCourse(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'courses', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `courses/${id}`);
    }
  }

  async saveLesson(lesson: AdminLesson, isNew: boolean): Promise<void> {
    const path = `lessons/${lesson.id}`;
    try {
      await setDoc(doc(db, 'lessons', lesson.id), {
        ...lesson,
        updatedAt: serverTimestamp(),
      });
      if (isNew && lesson.courseId) {
        const courseRef = doc(db, 'courses', lesson.courseId);
        const courseSnap = await getDoc(courseRef);
        if (courseSnap.exists()) {
          const existingIds = Array.isArray(courseSnap.data().lessonIds)
            ? (courseSnap.data().lessonIds as string[])
            : [];
          if (!existingIds.includes(lesson.id)) {
            await updateDoc(courseRef, {
              lessonIds: [...existingIds, lesson.id],
              updatedAt: serverTimestamp(),
            });
          }
        }
      }
    } catch (err) {
      handleFirestoreError(err, isNew ? OperationType.CREATE : OperationType.UPDATE, path);
    }
  }

  async deleteLesson(id: string, affectedCourses: AdminCourse[]): Promise<void> {
    try {
      await deleteDoc(doc(db, 'lessons', id));
      for (const c of affectedCourses) {
        if (c.lessonIds.includes(id)) {
          await updateDoc(doc(db, 'courses', c.id), {
            lessonIds: c.lessonIds.filter((lid) => lid !== id),
            updatedAt: serverTimestamp(),
          });
        }
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `lessons/${id}`);
    }
  }

  async saveKBGuide(guide: AdminKBGuide, isNew: boolean): Promise<void> {
    const path = `knowledge_base/${guide.id}`;
    try {
      await setDoc(doc(db, 'knowledge_base', guide.id), {
        ...guide,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, isNew ? OperationType.CREATE : OperationType.UPDATE, path);
    }
  }

  async deleteKBGuide(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'knowledge_base', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `knowledge_base/${id}`);
    }
  }

  async saveDigitalResource(res: AdminDigitalResource, isNew: boolean): Promise<void> {
    const path = `digital_resources/${res.id}`;
    try {
      const payload: Record<string, unknown> = {
        id: res.id,
        title: res.title,
        fileName: res.fileName,
        fileType: res.fileType,
        fileSizeBytes: res.fileSizeBytes,
        category: res.category,
        uploadDate: res.uploadDate,
        status: res.status,
        description: res.description,
      };
      if (res.content) payload.content = res.content;
      if (res.downloadUrl) payload.downloadUrl = res.downloadUrl;

      await setDoc(doc(db, 'digital_resources', res.id), payload);
    } catch (err) {
      handleFirestoreError(err, isNew ? OperationType.CREATE : OperationType.UPDATE, path);
    }
  }

  async deleteDigitalResource(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'digital_resources', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `digital_resources/${id}`);
    }
  }

  async saveMediaAsset(asset: MediaAsset, isNew: boolean): Promise<void> {
    const path = `media/${asset.id}`;
    try {
      await setDoc(doc(db, 'media', asset.id), asset);
    } catch (err) {
      handleFirestoreError(err, isNew ? OperationType.CREATE : OperationType.UPDATE, path);
    }
  }

  async deleteMediaAsset(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'media', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `media/${id}`);
    }
  }

  async saveWebsiteSettings(settings: WebsiteSettings): Promise<void> {
    const path = 'website_settings/public';
    try {
      await setDoc(doc(db, 'website_settings', 'public'), {
        ...settings,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  }

  async savePlatformUser(user: PlatformUser, isNew: boolean): Promise<void> {
    const path = `users/${user.id}`;
    try {
      if (isNew) {
        await setDoc(doc(db, 'users', user.id), {
          ...user,
          createdAt: serverTimestamp(),
        });
      } else {
        await updateDoc(doc(db, 'users', user.id), {
          name: user.name,
          role: user.role,
          status: user.status,
        });
      }
    } catch (err) {
      handleFirestoreError(err, isNew ? OperationType.CREATE : OperationType.UPDATE, path);
    }
  }

  async deletePlatformUser(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'users', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${id}`);
    }
  }

  async submitContactInquiry(input: {
    name: string;
    email: string;
    topic: string;
    message: string;
  }): Promise<void> {
    const id = `inq-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const path = `contact_inquiries/${id}`;
    try {
      await setDoc(doc(db, 'contact_inquiries', id), {
        name: input.name.trim(),
        email: input.email.trim(),
        topic: input.topic.trim(),
        message: input.message.trim(),
        status: 'New',
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  }

  async markInquiryReviewed(id: string, nextStatus: 'New' | 'Reviewed'): Promise<void> {
    const path = `contact_inquiries/${id}`;
    try {
      await updateDoc(doc(db, 'contact_inquiries', id), { status: nextStatus });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  }

  async deleteInquiry(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'contact_inquiries', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `contact_inquiries/${id}`);
    }
  }

  /**
   * Optimizes verified images in the browser to WebP (<= 160 KB) and stores them
   * directly inside Spark Cloud Firestore — ₹0 cost with no Blaze Storage required.
   */
  async uploadImageAsset(file: File): Promise<string> {
    return await compressImageToDataUrl(file, 160000);
  }

  /**
   * Processes verified learning resources strictly within the free Spark plan:
   * - Markdown / TXT / CSV files <= 90 KB are stored inline in Spark Firestore.
   * - Image diagrams are compressed cleanly to WebP <= 90 KB.
   * - Large binary PDFs should reference a free HTTPS URL (e.g., GitHub Releases / Google Drive)
   *   so zero paid Firebase Blaze Storage billing is ever required.
   */
  async uploadDigitalResourceFile(
    file: File
  ): Promise<{ downloadUrl?: string; content?: string }> {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';

    if (ext === 'md' || ext === 'txt' || ext === 'csv') {
      if (file.size > 90000) {
        throw new Error(
          `Text file "${file.name}" exceeds the 90 KB Spark Firestore inline limit. Keep study guides concise or provide a free external HTTPS URL.`
        );
      }
      const content = await file.text();
      return { content };
    }

    if (file.type.startsWith('image/')) {
      const dataUrl = await compressImageToDataUrl(file, 90000);
      return { downloadUrl: dataUrl };
    }

    throw new Error(
      `Direct binary upload for "${file.name}" requires Firebase Blaze storage (paid plan). To stay 100% free on Firebase Spark (₹0 cost), upload a .md/.txt/.csv guide or paste a free external HTTPS download link (GitHub Releases or Google Drive).`
    );
  }
}

async function compressImageToDataUrl(file: File, maxLength: number): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const maxDim = 960;
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Browser canvas unavailable for image fallback.');
  }
  ctx.drawImage(bitmap, 0, 0, width, height);

  let quality = 0.82;
  let dataUrl = canvas.toDataURL('image/webp', quality);
  while (dataUrl.length > maxLength && quality > 0.35) {
    quality -= 0.12;
    dataUrl = canvas.toDataURL('image/webp', quality);
  }
  if (dataUrl.length > maxLength) {
    throw new Error(
      'Image exceeds Firestore fallback size limit (160 KB) and Firebase Storage is unavailable.'
    );
  }
  return dataUrl;
}

export const adminDataRepository = new FirestoreAdminRepository();
