import { useState } from 'react';
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import {
  Bell,
  CalendarDays,
  ChevronDown,
  Image,
  LayoutDashboard,
  Menu,
  PenLine,
  Settings,
  Share2,
  Sparkles,
  X,
} from 'lucide-react';
import { Dashboard } from '../features/dashboard/Dashboard';
import { Composer } from '../features/posts/Composer';
import { SectionPage } from '../features/shared/SectionPage';
import { PostList } from '../features/posts/PostList';
import { Breadcrumbs } from '../components/layout/Breadcrumbs';
import { ConfirmDialog, ToastProvider } from '../components/ui/Feedback';
import { isSupabaseConfigured, useSupabaseAuth } from '../lib/auth';

const navigation = [
  ['/dashboard', 'Dashboard', LayoutDashboard],
  ['/posts/new', 'Create Post', PenLine],
  ['/content-studio', 'Content Studio', Sparkles],
  ['/calendar', 'Calendar', CalendarDays],
  ['/media', 'Media Library', Image],
  ['/brand', 'Brand', Sparkles],
  ['/social-accounts', 'Social Accounts', Share2],
  ['/settings', 'Settings', Settings],
] as const;
export function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route path="*" element={<ConfiguredRoute />} />
      </Routes>
    </ToastProvider>
  );
}
function ConfiguredRoute() {
  return isSupabaseConfigured ? <Routes><Route path="*" element={<ProtectedApplication />} /></Routes> : (
    <Routes>
      <Route path="*" element={<ApplicationShell />} />
    </Routes>
  );
}
function ProtectedApplication() {
  const { loading, session } = useSupabaseAuth();
  if (loading)
    return (
      <div className="loading-state">
        <span />
        <span />
        <span />
      </div>
    );
  return session ? <ApplicationShell /> : <AuthPage register={window.location.pathname === '/register'} />;
}
function ApplicationShell() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { signOut } = useSupabaseAuth();
  const location = useLocation();
  const isAuth = location.pathname === '/login' || location.pathname === '/register';
  if (isAuth) return <AuthPage register={location.pathname === '/register'} />;
  return (
    <div className="app">
      <Sidebar mobileOpen={mobileOpen} close={() => setMobileOpen(false)} />
      <main>
        <header className="topbar">
          <button
            className="icon mobile"
            aria-label="Open navigation"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={20} />
          </button>
          <div className="topbar-title">
            <Breadcrumbs />
            <h1>{pageTitle(location.pathname)}</h1>
          </div>
          <div className="header-actions">
            <div className="workspace-menu">
              <button
                className="workspace-button"
                aria-expanded={workspaceOpen}
                onClick={() => setWorkspaceOpen(!workspaceOpen)}
              >
                <span className="avatar">AC</span>
                <span className="workspace-copy">
                  <b>Acme Creative</b>
                  <small>Personal workspace</small>
                </span>
                <ChevronDown size={15} />
              </button>
              {workspaceOpen && (
                <div className="popover workspace-popover">
                  <b>Switch workspace</b>
                  <button>
                    Acme Creative <span>✓</span>
                  </button>
                  <button>+ Create workspace</button>
                </div>
              )}
            </div>
            <button
              className="notification"
              aria-label="View notifications"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
            >
              <Bell size={19} />
              <i />
            </button>
            <div className="profile-menu">
              <button
                className="avatar purple"
                aria-label="Open user profile menu"
                aria-expanded={profileOpen}
                onClick={() => setProfileOpen(!profileOpen)}
              >
                JD
              </button>
              {profileOpen && (
                <div className="popover profile-popover">
                  <b>Jordan Davis</b>
                  <small>jordan@acme.co</small>
                  <hr />
                  <Link to="/settings">Account settings</Link>
                  <button onClick={() => setConfirmOpen(true)}>Sign out</button>
                </div>
              )}
            </div>
            {notificationsOpen && (
              <div className="popover notification-popover">
                <b>Notifications</b>
                <p>
                  <span className="dot green" />
                  Your scheduled post is ready.
                </p>
                <p>
                  <span className="dot purple-dot" />
                  Brand profile updated.
                </p>
                <small>You're all caught up.</small>
              </div>
            )}
          </div>
        </header>
        <div className="page-wrap">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/posts/new" element={<Composer />} />
            <Route path="/posts" element={<PostList />} />
            <Route path="/posts/:id" element={<PostList />} />
            <Route path="/content-studio" element={<SectionPage kind="studio" />} />
            <Route path="/calendar" element={<SectionPage kind="calendar" />} />
            <Route path="/media" element={<SectionPage kind="media" />} />
            <Route path="/brand" element={<SectionPage kind="brand" />} />
            <Route path="/social-accounts" element={<SectionPage kind="accounts" />} />
            <Route path="/settings" element={<SectionPage kind="settings" />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </main>
      <ConfirmDialog
        open={confirmOpen}
        title="Sign out?"
        description="You can sign back in at any time."
        confirmLabel="Sign out"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={async () => { await signOut(); setConfirmOpen(false); }}
      />
    </div>
  );
}
function Sidebar({ mobileOpen, close }: { mobileOpen: boolean; close: () => void }) {
  const location = useLocation();
  return (
    <aside className={mobileOpen ? 'open' : ''}>
      <div className="brand">
        <span className="brand-mark">S</span>
        <span>Storm</span>
        <button className="icon mobile" aria-label="Close navigation" onClick={close}>
          <X size={18} />
        </button>
      </div>
      <button className="workspace-selector" aria-label="Select workspace">
        <span className="avatar">AC</span>
        <span>
          <b>Acme Creative</b>
          <small>Personal workspace</small>
        </span>
        <ChevronDown size={15} />
      </button>
      <nav aria-label="Primary navigation">
        {navigation.map(([href, label, Icon]) => (
          <Link
            className={
              location.pathname === href ||
              (href === '/posts/new' && location.pathname.startsWith('/posts/'))
                ? 'active'
                : ''
            }
            to={href}
            onClick={close}
            key={href}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="upgrade">
          <Sparkles size={18} />
          <div>
            <b>Unlock your creativity</b>
            <small>Upgrade to Pro</small>
          </div>
          <span>→</span>
        </div>
        <Link className="profile" to="/settings">
          <span className="avatar purple">JD</span>
          <span>
            <b>Jordan Davis</b>
            <small>jordan@acme.co</small>
          </span>
          <Settings size={17} />
        </Link>
      </div>
    </aside>
  );
}
function AuthPage({ register }: { register: boolean }) {
  const { signIn, signUp } = useSupabaseAuth(); const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [message, setMessage] = useState('');
  async function submit(event: React.FormEvent) { event.preventDefault(); setMessage(''); if (register) { const result = await signUp(email, password); setMessage(result.error ?? (result.needsEmailConfirmation ? 'Check your email to confirm your account.' : 'Account created.')); } else { const error = await signIn(email, password); if (error) setMessage(error); } }
  return <div className="auth-page"><form className="auth-card" onSubmit={submit}><div className="brand auth-brand"><span className="brand-mark">S</span><span>Storm</span></div><h1>{register ? 'Create your workspace' : 'Welcome back'}</h1><p className="muted">{register ? 'Start publishing with clarity.' : 'Sign in to continue to Storm.'}</p><label>Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" /></label><label>Password<input required minLength={8} type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" /></label>{message && <p className="error-state">{message}</p>}<button className="button primary auth-submit" type="submit">{register ? 'Create account' : 'Sign in'}</button><p className="auth-switch">{register ? 'Already have an account?' : 'New to Storm?'}{' '}<Link to={register ? '/login' : '/register'}>{register ? 'Sign in' : 'Create an account'}</Link></p></form></div>;
}
function pageTitle(path: string) {
  if (path === '/posts/new') return 'Create a new post';
  if (path.startsWith('/posts')) return 'Posts';
  return navigation.find(([href]) => href === path)?.[1] ?? 'Dashboard';
}
