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
   * Initialize keys - either from database or generate new ones
   */
  async initializeKeys(userId?: string): Promise<KeyPair> {
    // OPTION 1: Try to load from memory/session first (fast)
    if (this.keyPair) {
      console.log('✅ Using keys from memory');
      return this.keyPair;
    }

    // OPTION 2: Try sessionStorage (survives page refresh, not cross-device)
    const sessionKeys = sessionStorage.getItem(this.STORAGE_KEY);
    if (sessionKeys) {
      try {
        this.keyPair = JSON.parse(sessionKeys);
        console.log('✅ Loaded keys from session');
        return this.keyPair!;
      } catch (error) {
        console.error('Failed to parse session keys');
      }
    }

    // OPTION 3: Fetch from database (works across devices!)
    if (userId) {
      try {
        const keysFromDB = await this.fetchKeysFromDatabase(userId);
        if (keysFromDB) {
          this.keyPair = keysFromDB;
          sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.keyPair));
          console.log('✅ Loaded keys from database');
          return this.keyPair;
        }
      } catch (error) {
        console.error('Failed to fetch keys from database:', error);
      }
    }

    // OPTION 4: Generate new keys (first time setup)
    return this.generateAndStoreNewKeys(userId);
  }

  /**
   * Fetch encryption keys from the database
   */
  private async fetchKeysFromDatabase(userId: string): Promise<KeyPair | null> {
    try {
      const response = await fetch(`/api/users/${userId}/encryption-keys`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      
      if (data.publicKey && data.encryptedPrivateKey) {
        // Decrypt the private key using user's session
        // (The backend should return the already-decrypted private key over HTTPS)
        return {
          publicKey: data.publicKey,
          privateKey: data.privateKey, // Backend decrypts this for us
        };
      }

      return null;
    } catch (error) {
      console.error('Error fetching keys from database:', error);
      return null;
    }
  }

  /**
   * Generate new keys and store in database
   */
  private async generateAndStoreNewKeys(userId?: string): Promise<KeyPair> {
    const keypair = nacl.box.keyPair();
    
    this.keyPair = {
      publicKey: naclUtil.encodeBase64(keypair.publicKey),
      privateKey: naclUtil.encodeBase64(keypair.secretKey),
    };
    
    // Store in session (temporary, current session only)
    sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.keyPair));
    
    // Store in database (permanent, synced across devices)
    if (userId) {
      try {
        await this.saveKeysToDatabase(userId, this.keyPair);
        console.log('✅ Generated and saved new encryption keys to database');
      } catch (error) {
        console.error('Failed to save keys to database:', error);
        console.log('⚠️ Keys generated but not synced to database');
      }
    } else {
      console.log('⚠️ Generated keys without userId - cannot sync to database');
    }
    
    return this.keyPair;
  }

  /**
   * Save encryption keys to database
   */
  private async saveKeysToDatabase(userId: string, keys: KeyPair): Promise<void> {
    const response = await fetch(`/api/users/${userId}/encryption-keys`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        publicKey: keys.publicKey,
        privateKey: keys.privateKey, // Backend will encrypt this before storing
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to save encryption keys');
    }
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
      const ephemeralKeyPair = nacl.box.keyPair();
      const recipientPubKey = naclUtil.decodeBase64(recipientPublicKey);
      const nonce = nacl.randomBytes(nacl.box.nonceLength);
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
  async decryptMessage(encryptedMessage: EncryptedMessage): Promise<string> {
    if (!this.keyPair) {
      throw new Error('Keys not initialized');
    }
    
    try {
      const ciphertext = naclUtil.decodeBase64(encryptedMessage.ciphertext);
      const ephemeralPubKey = naclUtil.decodeBase64(encryptedMessage.ephemeralPublicKey);
      const nonce = naclUtil.decodeBase64(encryptedMessage.nonce);
      const privateKey = naclUtil.decodeBase64(this.keyPair.privateKey);
      
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
    sessionStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.STORAGE_KEY);
    console.log('🗑️ Encryption keys cleared');
  }
  
  /**
   * Check if keys are initialized
   */
  isInitialized(): boolean {
    return this.keyPair !== null;
  }
}

export const encryptionService = new EncryptionService();