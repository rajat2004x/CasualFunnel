import { useEffect, useMemo, useState } from 'react';

import { BrowserRouter, Link, NavLink, Route, Routes, useParams } from 'react-router-dom';

import {
  Activity,
  ArrowLeft,
  BarChart3,
  ExternalLink,
  Flame,
  LayoutDashboard,
  MousePointer2,
  PanelLeft,
  Users
} from 'lucide-react';

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

import {
  getHeatmap,
  getPages,
  getSessionEvents,
  getSessions,
  getSummary
} from './services/api';


const errorText = (error) =>
  error?.response?.data?.message || 'Unable to load analytics data.';

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleString([], {
        dateStyle: 'medium',
        timeStyle: 'short'
      })
    : '—';

const formatTime = (value) =>
  value
    ? new Date(value).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })
    : '—';


function LoadState({ loading, error, empty, children }) {
  if (loading) {
    return (
      <div className="state-card">
        <Activity className="animate-pulse text-cyan-300" />
        <p>Loading analytics…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="state-card border-rose-400/30">
        <p className="text-rose-300">{error}</p>
      </div>
    );
  }

  if (empty) {
    return (
      <div className="state-card">
        <BarChart3 className="text-slate-500" />
        <p>
          No data yet. Open the demo store and interact with it to generate
          analytics.
        </p>
      </div>
    );
  }

  return children;
}


function Layout({ children }) {
  const links = [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/sessions', label: 'Sessions', icon: Users },
    { to: '/heatmap', label: 'Heatmap', icon: Flame }
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link to="/dashboard" className="side-brand">
          <span className="brand-mark">CF</span>
          <span>CausalFunnel</span>
        </Link>

        <div className="side-caption">Workspace</div>

        <nav className="side-nav">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `side-link ${isActive ? 'active' : ''}`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="side-footer">
          <div className="status-dot" />
          API connected when MongoDB is available
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="mobile-brand">
            <PanelLeft size={18} /> CausalFunnel
          </div>

          <div className="topbar-meta">
            Product analytics
            <span className="topbar-divider" />
            Local workspace
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}


function MetricCard({ label, value, icon: Icon, accent }) {
  return (
    <div className="metric-card">
      <div className={`metric-icon ${accent}`}>
        <Icon size={19} />
      </div>

      <div>
        <p>{label}</p>
        <strong>{value.toLocaleString()}</strong>
      </div>
    </div>
  );
}


function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getSummary(), getSessions()])
      .then(([data, sessionData]) => {
        setSummary(data);
        setSessions(sessionData);
      })
      .catch((e) => setError(errorText(e)));
  }, []);

  const chartData = useMemo(
    () =>
      sessions
        .slice(0, 10)
        .reverse()
        .map((session) => ({
          name: formatTime(session.lastEventAt),
          events: session.eventCount
        })),
    [sessions]
  );

  return (
    <Page title="Overview" eyebrow="Workspace snapshot">
      <LoadState loading={!summary} error={error} empty={false}>
        <div className="metric-grid">
          <MetricCard
            label="Total sessions"
            value={summary?.totalSessions ?? 0}
            icon={Users}
            accent="violet"
          />

          <MetricCard
            label="Total events"
            value={summary?.totalEvents ?? 0}
            icon={Activity}
            accent="cyan"
          />

          <MetricCard
            label="Page views"
            value={summary?.totalPageViews ?? 0}
            icon={ExternalLink}
            accent="amber"
          />

          <MetricCard
            label="Clicks"
            value={summary?.totalClicks ?? 0}
            icon={MousePointer2}
            accent="rose"
          />
        </div>

        <section className="panel chart-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Activity</p>
              <h2>Events over recent sessions</h2>
            </div>

            <span className="muted-label">Latest 10 sessions</span>
          </div>

          {chartData.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient
                    id="eventFill"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#22d3ee"
                      stopOpacity={0.35}
                    />
                    <stop
                      offset="100%"
                      stopColor="#22d3ee"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  stroke="#253044"
                  vertical={false}
                />

                <XAxis
                  dataKey="name"
                  stroke="#718096"
                  tickLine={false}
                  axisLine={false}
                />

                <YAxis
                  stroke="#718096"
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />

                <Tooltip
                  contentStyle={{
                    background: '#111827',
                    border: '1px solid #334155',
                    borderRadius: 10
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="events"
                  stroke="#22d3ee"
                  fill="url(#eventFill)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">
              No activity yet. Generate events from the demo store to see the
              trend.
            </div>
          )}
        </section>
      </LoadState>
    </Page>
  );
}


