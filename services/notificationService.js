import winston from 'winston'

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
})

export const sendNotification = async (type, recipient, data) => {
  try {
    switch (type) {
      case 'delivery_assigned':
        logger.info(`Delivery assigned notification sent to ${recipient}`, data)
        // Implement SMS via Twilio/Africa's Talking
        // Implement push via Firebase
        break
      case 'delivery_status':
        logger.info(`Status update sent to ${recipient}`, data)
        break
      case 'delivery_completed':
        logger.info(`Completion notification sent to ${recipient}`, data)
        break
      case 'delay_alert':
        logger.warn(`Delay alert sent to ${recipient}`, data)
        break
      default:
        logger.info(`Notification sent to ${recipient}`, { type, data })
    }
  } catch (error) {
    logger.error('Notification failed', { error: error.message, type, recipient })
  }
}

export const sendBulkNotification = async (type, recipients, data) => {
  const promises = recipients.map(recipient => sendNotification(type, recipient, data))
  await Promise.allSettled(promises)
}
