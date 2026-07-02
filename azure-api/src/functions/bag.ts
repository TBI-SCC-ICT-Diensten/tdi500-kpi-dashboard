import { app } from '@azure/functions';
import { bagHandler } from '../handlers/bag';

// Registered at /api/bag (GET). See hupie.ts for the authLevel rationale.
app.http('bag', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'bag',
  handler: bagHandler,
});
