import { useEffect, useState } from 'react';
import type { Ticket } from '@ticket-manager/types';

function App() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3000/tickets')
      .then((res) => res.json())
      .then((data) => setTickets(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: 24 }}>
      <h1>My Tickets</h1>
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

export default App;
