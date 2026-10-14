import { createSession } from './session.js';
import { sendEvent } from './transport.js';

export function initTracker({ apiUrl = 'http://localhost:5000' } = {}) {
  if (globalThis.__causalFunnelTracker) {
    return globalThis.__causalFunnelTracker;
  }

  const session = createSession();
  let destroyed = false;

  function track(type, payload = {}) {
    if (destroyed) {
      return Promise.resolve({ ok: false, status: 'destroyed' });
    }

    const event = {
      sessionId: session.id,
      type,
      pageUrl: globalThis.location?.href ?? '',
      timestamp: new Date().toISOString(),
      ...payload
    };

    return sendEvent(event, apiUrl);
  }

  function trackPageView() {
    session.pageViews += 1;
    return track('page_view');
  }

  function handleClick(event) {
    return track('click', {
      coordinates: {
        x: event.clientX,
        y: event.clientY
      }
    });
  }

  globalThis.addEventListener?.('click', handleClick, { passive: true });
  trackPageView();

  const tracker = {
    session,
    track,
    trackPageView,
    trackClick: handleClick,
    destroy() {
      destroyed = true;
      globalThis.removeEventListener?.('click', handleClick);
      delete globalThis.__causalFunnelTracker;
    }
  };

  globalThis.__causalFunnelTracker = tracker;
  return tracker;
}

export default { initTracker };
