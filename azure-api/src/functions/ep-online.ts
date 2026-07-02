import { app } from '@azure/functions';
import { epOnlineHandler } from '../handlers/ep-online';

// Registered at /api/ep-online (GET). See hupie.ts for the authLevel rationale.
app.http('ep-online', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'ep-online',
  handler: epOnlineHandler,
});
