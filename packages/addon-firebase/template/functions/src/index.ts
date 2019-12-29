import * as functions from 'firebase-functions';

process.env.hosting = 'firebase-functions';

const app = require('../dist/server/server').app;
exports.vuesionApp = functions.https.onRequest(app);
