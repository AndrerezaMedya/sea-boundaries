/**
 * Middleware: resolveAccessLevel
 *
 * Reads an optional Firebase ID Token from the Authorization header
 * (Bearer <token>), verifies it via Firebase Admin SDK, and sets
 * req.accessLevel to 'authenticated' or 'public'.
 *
 * This middleware is NON-BLOCKING — it never rejects a request.
 * Authorization (what data the user can see) is enforced downstream
 * in the SQL queries, not here.
 *
 * Firebase Admin SDK is initialized lazily on first use. It reads
 * credentials from the GOOGLE_APPLICATION_CREDENTIALS environment
 * variable (Cloud Run: injected via Secret Manager / Workload Identity).
 *
 * In local development, set GOOGLE_APPLICATION_CREDENTIALS to the path
 * of a service account JSON file downloaded from Firebase Console.
 */

const { ACCESS_PUBLIC, ACCESS_AUTH } = require('../lib/accessLevel');

let adminApp = null;

function getFirebaseAdmin() {
  if (adminApp) return adminApp;

  if (!process.env.FIREBASE_PROJECT_ID) {
    return null;
  }

  try {
    const { initializeApp, getApps } = require('firebase-admin/app');
    const { getAuth } = require('firebase-admin/auth');

    if (getApps().length === 0) {
      initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
    }
    
    adminApp = {
        verifyIdToken: (token) => getAuth().verifyIdToken(token)
    };
    return adminApp;
  } catch (err) {
    console.warn('[resolveAccessLevel] firebase-admin not available:', err.message);
    return null;
  }
}

/**
 * Express middleware. Always calls next().
 * Sets req.accessLevel = 'authenticated' | 'public'.
 */
async function resolveAccessLevel(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const idToken = authHeader.slice(7).trim();
    const admin = getFirebaseAdmin();

    if (admin && idToken) {
      try {
        await admin.verifyIdToken(idToken);
        req.accessLevel = ACCESS_AUTH;
        res.set('X-Debug-Auth', 'SUCCESS');
        return next();
      } catch (err) {
        req.accessLevel = ACCESS_PUBLIC;
        // Strip newlines to prevent res.set() from throwing an unhandled rejection in Express 4
        const safeMsg = (err.message || 'Unknown error').replace(/\r?\n|\r/g, ' ');
        res.set('X-Debug-Auth', 'FAIL_VERIFY: ' + safeMsg);
        return next();
      }
    } else {
      req.accessLevel = ACCESS_PUBLIC;
      res.set('X-Debug-Auth', 'FAIL_NO_ADMIN: admin=' + !!admin + ' token=' + !!idToken + ' proj=' + process.env.FIREBASE_PROJECT_ID);
      return next();
    }
  }

  req.accessLevel = ACCESS_PUBLIC;
  res.set('X-Debug-Auth', 'NO_AUTH_HEADER');
  return next();
}

module.exports = { resolveAccessLevel };
