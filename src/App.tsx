import { useCallback, useState } from "react";
import type {
  PrivateRouteTrackingState,
  PrivateWorkspaceSummary,
  RoleLeadPrefill,
  RoleLeadPrefillData,
} from "./components/workspace.types";
import type { validateWorkspaceData } from "./lib/private-data/schema.mjs";
import { getNavItem, NAV_ITEMS } from "./lib/navigation.mjs";
import { FEATURES, isRoleExplorerEnabled } from "./config/features.mjs";
import PrivateDataSettings from "./components/PrivateDataSettings";
import StudioCatalog from "./components/StudioCatalog";
import SpeculativeRouteDirectory from "./components/SpeculativeRouteDirectory";
import ResumeLab from "./components/ResumeLab";
import { STUDIO_PROFILES } from "./lib/studios/catalog.mjs";
import { IS_SYNTHETIC_SNAPSHOT, OPPORTUNITY_SNAPSHOT } from "./lib/opportunities/snapshot.mjs";

type WorkspaceProfile = ReturnType<typeof validateWorkspaceData>["profile"];

const pageRoadmap: Record<string, string> = {
  studios: "Studio research",
  resume: "Resume review",
  outreach: "Drafting",
  applications: "Follow-up tracking",
  settings: "Workspace settings",
};

const iconPaths: Record<string, string> = {
  overview: "M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z",
  studios: "M3 21h18 M5 21V7l7-4 7 4v14 M9 21v-6h6v6 M9 9h.01 M15 9h.01",
  resume: "M8 3h7l5 5v13H4V3z M14 3v6h6 M8 13h8 M8 17h8",
  outreach: "M3 5h18v14H3z M3 6l9 7 9-7",
  applications: "M8 3h8 M9 3v4h6V3 M5 5h14v16H5z M8 13l2 2 5-5",
  settings:
    "M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z M19 12a7 7 0 0 0-.2-1.6l1.5-1.1-1.5-2.6-1.8.6a7 7 0 0 0-2.8-1.6L14 3.8h-3l-.3 1.9a7 7 0 0 0-2.8 1.6l-1.8-.6-1.5 2.6 1.5 1.1a7 7 0 0 0 0 3.2l-1.5 1.1 1.5 2.6 1.8-.6a7 7 0 0 0 2.8 1.6l.3 1.9h3l.3-1.9a7 7 0 0 0 2.8-1.6l1.8.6 1.5-2.6-1.5-1.1A7 7 0 0 0 19 12z",
  spark: "m12 3 1.9 5.9L20 11l-6.1 2.1L12 19l-1.9-5.9L4 11l6.1-2.1L12 3z",
  arrow: "M5 12h14 M13 6l6 6-6 6",
  search: "M20 20l-4.5-4.5 M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0z",
};

function Icon({ name, size = 18 }: { name: string; size?: number }) {
  return (
    <svg
      aria-hidden="true"
      className="icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={iconPaths[name] ?? iconPaths.spark} />
    </svg>
  );
}

function StatCard({
  label,
  detail,
  icon,
  value = "—",
}: {
  label: string;
  detail: string;
  icon: string;
  value?: string;
}) {
  return (
    <article className="stat-card">
      <div className="stat-icon">
        <Icon name={icon} size={19} />
      </div>
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value}</p>
      <p className="stat-detail">{detail}</p>
    </article>
  );
}

