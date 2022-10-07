import lookup from './handlers/lookup';
import message from './handlers/message';

import { Router } from 'itty-router';

// Create a new router
const router = Router();

router.post("/lookup", lookup);

router.post("/slack", message);

router.get("/slack", () => new Response("oh you're trying to reach slack? Yeah not here"))

router.all("*", () => new Response("404, not found!", { status: 404 }))

addEventListener('fetch', (e) => {
  e.respondWith(router.handle(e.request))
})
