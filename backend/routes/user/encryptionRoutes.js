import express from 'express';
import { authenticate, verifyToken } from '../../middleware/authentication.js';
import * as encryptionController from '../../controllers/users/encryptionController.js';

const router = express.Router();

/**
 * @route   GET /api/users/:userId/encryption-keys
 * @desc    Get user's encryption keys (public + private)
 * @access  Private (user can only get their own keys)
 */
router.get('/:userId/encryption-keys', authenticate, encryptionController.getEncryptionKeys);

/**
 * @route   POST /api/users/:userId/encryption-keys
 * @desc    Save/update user's encryption keys
 * @access  Private (user can only set their own keys)
 */
router.post('/:userId/encryption-keys', authenticate, encryptionController.saveEncryptionKeys);

/**
 * @route   DELETE /api/users/:userId/encryption-keys
 * @desc    Delete user's encryption keys (for key rotation)
 * @access  Private
 */
router.delete('/:userId/encryption-keys', authenticate, encryptionController.deleteEncryptionKeys);

/**
 * @route   GET /api/users/:userId/public-key
 * @desc    Get ONLY the public key (for other users to encrypt messages to this user)
 * @access  Private (any authenticated user can get public keys)
 */
router.get('/:userId/public-key', authenticate, encryptionController.getPublicKey);

export default router;