export function OverviewPage({
  onNavigate,
  workspaceSummary,
  roleExplorerEnabled = isRoleExplorerEnabled(),
}: {
  onNavigate: (pageId: string) => void;
  workspaceSummary: PrivateWorkspaceSummary | null;
  roleExplorerEnabled?: boolean;
}) {
  return (
    <div className="page-stack">
      <section className="welcome-card">
        <div className="welcome-copy">
          <span className="eyebrow">YOUR NEXT CHAPTER</span>
          <h2>Make the next move with intention.</h2>
          <p>
            Build a worldwide, evidence-backed directory of video-game studios that explicitly accept speculative
            applications. Review the official source, prepare a thoughtful introduction, and track your next steps
            privately.
          </p>
          <button className="button button-primary" onClick={() => onNavigate("studios")}>
            Explore speculative applications
            <Icon name="arrow" size={16} />
          </button>
        </div>
        <div className="welcome-mark" aria-hidden="true">
          <div className="mark-ring mark-ring-outer" />
          <div className="mark-ring mark-ring-inner" />
          <Icon name="spark" size={35} />
        </div>
      </section>

      <section aria-labelledby="activity-title" className="section-block">
        <div className="section-heading">
          <div>
            <span className="eyebrow">YOUR WORKSPACE</span>
            <h2 id="activity-title">The big picture</h2>
          </div>
          <span className="muted-note">
            {workspaceSummary ? "Live totals · unlocked vault" : "Private totals hidden"}
          </span>
        </div>
        <div className="stats-grid">
          <StatCard
            label="Studios"
            detail="Manually sourced in the catalogue"
            icon="studios"
            value={String(STUDIO_PROFILES.length)}
          />
          {roleExplorerEnabled ? (
            <StatCard
              label="Opportunities"
              detail={
                OPPORTUNITY_SNAPSHOT
                  ? `${OPPORTUNITY_SNAPSHOT.opportunities.length} role links last seen in the snapshot; not proof a role is open${IS_SYNTHETIC_SNAPSHOT ? " · sample data, not a real scan" : ""}`
                  : "Snapshot validation failed; open Studios & roles for the error state"
              }
              icon="search"
              value={OPPORTUNITY_SNAPSHOT ? String(OPPORTUNITY_SNAPSHOT.opportunities.length) : "—"}
            />
          ) : null}
          <StatCard
            label="Outreach drafts"
            detail={
              workspaceSummary ? "Saved versions in your unlocked vault" : "Unlock Settings to view private totals"
            }
            icon="outreach"
            value={workspaceSummary ? String(workspaceSummary.draftCount) : "—"}
          />
          <StatCard
            label="Applications"
            detail={
              workspaceSummary
                ? workspaceSummary.dueFollowUpCount + " follow-up(s) due"
                : "Unlock Settings to view private totals"
            }
            icon="applications"
            value={workspaceSummary ? String(workspaceSummary.applicationCount) : "—"}
          />
        </div>
      </section>

      <section className="next-steps-card" aria-labelledby="next-steps-title">
        <div className="section-heading">
          <div>
            <span className="eyebrow">BUILT IN PHASES</span>
            <h2 id="next-steps-title">Your workflow, step by step</h2>
          </div>
        </div>
        <div className="roadmap-list">
          <div className="roadmap-item">
            <span className="roadmap-number">01</span>
            <div>
              <h3>Discover studios</h3>
              <p>
                Find official routes that explicitly welcome speculative applications; generic careers pages do not
                qualify.
              </p>
            </div>
            <span className="roadmap-phase">Research</span>
          </div>
          <div className="roadmap-item">
            <span className="roadmap-number">02</span>
            <div>
              <h3>Tailor your resume</h3>
              <p>Prepare a factual resume tailored to the studio and discipline you want to approach.</p>
            </div>
            <span className="roadmap-phase">Review</span>
          </div>
          <div className="roadmap-item">
            <span className="roadmap-number">03</span>
            <div>
              <h3>Prepare your application</h3>
              <p>Create a clear, personal introduction and track the outcome yourself.</p>
            </div>
            <span className="roadmap-phase">Reach out</span>
          </div>
        </div>
      </section>
      <p className="privacy-footnote">
        A route is marked verified only after its official page is checked for an explicit speculative-application
        invitation with no specific advertised job or deadline. Private candidate records are encrypted in this browser
        and are never synced to a server.
      </p>
    </div>
  );
}

function PlaceholderPage({ pageId, onNavigate }: { pageId: string; onNavigate: (pageId: string) => void }) {
  const item = getNavItem(pageId);
  return (
    <section className="placeholder-card">
      <div className="placeholder-icon">
        <Icon name={item.icon} size={25} />
      </div>
      <span className="eyebrow">PLANNED FEATURE · {pageRoadmap[pageId] ?? "LATER PHASES"}</span>
      <h2>{item.label}</h2>
      <p>{item.description}</p>
      <div className="placeholder-note">
        <Icon name="spark" size={17} />
        <span>
          This section is a navigation placeholder for now. No records are stored or processed by this screen yet.
        </span>
      </div>
      <button className="button button-secondary" onClick={() => onNavigate("overview")}>
        Back to overview
      </button>
    </section>
  );
}

