import mongoose from 'mongoose';

const coordinatesSchema = new mongoose.Schema(
  {
    x: Number,
    y: Number
  },
  { _id: false }
);

const eventSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: (value) => value.length > 0,
        message: 'sessionId must not be empty'
      }
    },
    type: {
      type: String,
      required: true,
      enum: ['page_view', 'click']
    },
    pageUrl: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: (value) => value.length > 0,
        message: 'pageUrl must not be empty'
      }
    },
    timestamp: {
      type: Date,
      required: true
    },
    coordinates: {
      type: coordinatesSchema,
      required() {
        return this.type === 'click';
      },
      validate: {
        validator(value) {
          if (this.type !== 'click') {
            return true;
          }

          return (
            value &&
            typeof value.x === 'number' &&
            Number.isFinite(value.x) &&
            value.x >= 0 &&
            typeof value.y === 'number' &&
            Number.isFinite(value.y) &&
            value.y >= 0
          );
        },
        message:
          'click events require finite, non-negative x and y coordinates'
      }
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed
    }
  },
  {
    versionKey: false
  }
);

// These indexes support session timelines, heatmap queries, and chronological analytics.
eventSchema.index({ sessionId: 1, timestamp: 1 });
eventSchema.index({ pageUrl: 1, type: 1, timestamp: 1 });
eventSchema.index({ timestamp: 1 });

const Event = mongoose.model('Event', eventSchema);

export default Event;
