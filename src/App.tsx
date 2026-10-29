import { useCallback, useState } from "react";
import type { RoleLeadPrefill, RoleLeadPrefillData } from "./components/workspace.types";
import PrivateDataSettings from "./components/PrivateDataSettings";
import SpeculativeRouteDirectory from "./components/SpeculativeRouteDirectory";
import { getNavItem, NAV_ITEMS } from "./lib/navigation.mjs";

const iconPaths: Record<string, string> = {
  studios: "M3 21h18 M5 21V7l7-4 7 4v14 M9 21v-6h6v6 M9 9h.01 M15 9h.01",
  applications: "M8 3h8 M9 3v4h6V3 M5 5h14v16H5z M8 13l2 2 5-5",
  settings:
    "M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z M19 12a7 7 0 0 0-.2-1.6l1.5-1.1-1.5-2.6-1.8.6a7 7 0 0 0-2.8-1.6L14 3.8h-3l-.3 1.9a7 7 0 0 0-2.8 1.6l-1.8-.6-1.5 2.6 1.5 1.1a7 7 0 0 0 0 3.2l-1.5 1.1 1.5 2.6 1.8-.6a7 7 0 0 0 2.8 1.6l.3 1.9h3l.3-1.9a7 7 0 0 0 2.8-1.6l1.8.6 1.5-2.6-1.5-1.1A7 7 0 0 0 19 12z",
  spark: "m12 3 1.9 5.9L20 11l-6.1 2.1L12 19l-1.9-5.9L4 11l6.1-2.1L12 3z",
  arrow: "M5 12h14 M13 6l6 6-6 6",
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

const VISIBLE_NAV_IDS = new Set(["studios", "applications", "settings"]);

export default function App() {
  const [activePageId, setActivePageId] = useState("studios");
  const [pendingLead, setPendingLead] = useState<RoleLeadPrefill | null>(null);
  const consumePendingLead = useCallback(() => setPendingLead(null), []);
  const handleProfileChange = useCallback(() => undefined, []);
  const handleTrackRoute = useCallback((lead: RoleLeadPrefillData) => {
    setPendingLead({ ...lead, requestId: crypto.randomUUID() });
    setActivePageId("applications");
  }, []);

  const activeItem = getNavItem(activePageId);
  const navItems = NAV_ITEMS.filter((item) => VISIBLE_NAV_IDS.has(item.id));

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <Icon name="spark" size={20} />
          </div>
          <div>
            <span className="brand-name">Studio Outreach</span>
            <span className="brand-caption">SPECULATIVE APPLICATION TRACKER</span>
          </div>
        </div>

        <nav aria-label="Main navigation" className="main-navigation">
          <span className="nav-section-label">WORKSPACE</span>
          {navItems.map((item) => {
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
          <p>Find official routes. Apply manually. Track the progress privately.</p>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div>
            <p className="breadcrumb">
              Workspace <span>/</span> {activeItem.label}
            </p>
            <h1>{activeItem.label}</h1>
            <p className="page-description">{activeItem.description}</p>
          </div>
          <span className="phase-badge">
            <span className="phase-badge-dot" />
            Private tracker stays in this browser
          </span>
        </header>

        <div className="page-content">
          <div
            hidden={!["settings", "applications"].includes(activeItem.id)}
            data-testid="private-data-settings-host"
          >
            <PrivateDataSettings
              activePageId={activeItem.id}
              onNavigate={setActivePageId}
              onProfileChange={handleProfileChange}
              initialLead={pendingLead}
              onLeadPrefillConsumed={consumePendingLead}
            />
          </div>
          {activeItem.id === "studios" ? <SpeculativeRouteDirectory onTrackRoute={handleTrackRoute} /> : null}
        </div>

        <footer className="app-footer">
          <span>Studio Outreach</span>
          <span>Official routes · Manual applications · Private tracking</span>
        </footer>
      </main>
    </div>
  );
}
