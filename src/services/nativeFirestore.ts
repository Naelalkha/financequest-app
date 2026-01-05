/**
 * Native Firestore Service for Capacitor
 * Uses @capacitor-firebase/firestore for native iOS/Android
 * Falls back to web SDK on browser
 */

import { Capacitor } from '@capacitor/core';
import {
  FirebaseFirestore,
  DocumentData,
  QueryFilterConstraint,
  QueryCompositeFilterConstraint,
} from '@capacitor-firebase/firestore';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
} from 'firebase/firestore';
import { db } from './firebase';

export const isNative = Capacitor.isNativePlatform();

/**
 * Convert Date objects to ISO strings for native plugin
 * The native Firestore plugin doesn't convert Date to Timestamp like web SDK
 * ISO strings are readable and consistent across platforms
 */
function convertDatesForNative(data: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    if (value instanceof Date) {
      // Convert Date to ISO string for readability
      result[key] = value.toISOString();
    } else if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      // Recursively convert nested objects
      result[key] = convertDatesForNative(value as Record<string, unknown>);
    } else {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Get a document by path
 */
export async function getDocument<T = DocumentData>(
  collectionPath: string,
  documentId: string
): Promise<T | null> {
  if (isNative) {
    try {
      const result = await FirebaseFirestore.getDocument({
        reference: `${collectionPath}/${documentId}`,
      });
      return result.snapshot?.data as T | null;
    } catch (error) {
      console.error('[NativeFirestore] getDocument error:', error);
      return null;
    }
  } else {
    const docRef = doc(db, collectionPath, documentId);
    const snapshot = await getDoc(docRef);
    return snapshot.exists() ? (snapshot.data() as T) : null;
  }
}

/**
 * Set a document (create or overwrite)
 */
export async function setDocument(
  collectionPath: string,
  documentId: string,
  data: Record<string, unknown>,
  merge: boolean = false
): Promise<void> {
  if (isNative) {
    // Convert Date objects to Firestore Timestamp format
    const convertedData = convertDatesForNative(data);
    await FirebaseFirestore.setDocument({
      reference: `${collectionPath}/${documentId}`,
      data: convertedData as DocumentData,
      merge,
    });
  } else {
    const docRef = doc(db, collectionPath, documentId);
    await setDoc(docRef, data, { merge });
  }
}

/**
 * Update a document (partial update)
 */
export async function updateDocument(
  collectionPath: string,
  documentId: string,
  data: Record<string, unknown>
): Promise<void> {
  if (isNative) {
    // Convert Date objects to Firestore Timestamp format
    const convertedData = convertDatesForNative(data);
    await FirebaseFirestore.updateDocument({
      reference: `${collectionPath}/${documentId}`,
      data: convertedData as DocumentData,
    });
  } else {
    const docRef = doc(db, collectionPath, documentId);
    await updateDoc(docRef, data);
  }
}

/**
 * Delete a document
 */
export async function deleteDocument(
  collectionPath: string,
  documentId: string
): Promise<void> {
  if (isNative) {
    await FirebaseFirestore.deleteDocument({
      reference: `${collectionPath}/${documentId}`,
    });
  } else {
    const docRef = doc(db, collectionPath, documentId);
    await deleteDoc(docRef);
  }
}

/**
 * Add a document with auto-generated ID
 */
export async function addDocument(
  collectionPath: string,
  data: Record<string, unknown>
): Promise<string> {
  if (isNative) {
    // Convert Date objects to Firestore Timestamp format
    const convertedData = convertDatesForNative(data);
    const result = await FirebaseFirestore.addDocument({
      reference: collectionPath,
      data: convertedData as DocumentData,
    });
    return result.reference.id;
  } else {
    const collectionRef = collection(db, collectionPath);
    const docRef = await addDoc(collectionRef, data);
    return docRef.id;
  }
}

/**
 * Query a collection with optional filters
 */
export async function queryCollection<T = DocumentData>(
  collectionPath: string,
  filters?: Array<{ field: string; operator: string; value: unknown }>
): Promise<Array<T & { id: string }>> {
  if (isNative) {
    try {
      let queryConstraints: QueryFilterConstraint[] | undefined;

      if (filters && filters.length > 0) {
        queryConstraints = filters.map(f => ({
          type: 'where',
          fieldPath: f.field,
          opStr: f.operator as QueryFilterConstraint['opStr'],
          value: f.value,
        })) as QueryFilterConstraint[];
      }

      const result = await FirebaseFirestore.getCollection({
        reference: collectionPath,
        compositeFilter: queryConstraints ? {
          type: 'and',
          queryConstraints,
        } as QueryCompositeFilterConstraint : undefined,
      });

      return (result.snapshots || []).map(snap => ({
        id: snap.id,
        ...snap.data,
      })) as Array<T & { id: string }>;
    } catch (error) {
      console.error('[NativeFirestore] queryCollection error:', error);
      return [];
    }
  } else {
    const collectionRef = collection(db, collectionPath);

    let q;
    if (filters && filters.length > 0) {
      const constraints = filters.map(f =>
        where(f.field, f.operator as Parameters<typeof where>[1], f.value)
      );
      q = query(collectionRef, ...constraints);
    } else {
      q = query(collectionRef);
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Array<T & { id: string }>;
  }
}

/**
 * Listen to a document in real-time
 * Returns an unsubscribe function
 */
export function listenToDocument<T = DocumentData>(
  collectionPath: string,
  documentId: string,
  callback: (data: T | null) => void
): () => void {
  if (isNative) {
    const callbackId = `doc_${collectionPath}_${documentId}_${Date.now()}`;

    FirebaseFirestore.addDocumentSnapshotListener({
      reference: `${collectionPath}/${documentId}`,
    }, callbackId, (event, error) => {
      if (error) {
        console.error('[NativeFirestore] listenToDocument error:', error);
        callback(null);
      } else if (event) {
        callback(event.snapshot?.data as T | null);
      }
    });

    return () => {
      FirebaseFirestore.removeSnapshotListener({ callbackId });
    };
  } else {
    const docRef = doc(db, collectionPath, documentId);
    return onSnapshot(docRef, (snapshot) => {
      callback(snapshot.exists() ? (snapshot.data() as T) : null);
    });
  }
}

