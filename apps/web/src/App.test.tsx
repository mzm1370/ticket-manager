import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';

describe('App', () => {
  beforeEach(() => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve([
            { id: 1, title: 'Test ticket', status: 'open', createdAt: '2026-01-01' },
          ]),
      }),
    ) as unknown as typeof fetch;
  });

  it('renders the ticket list after loading', async () => {
    render(<App />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    const item = await screen.findByText(/Test ticket/);
    expect(item).toBeInTheDocument();
  });
});
