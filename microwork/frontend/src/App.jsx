import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import PostJob from './pages/PostJob';
import WorkerDashboard from './pages/WorkerDashboard';
import MicroLoan from './pages/MicroLoan';

function App() {
    return (
        <div className="min-h-screen bg-bg-primary pb-20 md:pb-0">
            {/* ===== Top Navigation ===== */}
            <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-border">
                <div className="max-w-3xl mx-auto px-5 h-16 flex items-center justify-between">
                    <NavLink to="/" className="flex items-center gap-1.5 no-underline">
                        <span className="font-antigravity text-xl text-tx-primary tracking-tight">
                            MicroWork
                        </span>
                    </NavLink>
                    <ConnectButton
                        showBalance={false}
                        chainStatus="icon"
                        accountStatus="address"
                    />
                </div>
            </nav>

            {/* ===== Page Content ===== */}
            <main className="max-w-3xl mx-auto px-5 py-8">
                <Routes>
                    <Route path="/" element={<Navigate to="/jobs" replace />} />
                    <Route path="/jobs" element={<PostJob />} />
                    <Route path="/dashboard" element={<WorkerDashboard />} />
                    <Route path="/credit" element={<MicroLoan />} />
                </Routes>
            </main>

            {/* ===== Bottom Tab Bar (mobile-first) ===== */}
            <div className="tab-bar md:hidden">
                <div className="flex items-center justify-around h-14 max-w-md mx-auto">
                    <TabItem to="/jobs" label="Jobs" icon={<JobsIcon />} />
                    <TabItem to="/dashboard" label="Dashboard" icon={<DashboardIcon />} />
                    <TabItem to="/credit" label="Credit" icon={<CreditIcon />} />
                </div>
            </div>

            {/* ===== Desktop Tab Bar ===== */}
            <div className="hidden md:block fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
                <div className="flex items-center gap-1 bg-white/90 backdrop-blur-xl border border-border rounded-full px-2 py-1.5 shadow-card">
                    <DesktopTab to="/jobs" label="Jobs" />
                    <DesktopTab to="/dashboard" label="Dashboard" />
                    <DesktopTab to="/credit" label="Credit" />
                </div>
            </div>
        </div>
    );
}

/* ===== Tab Components ===== */

function TabItem({ to, label, icon }) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 text-[11px] font-medium no-underline transition-colors duration-150 ${isActive ? 'text-tx-primary' : 'text-tx-tertiary'
                }`
            }
        >
            {icon}
            {label}
        </NavLink>
    );
}

function DesktopTab({ to, label }) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                `px-5 py-2 text-sm font-medium rounded-full no-underline transition-all duration-150 ${isActive
                    ? 'bg-accent text-bg-primary'
                    : 'text-tx-secondary hover:text-tx-primary hover:bg-bg-subtle'
                }`
            }
        >
            {label}
        </NavLink>
    );
}

/* ===== Tab Icons (clean, minimal SVGs) ===== */

function JobsIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="14" height="14" rx="3" />
            <path d="M7 8h6M7 11h4" />
        </svg>
    );
}

function DashboardIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="10" cy="8" r="3" />
            <path d="M4 16c0-3.3 2.7-5 6-5s6 1.7 6 5" />
        </svg>
    );
}

function CreditIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="5" width="14" height="10" rx="2" />
            <path d="M3 9h14" />
            <path d="M7 13h2" />
        </svg>
    );
}

export default App;
