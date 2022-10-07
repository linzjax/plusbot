import lookup from './handlers/lookup';
import message from './handlers/message';

import { Router } from 'itty-router';

// Create a new router
const router = Router();

router.post("/lookup", lookup);

router.post("/slack", message);

router.all("*", () => new Response("404, not found!", { status: 404 }))

addEventListener('fetch', (e) => {
  e.respondWith(router.handle(e.request))
})
