/**
 * RoleContext — UI viewing-mode preference.
 *
 * IMPORTANT: This is NOT a security mechanism. The role toggle
 * affects only which UI is shown to the current browser session.
 * The backend (Hupie API, BAG API, EP-online) performs no role-
 * based authorization.
 *
 * A production deployment would replace this with:
 *   - SSO integration (e.g. TBI's identity provider)
 *   - Role claims derived from authenticated user session
 *   - Server-side enforcement of role-scoped data access
 *
 * For the TDI 500 demonstration scope, this UI preference
 * is sufficient to show role-differentiated experiences to
 * installateurs and beheerders without requiring auth infra.
 */

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type Role = 'installateur' | 'beheerder';

interface RoleContextValue {
  role: Role;
  setRole: (next: Role) => void;
}

const STORAGE_KEY = 'tdi500-role';
const DEFAULT_ROLE: Role = 'installateur';

const RoleContext = createContext<RoleContextValue | undefined>(undefined);

function isValidRole(value: unknown): value is Role {
  return value === 'installateur' || value === 'beheerder';
}

function getInitialRole(): Role {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (isValidRole(stored)) return stored;
  } catch {
    // localStorage unavailable (SSR, privacy mode) — fall through
  }
  return DEFAULT_ROLE;
}

interface RoleProviderProps {
  children: ReactNode;
}

export const RoleProvider = ({ children }: RoleProviderProps) => {
  const [role, setRoleState] = useState<Role>(getInitialRole);

  const value = useMemo<RoleContextValue>(
    () => ({
      role,
      setRole: (next: Role) => {
        setRoleState(next);
        try {
          localStorage.setItem(STORAGE_KEY, next);
        } catch {
          // localStorage unavailable — preference is session-only
        }
      },
    }),
    [role]
  );

  return (
    <RoleContext.Provider value={value}>{children}</RoleContext.Provider>
  );
};

export const useRole = (): RoleContextValue => {
  const ctx = useContext(RoleContext);
  if (!ctx) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return ctx;
};
