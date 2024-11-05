// app/layout.tsx
import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'Spell Library Management System',
  description: 'Manage your Harry Potter spell collection',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="container">
          <h1>Spell Library</h1>
          <nav>
            <Link href="/spells">Spell List</Link>
            {' | '}
            <Link href="/spells/add">Add New Spell</Link>
            {' | '}
            <Link href="/chatbot">Chatbot</Link>
          </nav>
          {children}
        </div>
      </body>
    </html>
  );
}
