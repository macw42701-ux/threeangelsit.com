import { useEffect, useState } from 'react';
import AwarenessSection from './components/AwarenessSection';
import Footer from './components/Footer';
import HeroSection from './components/HeroSection';
import KnowledgeBaseSection from './components/KnowledgeBaseSection';
import RealLifeTicketSection from './components/RealLifeTicketSection';
import RoadmapSection from './components/RoadmapSection';
import TopBar from './components/TopBar';
import VirtualLabSection from './components/VirtualLabSection';
import { CAREER_ROADMAP, REAL_LIFE_TICKETS } from './data/itData';

const STORAGE_TICKETS_KEY = 'three_angels_solved_tickets';
const STORAGE_MILESTONES_KEY = 'three_angels_completed_milestones';

const VALID_TICKET_IDS = new Set(REAL_LIFE_TICKETS.map((t) => t.id));
const VALID_MILESTONE_IDS = new Set(
  CAREER_ROADMAP.flatMap((stage) => stage.milestones.map((m) => m.id))
);

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
  const [solvedTicketIds, setSolvedTicketIds] = useState<string[]>(() =>
    readValidatedIds(STORAGE_TICKETS_KEY, VALID_TICKET_IDS)
  );

  const [completedMilestones, setCompletedMilestones] = useState<string[]>(() =>
    readValidatedIds(STORAGE_MILESTONES_KEY, VALID_MILESTONE_IDS)
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

  const handleNavigate = (sectionId: string) => {
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

  const handleResetProgress = () => {
    setSolvedTicketIds([]);
    setCompletedMilestones([]);
    try {
      localStorage.removeItem(STORAGE_TICKETS_KEY);
      localStorage.removeItem(STORAGE_MILESTONES_KEY);
    } catch {
      // Ignore
    }
  };

  const totalMilestones = CAREER_ROADMAP.reduce((sum, stage) => sum + stage.milestones.length, 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <TopBar onNavigate={handleNavigate} />

      <main>
        <HeroSection
          solvedTicketsCount={solvedTicketIds.length}
          totalTicketsCount={REAL_LIFE_TICKETS.length}
          completedMilestonesCount={completedMilestones.length}
          totalMilestonesCount={totalMilestones}
          onNavigate={handleNavigate}
        />

        <RealLifeTicketSection
          solvedTicketIds={solvedTicketIds}
          onMarkSolved={handleMarkTicketSolved}
        />

        <VirtualLabSection />

        <AwarenessSection />

        <RoadmapSection
          completedMilestones={completedMilestones}
          onToggleMilestone={handleToggleMilestone}
          onNavigate={handleNavigate}
        />

        <KnowledgeBaseSection />
      </main>

      <Footer onNavigate={handleNavigate} onResetProgress={handleResetProgress} />
    </div>
  );
}
