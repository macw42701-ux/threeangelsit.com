import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDocFromServer, getFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Respect named Firestore database provisioned in firebase-applet-config.json (Spark Free Tier)
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export const BOOTSTRAPPED_OWNER_EMAIL = 'solankimansukh36@gmail.com';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  };
}

export function isSparkQuotaError(error: unknown): boolean {
  const msg =
    error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  return (
    msg.includes('resource-exhausted') ||
    msg.includes('quota exceeded') ||
    msg.includes('daily read units') ||
    msg.includes('daily write units')
  );
}

export const SPARK_QUOTA_USER_MESSAGE =
  'Firebase Spark (Free Tier) daily quota has been reached. Free quotas reset automatically tomorrow — no paid upgrade or billing account will be used.';

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  if (isSparkQuotaError(error)) {
    console.warn('Firebase Spark daily quota reached:', error);
    throw new Error(SPARK_QUOTA_USER_MESSAGE);
  }

  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData.map((provider) => ({
          providerId: provider.providerId,
          displayName: provider.displayName,
          email: provider.email,
          photoUrl: provider.photoURL,
        })) ?? [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testFirestoreConnection(): Promise<void> {
  try {
    await getDocFromServer(doc(db, 'website_settings', 'public'));
  } catch (error) {
    if (isSparkQuotaError(error)) {
      console.warn(SPARK_QUOTA_USER_MESSAGE);
      return;
    }
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error(
        'Please check your Firebase configuration. Firestore reported that the client is offline.'
      );
    }
  }
}

void testFirestoreConnection();