function Sessions() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getSessions()
      .then(setItems)
      .catch((e) => setError(errorText(e)));
  }, []);

  return (
    <Page title="Sessions" eyebrow="User activity">
      <LoadState
        loading={items === null}
        error={error}
        empty={!items?.length}
      >
        <div className="panel table-wrap">
          <table>
            <thead>
              <tr>
                <th>Session ID</th>
                <th>Events</th>
                <th>First activity</th>
                <th>Last activity</th>
                <th />
              </tr>
            </thead>

            <tbody>
              {items?.map((session) => (
                <tr key={session.sessionId}>
                  <td>
                    <Link
                      className="session-link"
                      to={`/sessions/${encodeURIComponent(
                        session.sessionId
                      )}`}
                    >
                      {session.sessionId}
                    </Link>
                  </td>

                  <td>{session.eventCount}</td>

                  <td>{formatDate(session.firstEventAt)}</td>

                  <td>{formatDate(session.lastEventAt)}</td>

                  <td>
                    <ArrowLeft
                      className="rotate-180 text-slate-500"
                      size={16}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </LoadState>
    </Page>
  );
}


function SessionDetails() {
  const { sessionId } = useParams();

  const [events, setEvents] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getSessionEvents(sessionId)
      .then(setEvents)
      .catch((e) => setError(errorText(e)));
  }, [sessionId]);

  return (
    <Page title="Session journey" eyebrow={sessionId}>
      <Link to="/sessions" className="back-link">
        <ArrowLeft size={15} /> Back to sessions
      </Link>

      <LoadState
        loading={events === null}
        error={error}
        empty={!events?.length}
      >
        <div className="timeline">
          {events?.map((event, index) => (
            <div
              className="timeline-item"
              key={`${event.timestamp}-${index}`}
            >
              <div
                className={`timeline-icon ${
                  event.type === 'click' ? 'click' : 'view'
                }`}
              >
                {event.type === 'click' ? (
                  <MousePointer2 size={16} />
                ) : (
                  <ExternalLink size={16} />
                )}
              </div>

              <div className="timeline-card">
                <div className="timeline-title">
                  <span>
                    {event.type === 'click' ? 'CLICK' : 'PAGE VIEW'}
                  </span>

                  <time>{formatDate(event.timestamp)}</time>
                </div>

                <p className="url-text">{event.pageUrl}</p>

                {event.coordinates && (
                  <p className="coordinate-text">
                    x: {event.coordinates.x} · y: {event.coordinates.y}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </LoadState>
    </Page>
  );
}


function Heatmap() {
  const [pages, setPages] = useState(null);
  const [selected, setSelected] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getPages()
      .then((items) => {
        setPages(items);

        if (items[0]) {
          setSelected(items[0]);
        }
      })
      .catch((e) => setError(errorText(e)));
  }, []);

  useEffect(() => {
    if (selected) {
      getHeatmap(selected)
        .then(setData)
        .catch((e) => setError(errorText(e)));
    }
  }, [selected]);

  return (
    <Page title="Heatmap" eyebrow="Click behavior">
      <LoadState
        loading={pages === null}
        error={error}
        empty={!pages?.length}
      >
        <div className="heatmap-toolbar">
          <label htmlFor="page-select">Page preview</label>

          <select
            id="page-select"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            {pages?.map((page) => (
              <option key={page}>{page}</option>
            ))}
          </select>

          <span className="click-count">
            {data?.clicks?.length ?? 0} clicks
          </span>
        </div>

        <LoadState
          loading={data === null}
          error={error}
          empty={false}
        >
          <div className="heatmap-layout">
            <div className="heatmap-preview">
              <div className="preview-browser">
                <span />
                <span />
                <span />
              </div>

              <div className="preview-nav">
                Northstar Goods
                <span>Home &nbsp; Products &nbsp; Cart</span>
              </div>

              <div className="preview-hero">
                <small>FEATURED COLLECTION</small>
                <b>
                  Make space
                  <br />
                  for what matters.
                </b>
                <i />
              </div>

              <div className="preview-lines">
                <span />
                <span />
                <span />
                <span />
              </div>

              {data?.clicks?.map((click, index) => (
                <span
                  key={`${click.timestamp}-${index}`}
                  className="heat-dot"
                  style={{
                    left: `${Math.min(
                      96,
                      Math.max(
                        4,
                        (click.coordinates.x / 1440) * 100
                      )
                    )}%`,
                    top: `${Math.min(
                      94,
                      Math.max(
                        8,
                        (click.coordinates.y / 900) * 100
                      )
                    )}%`
                  }}
                  title={`${click.coordinates.x}, ${click.coordinates.y}`}
                />
              ))}
            </div>

            <div className="heatmap-legend">
              <h3>Click distribution</h3>

              <p>
                Points are normalized from browser viewport coordinates onto
                this representative page preview.
              </p>

              <div className="legend-item">
                <span className="legend-dot" /> Individual click
              </div>

              <div className="legend-stat">
                <strong>{data?.clicks?.length ?? 0}</strong>
                <span>Total clicks</span>
              </div>

              <div className="legend-stat">
                <strong>{selected}</strong>
                <span>Selected page</span>
              </div>
            </div>
          </div>
        </LoadState>
      </LoadState>
    </Page>
  );
}


function Page({ title, eyebrow, children }) {
  return (
    <div className="page">
      <div className="page-heading">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="page-description">
          Understand how visitors move through your experience.
        </p>
      </div>

      {children}
    </div>
  );
}


export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/sessions" element={<Sessions />} />
          <Route
            path="/sessions/:sessionId"
            element={<SessionDetails />}
          />
          <Route path="/heatmap" element={<Heatmap />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}