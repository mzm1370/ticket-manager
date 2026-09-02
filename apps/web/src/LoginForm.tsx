import { useState, type FormEvent } from 'react';
import { useAuth } from './AuthContext';
import type { LoginResponse } from '@ticket-manager/types';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const res = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      setError('Invalid email or password');
      return;
    }
    const data: LoginResponse = await res.json();
    login(data.accessToken, data.user);
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: 24, maxWidth: 320 }}>
      <h1>Log in</h1>
      <div style={{ marginBottom: 12 }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: '100%', padding: 8 }}
        />
      </div>
      <div style={{ marginBottom: 12 }}>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: '100%', padding: 8 }}
        />
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button type="submit" style={{ padding: '8px 16px' }}>Log in</button>
    </form>
  );
}
