import { createEvent } from '../services/eventService.js';

export async function ingestEvent(req, res) {
  try {
    const event = await createEvent(req.body);
    res.status(201).json({
      success: true,
      data: {
        id: event.id,
        sessionId: event.sessionId,
        type: event.type
      }
    });
  } catch (error) {
    if (error.name === 'ValidationError' || error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid event payload',
        errors: Object.values(error.errors ?? {}).map((item) => item.message)
      });
    }

    console.error(`Event ingestion failed: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Unable to store event'
    });
  }
}
