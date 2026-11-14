import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import {
  auth,
  BOOTSTRAPPED_OWNER_EMAIL,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
} from '../firebase';
import type { AdminUser } from '../types/admin';

export interface AuthSessionState {
  isLoading: boolean;
  isAuthenticated: boolean;
  isAuthorizedAdmin: boolean;
  isBootstrappedOwner: boolean;
  isFirebaseConfigured: boolean;
  uid: string | null;
  adminEmail: string | null;
  displayName: string | null;
  adminRole: AdminUser['role'] | null;
  unauthorizedReason: string | null;
}

export interface AuthAttemptResult {
  success: boolean;
  message: string;
}

const INITIAL_SESSION: AuthSessionState = {
  isLoading: true,
  isAuthenticated: false,
  isAuthorizedAdmin: false,
  isBootstrappedOwner: false,
  isFirebaseConfigured: true,
  uid: null,
  adminEmail: null,
  displayName: null,
  adminRole: null,
  unauthorizedReason: null,
};

async function verifyAdminAuthorization(user: User): Promise<AuthSessionState> {
  const email = user.email ?? null;
  const displayName = user.displayName || email || 'Administrator';
  const normalizedEmail = (email ?? '').toLowerCase();
  const isOwner =
    user.emailVerified && normalizedEmail === BOOTSTRAPPED_OWNER_EMAIL.toLowerCase();

  if (!user.emailVerified) {
    return {
      isLoading: false,
      isAuthenticated: true,
      isAuthorizedAdmin: false,
      isBootstrappedOwner: false,
      isFirebaseConfigured: true,
      uid: user.uid,
      adminEmail: email,
      displayName,
      adminRole: null,
      unauthorizedReason: 'Email verification is required on your Google account to access Admin.',
    };
  }

  const adminRef = doc(db, 'admins', user.uid);
  let adminSnap;
  try {
    adminSnap = await getDoc(adminRef);
  } catch (err) {
    if (!isOwner) {
      return {
        isLoading: false,
        isAuthenticated: true,
        isAuthorizedAdmin: false,
        isBootstrappedOwner: false,
        isFirebaseConfigured: true,
        uid: user.uid,
        adminEmail: email,
        displayName,
        adminRole: null,
        unauthorizedReason:
          'Access denied: This account is not listed as an authorized THREE ANGELS IT SERVICES administrator.',
      };
    }
    handleFirestoreError(err, OperationType.GET, `admins/${user.uid}`);
  }

  if (isOwner) {
    try {
      if (!adminSnap.exists()) {
        await setDoc(adminRef, {
          uid: user.uid,
          displayName,
          email: email ?? BOOTSTRAPPED_OWNER_EMAIL,
          role: 'Super Admin',
          status: 'Active',
          createdAt: serverTimestamp(),
          lastSignInAt: new Date().toISOString().slice(0, 10),
        });
      } else {
        await updateDoc(adminRef, {
          displayName,
          lastSignInAt: new Date().toISOString().slice(0, 10),
        });
      }
    } catch {
      // Non-fatal if metadata update races during fast reload
    }

    return {
      isLoading: false,
      isAuthenticated: true,
      isAuthorizedAdmin: true,
      isBootstrappedOwner: true,
      isFirebaseConfigured: true,
      uid: user.uid,
      adminEmail: email,
      displayName,
      adminRole: 'Super Admin',
      unauthorizedReason: null,
    };
  }

  if (adminSnap.exists()) {
    const data = adminSnap.data() as { status?: string; role?: AdminUser['role'] };
    if (data.status === 'Active') {
      return {
        isLoading: false,
        isAuthenticated: true,
        isAuthorizedAdmin: true,
        isBootstrappedOwner: false,
        isFirebaseConfigured: true,
        uid: user.uid,
        adminEmail: email,
        displayName,
        adminRole: data.role ?? 'Content Editor',
        unauthorizedReason: null,
      };
    }
    return {
      isLoading: false,
      isAuthenticated: true,
      isAuthorizedAdmin: false,
      isBootstrappedOwner: false,
      isFirebaseConfigured: true,
      uid: user.uid,
      adminEmail: email,
      displayName,
      adminRole: null,
      unauthorizedReason: `Your administrator account status is "${data.status ?? 'Pending'}". Contact the Super Admin to activate access.`,
    };
  }

  return {
    isLoading: false,
    isAuthenticated: true,
    isAuthorizedAdmin: false,
    isBootstrappedOwner: false,
    isFirebaseConfigured: true,
    uid: user.uid,
    adminEmail: email,
    displayName,
    adminRole: null,
    unauthorizedReason: `Access denied: ${email ?? 'This Google account'} is not an authorized administrator.`,
  };
}

class FirebaseAuthService {
  private currentSession: AuthSessionState = INITIAL_SESSION;

  getSessionState(): AuthSessionState {
    return this.currentSession;
  }

  subscribeSession(callback: (session: AuthSessionState) => void): () => void {
    return onAuthStateChanged(auth, (user) => {
      if (!user) {
        this.currentSession = {
          isLoading: false,
          isAuthenticated: false,
          isAuthorizedAdmin: false,
          isBootstrappedOwner: false,
          isFirebaseConfigured: true,
          uid: null,
          adminEmail: null,
          displayName: null,
          adminRole: null,
          unauthorizedReason: null,
        };
        callback(this.currentSession);
        return;
      }

      void verifyAdminAuthorization(user).then((session) => {
        this.currentSession = session;
        callback(session);
      });
    });
  }

  async signInWithGoogle(): Promise<AuthAttemptResult> {
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const session = await verifyAdminAuthorization(cred.user);
      this.currentSession = session;

      if (!session.isAuthorizedAdmin) {
        return {
          success: false,
          message:
            session.unauthorizedReason ??
            'Signed-in Google account is not an authorized administrator.',
        };
      }

      return {
        success: true,
        message: `Signed in as ${session.adminEmail ?? 'Administrator'}.`,
      };
    } catch (error) {
      const code = (error as { code?: string })?.code ?? '';
      if (code === 'auth/popup-closed-by-user') {
        return {
          success: false,
          message: 'Sign-in popup was closed before completion.',
        };
      }
      if (code === 'auth/popup-blocked') {
        return {
          success: false,
          message:
            'Browser blocked the Google sign-in popup. Allow popups for this preview window and try again.',
        };
      }
      if (code === 'auth/unauthorized-domain') {
        return {
          success: false,
          message:
            'This domain is not yet listed under Firebase Console -> Authentication -> Settings -> Authorized domains.',
        };
      }
      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'Unable to complete Google sign-in.',
      };
    }
  }

  async signOut(): Promise<AuthSessionState> {
    await firebaseSignOut(auth);
    this.currentSession = {
      isLoading: false,
      isAuthenticated: false,
      isAuthorizedAdmin: false,
      isBootstrappedOwner: false,
      isFirebaseConfigured: true,
      uid: null,
      adminEmail: null,
      displayName: null,
      adminRole: null,
      unauthorizedReason: null,
    };
    return this.currentSession;
  }
}

export const authService = new FirebaseAuthService();
