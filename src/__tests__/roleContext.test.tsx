import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { RoleProvider, useRole } from '../context/RoleContext';

const STORAGE_KEY = 'tdi500-role';

const TestConsumer = () => {
  const { role, setRole } = useRole();
  return (
    <div>
      <span data-testid="role">{role}</span>
      <button onClick={() => setRole('beheerder')}>become beheerder</button>
      <button onClick={() => setRole('installateur')}>become installateur</button>
    </div>
  );
};

describe('RoleContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('defaults to installateur when localStorage is empty', () => {
    render(
      <RoleProvider>
        <TestConsumer />
      </RoleProvider>
    );
    expect(screen.getByTestId('role')).toHaveTextContent('installateur');
  });

  it('reads stored role on mount', () => {
    localStorage.setItem(STORAGE_KEY, 'beheerder');
    render(
      <RoleProvider>
        <TestConsumer />
      </RoleProvider>
    );
    expect(screen.getByTestId('role')).toHaveTextContent('beheerder');
  });

  it('ignores invalid stored values and falls back to default', () => {
    localStorage.setItem(STORAGE_KEY, 'bogus-role');
    render(
      <RoleProvider>
        <TestConsumer />
      </RoleProvider>
    );
    expect(screen.getByTestId('role')).toHaveTextContent('installateur');
  });

  it('persists role changes to localStorage', () => {
    render(
      <RoleProvider>
        <TestConsumer />
      </RoleProvider>
    );
    act(() => {
      screen.getByText('become beheerder').click();
    });
    expect(screen.getByTestId('role')).toHaveTextContent('beheerder');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('beheerder');
  });

  it('survives localStorage write failures', () => {
    const setItemSpy = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new Error('quota exceeded');
      });

    render(
      <RoleProvider>
        <TestConsumer />
      </RoleProvider>
    );
    act(() => {
      screen.getByText('become beheerder').click();
    });
    // In-memory state still updates even when persist fails
    expect(screen.getByTestId('role')).toHaveTextContent('beheerder');
    expect(setItemSpy).toHaveBeenCalled();
  });

  it('throws when useRole is called outside RoleProvider', () => {
    // suppress React error boundary noise
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow(
      /useRole must be used within a RoleProvider/
    );
    err.mockRestore();
  });
});