export default function App({ features = FEATURES }: { features?: typeof FEATURES } = {}) {
  const roleExplorerEnabled = isRoleExplorerEnabled(features);
  const [activePageId, setActivePageId] = useState("overview");
  const [resumeProfile, setResumeProfile] = useState<WorkspaceProfile | null>(null);
  const [workspaceSummary, setWorkspaceSummary] = useState<PrivateWorkspaceSummary | null>(null);
  const [routeTracking, setRouteTracking] = useState<PrivateRouteTrackingState | null>(null);
  const [pendingLead, setPendingLead] = useState<RoleLeadPrefill | null>(null);
  const consumePendingLead = useCallback(() => setPendingLead(null), []);
  const handleTrackAsLead = useCallback((lead: RoleLeadPrefillData) => {
    setPendingLead({ ...lead, requestId: crypto.randomUUID() });
    setActivePageId("applications");
  }, []);
  const activeItem = getNavItem(activePageId);
  const isOverview = activeItem.id === "overview";

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <Icon name="spark" size={20} />
          </div>
          <div>
            <span className="brand-name">Studio Outreach</span>
            <span className="brand-caption">PERSONAL WORKSPACE</span>
          </div>
        </div>
        <nav aria-label="Main navigation" className="main-navigation">
          <span className="nav-section-label">WORKSPACE</span>
          {NAV_ITEMS.map((item) => {
            const active = activeItem.id === item.id;
            return (
              <button
                aria-current={active ? "page" : undefined}
                className={active ? "nav-link nav-link-active" : "nav-link"}
                key={item.id}
                onClick={() => setActivePageId(item.id)}
                type="button"
              >
                <Icon name={item.icon} />
                <span>{item.label}</span>
                {active ? <span className="nav-active-dot" /> : null}
              </button>
            );
          })}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-status">
            <span className="status-dot" />
            <span>Local-first workspace</span>
          </div>
          <p>Built around evidence, privacy, and human control.</p>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div>
            <p className="breadcrumb">
              Workspace <span>/</span> {activeItem.label}
            </p>
            <h1>{isOverview ? "Your workspace" : activeItem.label}</h1>
            <p className="page-description">{activeItem.description}</p>
          </div>
          <span className="phase-badge">
            <span className="phase-badge-dot" />
            Private data stays in this browser
          </span>
        </header>
        <div className="page-content">
          <div
            hidden={!["settings", "outreach", "applications"].includes(activeItem.id)}
            data-testid="private-data-settings-host"
          >
            <PrivateDataSettings
              activePageId={activeItem.id}
              onNavigate={setActivePageId}
              onProfileChange={setResumeProfile}
              onWorkspaceSummaryChange={setWorkspaceSummary}
              onRouteTrackingStateChange={setRouteTracking}
              initialLead={pendingLead}
              onLeadPrefillConsumed={consumePendingLead}
            />
          </div>
          {isOverview ? (
            <OverviewPage
              onNavigate={setActivePageId}
              workspaceSummary={workspaceSummary}
              roleExplorerEnabled={roleExplorerEnabled}
            />
          ) : activeItem.id === "studios" ? (
            <>
              <SpeculativeRouteDirectory
                routeTracking={routeTracking}
                onOpenSettings={() => setActivePageId("settings")}
              />
              <StudioCatalog
                profile={resumeProfile}
                onTrackAsLead={handleTrackAsLead}
                onOpenSettings={() => setActivePageId("settings")}
                features={features}
              />
            </>
          ) : activeItem.id === "resume" ? (
            <ResumeLab profile={resumeProfile} />
          ) : ["settings", "outreach", "applications"].includes(activeItem.id) ? null : (
            <PlaceholderPage pageId={activePageId} onNavigate={setActivePageId} />
          )}
        </div>
        <footer className="app-footer">
          <span>Studio Outreach</span>
          <span>Build carefully. Keep control.</span>
        </footer>
      </main>
    </div>
  );
}
