const { createApp } = require('../app');

// Initialize the Express app
const app = createApp();

// Export the app so Vercel can convert it to a Serverless Function
module.exports = app;
