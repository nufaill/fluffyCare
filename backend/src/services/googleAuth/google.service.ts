// backend/src/services/googleAuth/googleService.ts
import { OAuth2Client } from 'google-auth-library';
import { config } from '../../config/env';
import { GoogleUserInfo } from '../../types/auth.types';

export class GoogleAuthService {
  private client: OAuth2Client;

  constructor() {
    this.client = new OAuth2Client(
      config.google.CLIENT_ID,
      config.google.CLIENT_SECRET
    );
  }

  async verifyIdToken(idToken: string): Promise<GoogleUserInfo> {
    try {
      console.log("🔧 [GoogleService] Verifying Google ID token...");

      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: config.google.CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new Error('Invalid Google token payload');
      }

      if (!payload.email || !payload.name) {
        throw new Error('Missing required Google profile data');
      }

      console.log("✅ [GoogleService] Token verified successfully");

      return {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture || null,
        verified_email: payload.email_verified || false,
      };
    } catch (error) {
      console.error('❌ [GoogleService] Token verification failed:', error);
      throw new Error('Invalid Google token');
    }
  }
}

// Standalone function for verification (alternative approach)
export async function verifyGoogleToken(idToken: string): Promise<GoogleUserInfo> {
  const client = new OAuth2Client(config.google.CLIENT_ID);

  try {
    console.log("🔧 [GoogleService] Verifying token with standalone function...");

    const ticket = await client.verifyIdToken({
      idToken,
      audience: config.google.CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      throw new Error('Invalid Google token payload');
    }

    if (!payload.email || !payload.name) {
      throw new Error('Missing required Google profile data');
    }

    console.log("✅ [GoogleService] Standalone verification successful");

    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture || null,
      verified_email: payload.email_verified || false,
    };
  } catch (error) {
    console.error('❌ [GoogleService] Standalone verification failed:', error);
    throw new Error('Invalid Google token');
  }
}