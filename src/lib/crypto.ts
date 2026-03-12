// eslint-disable-next-line unicorn/prefer-node-protocol -- React Native runtime doesn't support node: protocol
import { Buffer } from 'buffer';

import Env from '@env';
import QuickCrypto from 'react-native-quick-crypto';

const APP_AES_SECRET_KEY = Env.EXPO_PUBLIC_BLE_AES_KEY;

export class CryptoService {
  private sessionNonce: number | null = null;
  private sessionKey: string | null = null;
  private mac: string | null = null;
  private deviceCode: string | null = null;
  private partnerId: string | null = null;

  /**
   * Initializes session data received from the BLE handshake
   */
  initSession(params: {
    mac: string;
    session: number;
    nonce: number;
    deviceCode?: string;
    partnerId?: string;
  }) {
    this.mac = params.mac;
    this.sessionNonce = params.nonce;
    this.deviceCode = params.deviceCode || null;
    this.partnerId = params.partnerId || null;
    // By default, firmware just uses APP_AES_SECRET_KEY directly for ECB.
    // If future firmware derives a key using the nonce, set it here.
    this.sessionKey = APP_AES_SECRET_KEY;
  }

  getSessionNonce() {
    return this.sessionNonce;
  }

  getMac() {
    return this.mac;
  }

  getDeviceCode() {
    return this.deviceCode;
  }

  getPartnerId() {
    return this.partnerId;
  }

  /**
   * Encrypt data using AES-128-ECB
   * The firmware expects PKCS7 padding (mbedtls default for block ciphers if padded).
   * Node.js crypto (via react-native-quick-crypto) uses PKCS7 padding by default.
   */
  encryptAES128ECB(data: string, secretKey: string = APP_AES_SECRET_KEY): number[] {
    const key = Buffer.from(secretKey, 'utf8');
    // ECB mode does not use an IV, pass empty buffer
    const cipher = QuickCrypto.createCipheriv('aes-128-ecb', key, Buffer.alloc(0));
    const updated = cipher.update(data, 'utf8') as unknown as Buffer;
    const final = cipher.final() as unknown as Buffer;
    const encrypted = Buffer.concat([updated, final]);

    return [...encrypted];
  }

  /**
   * Decrypt AES-128-ECB
   */
  decryptAES128ECB(encryptedHexOrBase64: string, secretKey: string = APP_AES_SECRET_KEY): string {
    const key = Buffer.from(secretKey, 'utf8');
    const encryptedData = Buffer.from(encryptedHexOrBase64, 'base64');
    const decipher = QuickCrypto.createDecipheriv('aes-128-ecb', key, Buffer.alloc(0));
    const updated = decipher.update(encryptedData) as unknown as Buffer;
    const final = decipher.final() as unknown as Buffer;
    const decrypted = Buffer.concat([updated, final]);

    return decrypted.toString('utf8');
  }
}

export const cryptoService = new CryptoService();
