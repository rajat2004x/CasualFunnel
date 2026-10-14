import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDatabase } from '../src/config/db.js';
import Event from '../src/models/Event.js';

dotenv.config();

const pages = [
  'http://localhost:5173/demo/index.html#home',
  'http://localhost:5173/demo/index.html#products',
  'http://localhost:5173/demo/index.html#cart'
];

const events = [];
for (let sessionIndex = 1; sessionIndex <= 4; sessionIndex += 1) {
  const sessionId = `demo-session-${sessionIndex}`;
  const start = Date.now() - sessionIndex * 60 * 60 * 1000;
  pages.forEach((pageUrl, pageIndex) => {
    const timestamp = new Date(start + pageIndex * 90 * 1000);
    events.push({ sessionId, type: 'page_view', pageUrl, timestamp });
    events.push({
      sessionId,
      type: 'click',
      pageUrl,
      timestamp: new Date(timestamp.getTime() + 25 * 1000),
      coordinates: { x: 180 + sessionIndex * 70, y: 220 + pageIndex * 95 }
    });
  });
}

try {
  await connectDatabase();
  await Event.insertMany(events);
  console.log(`Inserted ${events.length} demo events`);
} catch (error) {
  console.error(`Demo seed failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
