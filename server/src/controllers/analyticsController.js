import {
  getSummary,
  listPageClicks,
  listPages,
  listSessionEvents,
  listSessions
} from '../services/eventService.js';

function handleError(res, error, message) {
  console.error(`${message}: ${error.message}`);
  return res.status(500).json({ success: false, message });
}

export async function getSessions(req, res) {
  try {
    return res.json({ success: true, data: await listSessions() });
  } catch (error) {
    return handleError(res, error, 'Unable to load sessions');
  }
}

export async function getSessionEvents(req, res) {
  const sessionId = req.params.sessionId?.trim();
  if (!sessionId) {
    return res.status(400).json({ success: false, message: 'sessionId is required' });
  }

  try {
    return res.json({ success: true, data: await listSessionEvents(sessionId) });
  } catch (error) {
    return handleError(res, error, 'Unable to load session events');
  }
}

export async function getHeatmap(req, res) {
  const pageUrl = typeof req.query.pageUrl === 'string' ? req.query.pageUrl.trim() : '';
  if (!pageUrl) {
    return res.status(400).json({ success: false, message: 'pageUrl is required' });
  }

  try {
    const clicks = await listPageClicks(pageUrl);
    return res.json({ success: true, data: { pageUrl, clicks } });
  } catch (error) {
    return handleError(res, error, 'Unable to load heatmap data');
  }
}

export async function getPages(req, res) {
  try {
    const pages = (await listPages()).sort();
    return res.json({ success: true, data: pages });
  } catch (error) {
    return handleError(res, error, 'Unable to load pages');
  }
}

export async function getAnalyticsSummary(req, res) {
  try {
    return res.json({ success: true, data: await getSummary() });
  } catch (error) {
    return handleError(res, error, 'Unable to load analytics summary');
  }
}
