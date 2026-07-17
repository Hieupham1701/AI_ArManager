import type { ReactNode } from 'react'

const navItems = [
  { href: '/overview', label: 'Overview' },
  { href: '/invoices', label: 'Invoices' },
  { href: '/clients', label: 'Clients' },
  { href: '/analytics', label: 'Analytics' },
  { href: '/transition', label: 'Transition' },
  { href: '/settings', label: 'Settings' },
  { href: '/login', label: 'Log In' }
]

function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">AI AR Manager</div>
        <nav className="nav-links">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} className="nav-link">
              {item.label}
            </a>
          ))}
        </nav>
      </aside>

      <main className="main-content">
        {children}
      </main>
    </div>
  )
}

export default Layout
