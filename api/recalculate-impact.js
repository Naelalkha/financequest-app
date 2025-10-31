// /api/recalculate-impact.js
// Calcule et met à jour les agrégats d'impact pour un utilisateur
// Compatible Vercel Serverless Functions + Firebase Admin SDK

import admin from 'firebase-admin';

// Parse service account depuis env var
function parseServiceAccount() {
  const raw = process.env.VITE_FIREBASE_SERVICE_ACCOUNT;
  if (!raw) throw new Error('Missing VITE_FIREBASE_SERVICE_ACCOUNT');
  
  try {
    const json = JSON.parse(raw);
    if (json.private_key?.includes('\\n')) {
      json.private_key = json.private_key.replace(/\\n/g, '\n');
    }
    return json;
  } catch {
    const decoded = Buffer.from(raw, 'base64').toString('utf8');
    const json = JSON.parse(decoded);
    if (json.private_key?.includes('\\n')) {
      json.private_key = json.private_key.replace(/\\n/g, '\n');
    }
    return json;
  }
}

// Initialize Firebase Admin une seule fois
let adminApp = null;
let db = null;

function initAdmin() {
  if (adminApp && db) return { db };
  
  try {
    if (admin.apps && admin.apps.length > 0) {
      adminApp = admin.apps[0];
      db = admin.firestore();
      return { db };
    }
    
    const serviceAccount = parseServiceAccount();
    adminApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
    });
    
    db = admin.firestore();
    console.log('✅ Firebase Admin initialized successfully');
    
    return { db };
  } catch (error) {
    console.error('❌ Firebase Admin init error:', error);
    throw error;
  }
}

/**
 * Annualise le montant d'un savings event
 * @param {Object} event - L'événement d'économie
 * @returns {number} Le montant annualisé
 */
function annualizeImpact(event) {
  if (!event || typeof event.amount !== 'number' || event.amount <= 0) {
    return 0;
  }
  return event.amount * (event.period === 'month' ? 12 : 1);
}

/**
 * Calcule les agrégats d'impact pour un utilisateur
 * @param {string} userId - L'ID de l'utilisateur
 * @returns {Promise<Object>} Les agrégats calculés
 */
async function calculateImpactAggregates(userId) {
  const { db } = initAdmin();
  const startTime = Date.now();
  
  console.log(`📊 Calculating impact aggregates for user: ${userId}`);
  
  // Lire tous les savingsEvents
  const savingsEventsRef = db.collection('users').doc(userId).collection('savingsEvents');
  const eventsSnapshot = await savingsEventsRef.get();
  
  console.log(`📁 Found ${eventsSnapshot.size} savings events`);
  
  let sumEstimated = 0;
  let sumVerified = 0;
  let countVerified = 0;
  
  eventsSnapshot.forEach((doc) => {
    const data = doc.data();
    const annual = annualizeImpact(data);
    
    sumEstimated += annual;
    
    if (data.verified === true) {
      sumVerified += annual;
      countVerified += 1;
    }
  });
  
  const aggregates = {
    impactAnnualEstimated: Math.round(sumEstimated * 100) / 100, // Arrondi à 2 décimales
    impactAnnualVerified: Math.round(sumVerified * 100) / 100,
    proofsVerifiedCount: countVerified,
    lastImpactRecalcAt: new Date().toISOString(),
  };
  
  const duration = Date.now() - startTime;
  console.log(`✅ Aggregates calculated in ${duration}ms:`, aggregates);
  
  return { ...aggregates, duration };
}

/**
 * Sauvegarde les agrégats dans Firestore
 * @param {string} userId - L'ID de l'utilisateur
 * @param {Object} aggregates - Les agrégats à sauvegarder
 */
async function saveAggregates(userId, aggregates) {
  const { db } = initAdmin();
  
  const userRef = db.collection('users').doc(userId);
  
  // Ne pas inclure 'duration' dans les données Firestore
  const { duration, ...dataToSave } = aggregates;
  
  await userRef.update(dataToSave);
  
  console.log(`💾 Aggregates saved for user ${userId}`);
}

/**
 * Handler principal de l'API
 */
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only accept POST
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed. Use POST.' 
    });
  }
  
  try {
    // Vérifier l'Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        error: 'Missing or invalid Authorization header' 
      });
    }
    
    const idToken = authHeader.split('Bearer ')[1];
    
    // Vérifier le token et extraire le uid
    const { db } = initAdmin();
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const userId = decodedToken.uid;
    
    console.log(`🔐 Token verified for user: ${userId}`);
    
    // Calculer les agrégats
    const aggregates = await calculateImpactAggregates(userId);
    
    // Sauvegarder dans Firestore
    await saveAggregates(userId, aggregates);
    
    // Retourner le résultat
    return res.status(200).json({
      success: true,
      data: {
        impactAnnualEstimated: aggregates.impactAnnualEstimated,
        impactAnnualVerified: aggregates.impactAnnualVerified,
        proofsVerifiedCount: aggregates.proofsVerifiedCount,
        lastImpactRecalcAt: aggregates.lastImpactRecalcAt,
      },
      meta: {
        duration: aggregates.duration,
        timestamp: new Date().toISOString(),
      },
    });
    
  } catch (error) {
    console.error('❌ Error in recalculate-impact API:', error);
    
    // Détails de l'erreur selon le type
    const errorMessage = error.code === 'auth/id-token-expired'
      ? 'Token expired'
      : error.code === 'auth/argument-error'
      ? 'Invalid token format'
      : error.message || 'Internal server error';
    
    return res.status(500).json({
      success: false,
      error: errorMessage,
      code: error.code || 'UNKNOWN_ERROR',
    });
  }
}

