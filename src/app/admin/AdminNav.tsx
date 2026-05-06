"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminNav() {
  const pathname = usePathname();

  const links = [
    { href: "/admin", label: "Overview" },
    { href: "/admin/posts", label: "Posts" },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/logs", label: "Logs" },
  ];

  return (
    <nav style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--surface-border)', marginBottom: '2rem' }}>
      {links.map(link => {
        const isActive = pathname === link.href;
        return (
          <Link 
            key={link.href} 
            href={link.href}
            style={{ 
              padding: '0.75rem 1.5rem', 
              color: isActive ? 'var(--accent-color)' : 'var(--text-secondary)',
              fontWeight: isActive ? 600 : 500,
              borderBottom: isActive ? '2px solid var(--accent-color)' : '2px solid transparent',
              textDecoration: 'none',
              transition: 'all 0.2s'
            }}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
