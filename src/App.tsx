import { useEffect, useState } from 'react';
import AboutAndContactSection from './components/AboutAndContactSection';
import AwarenessSection from './components/AwarenessSection';
import CoursesAndBlogSection from './components/CoursesAndBlogSection';
import Footer from './components/Footer';
import HeroSection from './components/HeroSection';
import KnowledgeBaseSection from './components/KnowledgeBaseSection';
import RealLifeTicketSection from './components/RealLifeTicketSection';
import RoadmapSection from './components/RoadmapSection';
import SolutionsAndResourcesSection from './components/SolutionsAndResourcesSection';
import TopBar from './components/TopBar';
import VirtualLabSection from './components/VirtualLabSection';
import { CAREER_ROADMAP, FREE_COURSES, REAL_LIFE_TICKETS } from './data/itData';

const STORAGE_TICKETS_KEY = 'three_angels_solved_tickets';
const STORAGE_MILESTONES_KEY = 'three_angels_completed_milestones';
const STORAGE_COURSE_MODULES_KEY = 'three_angels_completed_course_modules';

const VALID_TICKET_IDS = new Set(REAL_LIFE_TICKETS.map((t) => t.id));
const VALID_MILESTONE_IDS = new Set(
  CAREER_ROADMAP.flatMap((stage) => stage.milestones.map((m) => m.id))
);
const VALID_COURSE_MODULE_IDS = new Set(
  FREE_COURSES.flatMap((course) => course.modules.map((m) => m.id))
);

const SECTION_IDS = [
  'top',
  'awareness',
  'courses',
  'blog',
  'roadmap',
  'solutions',
  'resources',
  'kb',
  'lab',
  'tickets',
  'about',
  'contact',
];

function readValidatedIds(storageKey: string, allowedIds: Set<string>): string[] {
  try {
    const saved = localStorage.getItem(storageKey);
    if (!saved) return [];
    const parsed: unknown = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is string => typeof item === 'string' && allowedIds.has(item)
    );
  } catch {
    return [];
  }
}

export default function App() {
  const [activeSection, setActiveSection] = useState<string>('top');

  const [solvedTicketIds, setSolvedTicketIds] = useState<string[]>(() =>
    readValidatedIds(STORAGE_TICKETS_KEY, VALID_TICKET_IDS)
  );

  const [completedMilestones, setCompletedMilestones] = useState<string[]>(() =>
    readValidatedIds(STORAGE_MILESTONES_KEY, VALID_MILESTONE_IDS)
  );

  const [completedCourseModules, setCompletedCourseModules] = useState<string[]>(() =>
    readValidatedIds(STORAGE_COURSE_MODULES_KEY, VALID_COURSE_MODULE_IDS)
  );

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_TICKETS_KEY, JSON.stringify(solvedTicketIds));
    } catch {
      // Ignore storage quota errors
    }
  }, [solvedTicketIds]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_MILESTONES_KEY, JSON.stringify(completedMilestones));
    } catch {
      // Ignore storage quota errors
    }
  }, [completedMilestones]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_COURSE_MODULES_KEY,
        JSON.stringify(completedCourseModules)
      );
    } catch {
      // Ignore storage quota errors
    }
  }, [completedCourseModules]);

  // Lightweight IntersectionObserver scroll-spy for active nav indication
  useEffect(() => {
    const elements = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el !== null
    );
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) {
          setActiveSection(visible[0].target.id);
        }
      },
      { rootMargin: '-25% 0px -55% 0px', threshold: [0.1, 0.35] }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleNavigate = (sectionId: string) => {
    setActiveSection(sectionId);
    if (sectionId === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleMarkTicketSolved = (ticketId: string) => {
    setSolvedTicketIds((prev) => (prev.includes(ticketId) ? prev : [...prev, ticketId]));
  };

  const handleToggleMilestone = (milestoneId: string) => {
    setCompletedMilestones((prev) =>
      prev.includes(milestoneId)
        ? prev.filter((id) => id !== milestoneId)
        : [...prev, milestoneId]
    );
  };

  const handleToggleCourseModule = (moduleId: string) => {
    setCompletedCourseModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const handleResetProgress = () => {
    setSolvedTicketIds([]);
    setCompletedMilestones([]);
    setCompletedCourseModules([]);
    try {
      localStorage.removeItem(STORAGE_TICKETS_KEY);
      localStorage.removeItem(STORAGE_MILESTONES_KEY);
      localStorage.removeItem(STORAGE_COURSE_MODULES_KEY);
    } catch {
      // Ignore
    }
  };

  const totalMilestones = CAREER_ROADMAP.reduce(
    (sum, stage) => sum + stage.milestones.length,
    0
  );

  return (
    <div className="min-h-screen bg-[#0B1220] text-[#F8FAFC]">
      <TopBar activeSection={activeSection} onNavigate={handleNavigate} />

      <main>
        <HeroSection
          solvedTicketsCount={solvedTicketIds.length}
          totalTicketsCount={REAL_LIFE_TICKETS.length}
          completedMilestonesCount={completedMilestones.length}
          totalMilestonesCount={totalMilestones}
          onNavigate={handleNavigate}
        />

        <AwarenessSection />

        <CoursesAndBlogSection
          completedCourseModules={completedCourseModules}
          onToggleCourseModule={handleToggleCourseModule}
          onNavigate={handleNavigate}
        />

        <RoadmapSection
          completedMilestones={completedMilestones}
          onToggleMilestone={handleToggleMilestone}
          onNavigate={handleNavigate}
        />

        <SolutionsAndResourcesSection onNavigate={handleNavigate} />

        <KnowledgeBaseSection />

        <VirtualLabSection />

        <RealLifeTicketSection
          solvedTicketIds={solvedTicketIds}
          onMarkSolved={handleMarkTicketSolved}
        />

        <AboutAndContactSection />
      </main>

      <Footer onNavigate={handleNavigate} onResetProgress={handleResetProgress} />
    </div>
  );
}
