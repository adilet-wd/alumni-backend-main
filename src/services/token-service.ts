import jwt from 'jsonwebtoken';
import { TokenModel } from '../models/token-model';
import { type Document, type Types } from 'mongoose';
import { type Token } from '../types/global';

interface generateTokensReturn {
  accessToken: string
  refreshToken: string
}
class Service {
  generateTokens (payload: any): generateTokensReturn {
    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET as string, { expiresIn: '30m' });
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET as string, { expiresIn: '30d' });
    return {
      accessToken,
      refreshToken
    };
  }

  validateAccessToken (token: string): string | jwt.JwtPayload | null {
    try {
      return jwt.verify(token, process.env.JWT_ACCESS_SECRET as string);
    } catch (e) {
      return null;
    }
  }

  validateRefreshToken (token: string): string | jwt.JwtPayload | null {
    try {
      return jwt.verify(token, process.env.JWT_REFRESH_SECRET as string);
    } catch (e) {
      return null;
    }
  }

  async saveToken (userId: Types.ObjectId, refreshToken: string): Promise<Token> {
    const tokenData = await TokenModel.findOne({ user: userId });
    if (tokenData != null) {
      tokenData.refreshToken = refreshToken;
      return await tokenData.save();
    }
    return await TokenModel.create({ user: userId, refreshToken });
  }

  async removeToken (refreshToken: string): Promise<void> {
    await TokenModel.deleteOne({ refreshToken });
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  async findToken (refreshToken: string): Promise< (Document<unknown, {}, Token> & Token & { _id: Types.ObjectId }) | null> {
    return await TokenModel.findOne({ refreshToken });
  }
}

export const TokenService = new Service();