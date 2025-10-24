const nodemailer = require('nodemailer');

module.exports = class Email {
    constructor(user, data) {
        this.to = user.email;
        this.firstName = user.name.split(' ')[0];
        this.data = data;
        this.from = `live-event-Handler <${process.env.EMAIL_FROM}>`;
    }

    newTransport() {
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }

    async send(subject, message) {
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            text: message,
        };

        await this.newTransport().sendMail(mailOptions);
    }

    async sendWelcome() {
        await this.send(`Hi ${this.firstName}! Welcome to EventFlow.`, 'Welcome to the Platform!');
    }

    async sendPaymentSuccess() {
        await this.send(`Your ticket for ${this.subject} was purchased successfully.`, 'Payment Successful');
    }

    async sendEventReminder() {
        await this.send(`Reminder: Your event, ${this.subject}, is starting tomorrow!`, 'Event Reminder');
    }
};

