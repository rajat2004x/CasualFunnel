export async function sendEvent(event, apiUrl) {
  try {
    const response = await fetch(`${apiUrl.replace(/\/$/, '')}/api/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
      keepalive: true
    });

    if (!response.ok) {
      console.warn(`Analytics event rejected with HTTP ${response.status}`);
      return { ok: false, status: response.status };
    }

    return { ok: true, data: await response.json() };
  } catch (error) {
    console.warn('Analytics event could not be sent:', error.message);
    return { ok: false, error };
  }
}
