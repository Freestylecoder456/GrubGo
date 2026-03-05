import { db, auth } from '../firebase.config';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword, // Added for registration
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  GithubAuthProvider,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { signInSchema, signUpSchema } from "./validation";

class AuthService {
  constructor() {
    this.googleProvider = new GoogleAuthProvider();
    this.githubProvider = new GithubAuthProvider();
  }

  // 1. Validation Helper
  _validate(schema, data) {
    const result = schema.safeParse(data);
    if (!result.success) {
      // Formats Zod errors into a readable string or you can throw the whole error
      const errorMsg = result.error.errors.map(e => e.message).join(", ");
      throw new Error(errorMsg);
    }
    return result.data;
  }

  async _saveUserToDb(user, additionalData = {}) {
    try {
      const usersRef = doc(db, "Users", user.uid);
      
      // Check if user already exists in database
      const userDoc = await getDoc(usersRef);
      
      if (!userDoc.exists()) {
        // New user - create with default role
        await setDoc(usersRef, {
          uid: user.uid,
          email: user.email,
          displayName: additionalData.username || user.displayName || "New User",
          photoURL: user.photoURL || "",
          role: "user",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } else {
        // Existing user - only update basic info, preserve role and other fields
        await setDoc(usersRef, {
          uid: user.uid,
          email: user.email,
          displayName: additionalData.username || user.displayName || userDoc.data().displayName || "New User",
          photoURL: user.photoURL || userDoc.data().photoURL || "",
          updatedAt: serverTimestamp(),
        }, { merge: true });
      }
    } catch (error) {
      console.error("Firestore Sync Error:", error);
    }
  }

  // 2. Updated Registration (Uses signUpSchema)
  async registerWithEmail(data) {
    // Validate first!
    const validatedData = this._validate(signUpSchema, data);
    
    const result = await createUserWithEmailAndPassword(
      auth, 
      validatedData.email, 
      validatedData.password
    );
    
    await this._saveUserToDb(result.user, { username: validatedData.username });
    return result.user;
  }

  // 3. Updated Login (Uses signInSchema)
  async loginWithEmail(data) {
    const validatedData = this._validate(signInSchema, data);
    
    const result = await signInWithEmailAndPassword(
      auth, 
      validatedData.email, 
      validatedData.password
    );
    return result.user;
  }

  async loginWithOAuth(provider) {
    const result = await signInWithPopup(auth, provider);
    await this._saveUserToDb(result.user);
    return result.user;
  }

  async loginWithGoogle() { return this.loginWithOAuth(this.googleProvider); }
  async loginWithGithub() { return this.loginWithOAuth(this.githubProvider); }
  async logout() { await signOut(auth); }
}

export default new AuthService();
