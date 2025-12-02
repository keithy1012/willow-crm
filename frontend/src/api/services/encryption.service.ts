import nacl from 'tweetnacl';
import * as naclUtil from 'tweetnacl-util';

interface KeyPair {
  publicKey: string;
  privateKey: string;
}

interface EncryptedMessage {
  ciphertext: string;
  ephemeralPublicKey: string;
  nonce: string;
}

class EncryptionService {
  private keyPair: KeyPair | null = null;
  private readonly STORAGE_KEY = 'encryption_keypair';
  
  /**
   * Initialize or retrieve the user's key pair
   */
  async initializeKeys(): Promise<KeyPair> {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    
    if (stored) {
      try {
        this.keyPair = JSON.parse(stored);
        console.log('✅ Loaded existing encryption keys');
        return this.keyPair!;
      } catch (error) {
        console.error('Failed to parse stored keys, generating new ones');
      }
    }
    
    // Generate new key pair using NaCl
    const keypair = nacl.box.keyPair();
    
    this.keyPair = {
      publicKey: naclUtil.encodeBase64(keypair.publicKey),
      privateKey: naclUtil.encodeBase64(keypair.secretKey),
    };
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.keyPair));
    console.log('✅ Generated new encryption keys');
    
    return this.keyPair;
  }
  
  /**
   * Get the current public key
   */
  getPublicKey(): string {
    if (!this.keyPair) {
      throw new Error('Keys not initialized. Call initializeKeys() first.');
    }
    return this.keyPair.publicKey;
  }
  
  /**
   * Encrypt a message for a recipient using their public key
   */
  async encryptMessage(
    message: string,
    recipientPublicKey: string
  ): Promise<EncryptedMessage> {
    if (!this.keyPair) {
      throw new Error('Keys not initialized');
    }
    
    try {
      // Generate ephemeral key pair for forward secrecy
      const ephemeralKeyPair = nacl.box.keyPair();
      
      // Convert recipient's public key from base64
      const recipientPubKey = naclUtil.decodeBase64(recipientPublicKey);
      
      // Generate random nonce
      const nonce = nacl.randomBytes(nacl.box.nonceLength);
      
      // Encrypt message
      const messageUint8 = naclUtil.decodeUTF8(message);
      const encrypted = nacl.box(
        messageUint8,
        nonce,
        recipientPubKey,
        ephemeralKeyPair.secretKey
      );
      
      console.log('🔒 Message encrypted successfully');
      
      return {
        ciphertext: naclUtil.encodeBase64(encrypted),
        ephemeralPublicKey: naclUtil.encodeBase64(ephemeralKeyPair.publicKey),
        nonce: naclUtil.encodeBase64(nonce),
      };
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt message');
    }
  }
  
  /**
   * Decrypt a message using the ephemeral public key
   */
  async decryptMessage(
    encryptedMessage: EncryptedMessage
  ): Promise<string> {
    if (!this.keyPair) {
      throw new Error('Keys not initialized');
    }
    
    try {
      // Convert from base64
      const ciphertext = naclUtil.decodeBase64(encryptedMessage.ciphertext);
      const ephemeralPubKey = naclUtil.decodeBase64(encryptedMessage.ephemeralPublicKey);
      const nonce = naclUtil.decodeBase64(encryptedMessage.nonce);
      const privateKey = naclUtil.decodeBase64(this.keyPair.privateKey);
      
      // Decrypt message
      const decrypted = nacl.box.open(
        ciphertext,
        nonce,
        ephemeralPubKey,
        privateKey
      );
      
      if (!decrypted) {
        throw new Error('Decryption failed - invalid key or corrupted data');
      }
      
      console.log('🔓 Message decrypted successfully');
      
      return naclUtil.encodeUTF8(decrypted);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt message');
    }
  }
  
  /**
   * Clear stored keys (on logout)
   */
  clearKeys(): void {
    this.keyPair = null;
    localStorage.removeItem(this.STORAGE_KEY);
    console.log('🗑️ Encryption keys cleared');
  }
  
  /**
   * Rotate keys (should be done periodically for security)
   */
  async rotateKeys(): Promise<KeyPair> {
    console.log('🔄 Rotating encryption keys');
    this.clearKeys();
    return this.initializeKeys();
  }

  /**
   * Check if keys are initialized
   */
  isInitialized(): boolean {
    return this.keyPair !== null;
  }
}

export const encryptionService = new EncryptionService();