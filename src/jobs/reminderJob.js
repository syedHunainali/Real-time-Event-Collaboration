const cron = require('node-cron');
const notificationService = require('../services/notificationService');

// This job runs every hour to check for events starting in the next 24 hours.
cron.schedule('0 * * * *', async () => {
    console.log('Running scheduled job: Sending event reminders...');
    try {
        // We can't easily get the `io` instance here.
        // A more complex setup would use a message bus like Redis Pub/Sub.
        // For now, only email notifications will be sent by this job.
        await notificationService.sendEventReminderNotifications(null);
    } catch (error) {
        console.error('Error running reminder job:', error);
    }
});

console.log('Scheduled reminder job initialized.');

