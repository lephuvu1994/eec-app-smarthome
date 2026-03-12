import { CryptoService } from './crypto';

// Mock react-native-quick-crypto
jest.mock('react-native-quick-crypto', () => {
  const encryptedBuffer = Buffer.from('encrypted-data');
  const decryptedBuffer = Buffer.from('decrypted-data');

  return {
    __esModule: true,
    default: {
      createCipheriv: jest.fn(() => ({
        update: jest.fn(() => encryptedBuffer),
        final: jest.fn(() => Buffer.alloc(0)),
      })),
      createDecipheriv: jest.fn(() => ({
        update: jest.fn(() => decryptedBuffer),
        final: jest.fn(() => Buffer.alloc(0)),
      })),
    },
  };
});

// Mock @env
jest.mock('@env', () => ({
  __esModule: true,
  default: {
    EXPO_PUBLIC_BLE_AES_KEY: '1234567890123456', // 16-byte key for AES-128
  },
}));

describe('CryptoService', () => {
  let service: CryptoService;

  beforeEach(() => {
    service = new CryptoService();
  });

  describe('initSession', () => {
    it('should initialize session with all parameters', () => {
      service.initSession({
        mac: 'AA:BB:CC:DD:EE:FF',
        session: 1,
        nonce: 12345,
        deviceCode: 'DEV001',
        partnerId: 'PARTNER001',
      });

      expect(service.getMac()).toBe('AA:BB:CC:DD:EE:FF');
      expect(service.getSessionNonce()).toBe(12345);
      expect(service.getDeviceCode()).toBe('DEV001');
      expect(service.getPartnerId()).toBe('PARTNER001');
    });

    it('should set deviceCode and partnerId to null when not provided', () => {
      service.initSession({
        mac: 'AA:BB:CC:DD:EE:FF',
        session: 1,
        nonce: 99999,
      });

      expect(service.getMac()).toBe('AA:BB:CC:DD:EE:FF');
      expect(service.getSessionNonce()).toBe(99999);
      expect(service.getDeviceCode()).toBeNull();
      expect(service.getPartnerId()).toBeNull();
    });

    it('should overwrite previous session data', () => {
      service.initSession({
        mac: 'AA:BB:CC:DD:EE:FF',
        session: 1,
        nonce: 111,
        deviceCode: 'OLD',
        partnerId: 'OLD_PARTNER',
      });

      service.initSession({
        mac: '11:22:33:44:55:66',
        session: 2,
        nonce: 222,
        deviceCode: 'NEW',
        partnerId: 'NEW_PARTNER',
      });

      expect(service.getMac()).toBe('11:22:33:44:55:66');
      expect(service.getSessionNonce()).toBe(222);
      expect(service.getDeviceCode()).toBe('NEW');
      expect(service.getPartnerId()).toBe('NEW_PARTNER');
    });
  });

  describe('getters before initSession', () => {
    it('should return null for all getters before initialization', () => {
      expect(service.getMac()).toBeNull();
      expect(service.getSessionNonce()).toBeNull();
      expect(service.getDeviceCode()).toBeNull();
      expect(service.getPartnerId()).toBeNull();
    });
  });

  describe('encryptAES128ECB', () => {
    it('should call createCipheriv and return byte array', () => {
      const QuickCrypto = require('react-native-quick-crypto').default;
      const result = service.encryptAES128ECB('test data');

      expect(QuickCrypto.createCipheriv).toHaveBeenCalledWith(
        'aes-128-ecb',
        expect.any(Buffer),
        expect.any(Buffer),
      );
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should accept custom secret key', () => {
      const QuickCrypto = require('react-native-quick-crypto').default;
      const customKey = 'abcdefghijklmnop'; // 16 bytes
      service.encryptAES128ECB('data', customKey);

      expect(QuickCrypto.createCipheriv).toHaveBeenCalledWith(
        'aes-128-ecb',
        Buffer.from(customKey, 'utf8'),
        expect.any(Buffer),
      );
    });
  });

  describe('decryptAES128ECB', () => {
    it('should call createDecipheriv and return string', () => {
      const QuickCrypto = require('react-native-quick-crypto').default;
      const result = service.decryptAES128ECB('ZW5jcnlwdGVk'); // base64 encoded

      expect(QuickCrypto.createDecipheriv).toHaveBeenCalledWith(
        'aes-128-ecb',
        expect.any(Buffer),
        expect.any(Buffer),
      );
      expect(typeof result).toBe('string');
    });

    it('should accept custom secret key for decryption', () => {
      const QuickCrypto = require('react-native-quick-crypto').default;
      const customKey = 'abcdefghijklmnop';
      service.decryptAES128ECB('ZW5jcnlwdGVk', customKey);

      expect(QuickCrypto.createDecipheriv).toHaveBeenCalledWith(
        'aes-128-ecb',
        Buffer.from(customKey, 'utf8'),
        expect.any(Buffer),
      );
    });
  });
});
