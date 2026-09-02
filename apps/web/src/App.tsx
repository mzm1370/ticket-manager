import { useEffect, useState } from 'react';
import type { Ticket } from '@ticket-manager/types';
import { AuthProvider, useAuth } from './AuthContext';
import { LoginForm } from './LoginForm';

function TicketList() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const { token, user, logout } = useAuth();

  useEffect(() => {
    fetch('http://localhost:3000/tickets', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setTickets(data))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h1>Tickets</h1>
        <div>
          <span>{user?.email} ({user?.role})</span>{' '}
          <button onClick={logout}>Log out</button>
        </div>
      </div>
      <ul>
        {tickets.map((t) => (
          <li key={t.id}>
            #{t.id} — {t.title} <strong>({t.status})</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AppContent() {
  const { token } = useAuth();
  return token ? <TicketList /> : <LoginForm />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
