// /api/create-portal-session.js
import Stripe from 'stripe';
import * as admin from 'firebase-admin';

// --- Helpers: init Firebase Admin ---
function initAdmin() {
  if (!admin.apps.length) {
    const raw = process.env.VITE_FIREBASE_SERVICE_ACCOUNT;
    if (!raw) throw new Error('Missing VITE_FIREBASE_SERVICE_ACCOUNT');
    let serviceAccount;
    try {
      serviceAccount = JSON.parse(raw);
    } catch {
      throw new Error('Invalid VITE_FIREBASE_SERVICE_ACCOUNT JSON');
    }
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
  return {
    db: admin.firestore(),
    auth: admin.auth(),
  };
}

function setCORS(res, origin) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}
function getOrigin(req) {
  return process.env.ORIGIN || req.headers.origin || 'http://localhost:5173';
}

const STRIPE_SECRET =
  process.env.STRIPE_SECRET_KEY || process.env.VITE_STRIPE_SECRET_KEY;
const stripe = new Stripe(STRIPE_SECRET || 'sk_test_missing', {
  apiVersion: '2024-06-20',
});

export default async function handler(req, res) {
  const origin = getOrigin(req);
  setCORS(res, origin);

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    // 1) Vérifier le token Firebase
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Missing auth token' });

    const { db, auth } = initAdmin();
    const decoded = await auth.verifyIdToken(token);
    const userId = decoded.uid;

    // 2) Récupérer / créer le customer Stripe
    const userRef = db.collection('users').doc(userId);
    const snap = await userRef.get();
    const data = snap.exists ? snap.data() : {};

    let customerId = data?.stripeCustomerId;
    if (!customerId) {
      // Créer un customer au besoin
      const customer = await stripe.customers.create({
        email: decoded.email || data?.email,
        metadata: { userId },
      });
      customerId = customer.id;
      await userRef.set(
        { stripeCustomerId: customerId, lastUpdated: new Date().toISOString() },
        { merge: true }
      );
    }

    // 3) Créer la session du portail
    const portal = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/premium`,
    });

    return res.status(200).json({ url: portal.url });
  } catch (err) {
    console.error('create-portal-session error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}