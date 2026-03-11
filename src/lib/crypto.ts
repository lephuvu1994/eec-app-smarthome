import CryptoJS from 'crypto-js';
import Env from '@env';

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
  initSession(mac: string, _session: number, nonce: number, deviceCode?: string, partnerId?: string) {
    this.mac = mac;
    this.sessionNonce = nonce;
    this.deviceCode = deviceCode || null;
    this.partnerId = partnerId || null;
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
   * The firmware expects PKCS7 padding (mbedtls default for block ciphers if padded)
   * or precisely blocks of 16. CryptoJS handles PKCS7 padding automatically.
   */
  encryptAES128ECB(data: string, secretKey: string = APP_AES_SECRET_KEY): number[] {
    const key = CryptoJS.enc.Utf8.parse(secretKey);
    const encrypted = CryptoJS.AES.encrypt(data, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    });
    
    // Convert to word array to byte array
    const words = encrypted.ciphertext.words;
    const sigBytes = encrypted.ciphertext.sigBytes;
    
    const bytes: number[] = [];
    for (let i = 0; i < sigBytes; i++) {
        const byte = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
        bytes.push(byte);
    }
    
    return bytes;
  }

  /**
   * Decrypt AES-128-ECB
   */
  decryptAES128ECB(encryptedHexOrBase64: string, secretKey: string = APP_AES_SECRET_KEY): string {
    const key = CryptoJS.enc.Utf8.parse(secretKey);
    // Assumes input is a ciphertext object or formatted correctly
    const decrypted = CryptoJS.AES.decrypt(encryptedHexOrBase64, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    });
    
    return decrypted.toString(CryptoJS.enc.Utf8);
  }
}

export const cryptoService = new CryptoService();
