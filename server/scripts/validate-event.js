import assert from 'node:assert/strict';
import Event from '../src/models/Event.js';

const baseEvent = {
  sessionId: 'test-session-1',
  pageUrl: 'http://localhost:5173/',
  timestamp: new Date()
};

async function validate(event) {
  try {
    await new Event(event).validate();
    return undefined;
  } catch (error) {
    return error;
  }
}

async function assertValid(event) {
  assert.equal(await validate(event), undefined);
}

async function assertInvalid(event, description) {
  assert.notEqual(await validate(event), undefined, description);
}

await assertValid({ ...baseEvent, type: 'page_view' });
await assertValid({
  ...baseEvent,
  type: 'click',
  coordinates: { x: 250, y: 400 }
});

await assertInvalid({ ...baseEvent, type: 'page_view', sessionId: '' }, 'missing sessionId');
await assertInvalid({ ...baseEvent, type: 'unknown' }, 'invalid event type');
await assertInvalid({ ...baseEvent, type: 'page_view', pageUrl: '' }, 'missing pageUrl');
await assertInvalid({ ...baseEvent, type: 'click' }, 'click without coordinates');
await assertInvalid(
  { ...baseEvent, type: 'click', coordinates: { x: -1, y: 10 } },
  'negative x'
);
await assertInvalid(
  { ...baseEvent, type: 'click', coordinates: { x: 10, y: -1 } },
  'negative y'
);
await assertInvalid(
  { ...baseEvent, type: 'page_view', timestamp: 'not-a-date' },
  'invalid timestamp'
);

console.log('Event model validation tests passed');
