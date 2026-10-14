import Event from '../models/Event.js';

export async function createEvent(payload) {
  const event = await Event.create(payload);
  return event;
}

export async function listSessions() {
  return Event.aggregate([
    {
      $group: {
        _id: '$sessionId',
        eventCount: { $sum: 1 },
        firstEventAt: { $min: '$timestamp' },
        lastEventAt: { $max: '$timestamp' }
      }
    },
    {
      $project: {
        _id: 0,
        sessionId: '$_id',
        eventCount: 1,
        firstEventAt: 1,
        lastEventAt: 1
      }
    },
    { $sort: { lastEventAt: -1 } }
  ]);
}

export function listSessionEvents(sessionId) {
  return Event.find({ sessionId })
    .select('sessionId type pageUrl timestamp coordinates metadata -_id')
    .sort({ timestamp: 1 })
    .lean();
}

export function listPageClicks(pageUrl) {
  return Event.find({ pageUrl, type: 'click' })
    .select('sessionId timestamp coordinates -_id')
    .sort({ timestamp: 1 })
    .lean();
}

export function listPages() {
  return Event.distinct('pageUrl');
}

export async function getSummary() {
  const [summary] = await Event.aggregate([
    {
      $group: {
        _id: null,
        totalEvents: { $sum: 1 },
        totalSessions: { $addToSet: '$sessionId' },
        totalPageViews: {
          $sum: { $cond: [{ $eq: ['$type', 'page_view'] }, 1, 0] }
        },
        totalClicks: {
          $sum: { $cond: [{ $eq: ['$type', 'click'] }, 1, 0] }
        }
      }
    },
    {
      $project: {
        _id: 0,
        totalEvents: 1,
        totalSessions: { $size: '$totalSessions' },
        totalPageViews: 1,
        totalClicks: 1
      }
    }
  ]);

  return summary ?? {
    totalSessions: 0,
    totalEvents: 0,
    totalPageViews: 0,
    totalClicks: 0
  };
}
