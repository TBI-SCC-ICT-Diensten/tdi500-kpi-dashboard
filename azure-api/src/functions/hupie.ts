import { app } from '@azure/functions';
import { hupieHandler } from '../handlers/hupie';

// Registered at /api/hupie (host.json keeps the default "api" routePrefix, which BYOF
// requires). authLevel 'anonymous' — the SWA "Azure Static Web Apps (Linked)" identity
// provider restricts callers to the SWA; function-key auth would 401 a linked backend.
app.http('hupie', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'hupie',
  handler: hupieHandler,
});
