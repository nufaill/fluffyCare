// backend/src/services/auth/googleService.ts
import { OAuth2Client } from 'google-auth-library';
import { config } from '../../config/env';
import { GoogleUserInfo } from '../../types/auth.types';

export class GoogleAuthService {
  private client: OAuth2Client;

  constructor() {
    this.client = new OAuth2Client(
      config.google.CLIENT_ID,
      config.google.CLIENT_SECRET,
      `${config.client.URL}/auth/google/callback`
    );
  }

  async verifyIdToken(idToken: string): Promise<GoogleUserInfo> {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: config.google.CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new Error('Invalid Google token payload');
      }

      return {
        id: payload.sub,
        email: payload.email!,
        name: payload.name!,
        picture: payload.picture,
        verified_email: payload.email_verified || false,
      };
    } catch (error) {
      console.error('Google token verification failed:', error);
      throw new Error('Invalid Google token');
    }
  }

  generateAuthUrl(): string {
    return this.client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
      ],
    });
  }

  async getTokens(code: string) {
    try {
      const { tokens } = await this.client.getToken(code);
      return tokens;
    } catch (error) {
      console.error('Failed to get Google tokens:', error);
      throw new Error('Failed to authenticate with Google');
    }
  }
}