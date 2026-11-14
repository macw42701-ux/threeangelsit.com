export type PublicationStatus = 'Published' | 'Draft';

export interface AdminUser {
  uid: string;
  displayName: string;
  email: string;
  role: 'Super Admin' | 'Content Editor' | 'Support Reviewer';
  createdAt: string;
  lastSignInAt: string | null;
  status: 'Active' | 'Pending Invite' | 'Suspended';
}

export interface PlatformUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  status: 'Active' | 'Invited' | 'Disabled';
  role: 'Super Admin' | 'Editor' | 'Instructor' | 'Reader';
}

export interface CategoryItem {
  id: string;
  name: string;
  scope: 'blog' | 'awareness' | 'course' | 'knowledge_base' | 'resource' | 'media';
  slug: string;
}

export interface AdminArticle {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  featuredImage: string;
  author: string;
  category: string;
  tags: string[];
  seoTitle: string;
  seoDescription: string;
  status: PublicationStatus;
  publishedDate: string;
  featured: boolean;
  updatedAt: string;
}

export type AwarenessCategory =
  | 'Cybersecurity'
  | 'Online Safety'
  | 'Password Security'
  | 'Email Security'
  | 'Digital Privacy'
  | 'Scam Awareness'
  | 'Safe Internet Usage';

export interface AdminAwarenessPost {
  id: string;
  weekLabel: string;
  title: string;
  category: AwarenessCategory;
  summary: string;
  imageUrl: string;
  cybersecurityTips: string[];
  digitalSafetyGuidance: string[];
  weeklyContent: string;
  status: PublicationStatus;
  updatedAt: string;
}

export type CourseCategory =
  | 'Computer Fundamentals'
  | 'Networking'
  | 'Windows'
  | 'Linux'
  | 'Cybersecurity'
  | 'Cloud Computing'
  | 'Hardware and Troubleshooting'
  | 'Programming'
  | 'IT Helpdesk'
  | 'System Administration';

export interface AdminCourse {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  category: CourseCategory;
  learningObjectives: string[];
  lessonIds: string[];
  materialIds: string[];
  duration: string;
  status: PublicationStatus;
  updatedAt: string;
}

export interface QuizQuestionDraft {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
}

export interface AdminQuiz {
  id: string;
  lessonId: string;
  questions: QuizQuestionDraft[];
}

export interface AdminLesson {
  id: string;
  courseId: string;
  title: string;
  description: string;
  content: string;
  videoUrl: string;
  pdfResourceIds: string[];
  practicalExercise: string;
  quizQuestions: QuizQuestionDraft[];
  sequence: number;
  status: PublicationStatus;
  updatedAt: string;
}

export type KBCategory =
  | 'Networking'
  | 'Windows Support'
  | 'Linux Support'
  | 'Hardware'
  | 'Software'
  | 'Email Problems'
  | 'Printer Problems'
  | 'Cybersecurity'
  | 'IT Infrastructure';

export interface AdminKBGuide {
  id: string;
  title: string;
  category: KBCategory;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  keywords: string[];
  diagramUrl: string;
  steps: string[];
  commands: string[];
  status: PublicationStatus;
  updatedAt: string;
}

export interface AdminDigitalResource {
  id: string;
  title: string;
  fileName: string;
  fileType: string;
  fileSizeBytes: number;
  category: string;
  uploadDate: string;
  status: PublicationStatus;
  description: string;
  content?: string;
  downloadUrl?: string;
}

export interface AdminContactInquiry {
  id: string;
  name: string;
  email: string;
  topic: string;
  message: string;
  status: 'New' | 'Reviewed';
  createdAt: string;
}

export interface MediaAsset {
  id: string;
  title: string;
  description: string;
  altText: string;
  category: string;
  fileName: string;
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp';
  sizeBytes: number;
  url: string;
  uploadedAt: string;
}

export interface HomepageContentConfig {
  mainHeading: string;
  description: string;
  heroBannerImage: string;
  primaryButtonText: string;
  secondaryButtonText: string;
  featuredCourseIds: string[];
  featuredArticleIds: string[];
  awarenessSectionHeading: string;
  awarenessSectionSummary: string;
  solutionsSectionHeading: string;
  solutionsSectionSummary: string;
  announcementText: string;
  announcementEnabled: boolean;
  updatedAt: string;
}

export interface MenuNavItem {
  id: string;
  label: string;
  url: string;
  enabled: boolean;
  order: number;
  protectedSystem: boolean;
}

export interface SeoSettings {
  pageTitle: string;
  metaDescription: string;
  keywords: string[];
  canonicalUrl: string;
  socialImage: string;
  socialImageAlt: string;
  robotsIndex: boolean;
  robotsFollow: boolean;
  sitemapPaths: string[];
}

export interface WebsiteSettings {
  companyName: string;
  tagline: string;
  supportNote: string;
  openAccessEnabled: boolean;
  homepage: HomepageContentConfig;
  menuItems: MenuNavItem[];
  seo: SeoSettings;
  updatedAt: string;
}

export interface AdminActivityEntry {
  id: string;
  action: string;
  collection: string;
  targetTitle: string;
  timestamp: string;
  mode: 'Live Firestore' | 'Local Seed';
}

export interface AdminDashboardSnapshot {
  admins: AdminUser[];
  users: PlatformUser[];
  articles: AdminArticle[];
  categories: CategoryItem[];
  courses: AdminCourse[];
  lessons: AdminLesson[];
  quizzes: AdminQuiz[];
  awareness_posts: AdminAwarenessPost[];
  knowledge_base: AdminKBGuide[];
  digital_resources: AdminDigitalResource[];
  media: MediaAsset[];
  contact_inquiries: AdminContactInquiry[];
  website_settings: WebsiteSettings;
  activity: AdminActivityEntry[];
}
