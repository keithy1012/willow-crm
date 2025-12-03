import User from "../../models/users/User.js";
import crypto from "crypto";

// Encryption key for encrypting private keys at rest
const ENCRYPTION_KEY =
  process.env.PRIVATE_KEY_ENCRYPTION_SECRET ||
  "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
/**
 * Encrypt private key before storing in database
 */
function encryptPrivateKey(privateKey) {
  const algorithm = "aes-256-gcm";
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    algorithm,
    Buffer.from(ENCRYPTION_KEY, "hex"),
    iv
  );

  let encrypted = cipher.update(privateKey, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  return {
    encryptedData: encrypted,
    iv: iv.toString("hex"),
    authTag: authTag.toString("hex"),
  };
}

/**
 * Decrypt private key from database
 */
function decryptPrivateKey(encryptedData, iv, authTag) {
  const algorithm = "aes-256-gcm";
  const decipher = crypto.createDecipheriv(
    algorithm,
    Buffer.from(ENCRYPTION_KEY, "hex"),
    Buffer.from(iv, "hex")
  );

  decipher.setAuthTag(Buffer.from(authTag, "hex"));

  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

/**
 * GET /api/users/:userId/encryption-keys
 * Get user's encryption keys (both public and private)
 */
export const getEncryptionKeys = async (req, res) => {
  try {
    const { userId } = req.params;

    // Security: User can only get their own keys
    if (req.user.id !== userId && req.user._id.toString() !== userId) {
      return res.status(403).json({
        error: "You can only access your own encryption keys",
      });
    }

    const user = await User.findById(userId).select(
      "publicKey encryptedPrivateKey privateKeyIv privateKeyAuthTag"
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.publicKey || !user.encryptedPrivateKey) {
      return res.status(404).json({
        error: "No encryption keys found for this user",
        hasKeys: false,
      });
    }

    // Decrypt the private key before sending (over HTTPS only!)
    const privateKey = decryptPrivateKey(
      user.encryptedPrivateKey,
      user.privateKeyIv,
      user.privateKeyAuthTag
    );

    res.json({
      publicKey: user.publicKey,
      privateKey: privateKey,
    });
  } catch (error) {
    console.error("Error fetching encryption keys:", error);
    res.status(500).json({ error: "Failed to fetch encryption keys" });
  }
};

/**
 * POST /api/users/:userId/encryption-keys
 * Save/update user's encryption keys
 */
export const saveEncryptionKeys = async (req, res) => {
  try {
    const { userId } = req.params;
    const { publicKey, privateKey } = req.body;

    // Security: User can only set their own keys
    if (req.user.id !== userId && req.user._id.toString() !== userId) {
      return res.status(403).json({
        error: "You can only set your own encryption keys",
      });
    }

    if (!publicKey || !privateKey) {
      return res.status(400).json({
        error: "Both publicKey and privateKey are required",
      });
    }

    // Encrypt the private key before storing
    const { encryptedData, iv, authTag } = encryptPrivateKey(privateKey);

    const user = await User.findByIdAndUpdate(
      userId,
      {
        publicKey: publicKey,
        encryptedPrivateKey: encryptedData,
        privateKeyIv: iv,
        privateKeyAuthTag: authTag,
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    console.log(`✅ Saved encryption keys for user ${userId}`);

    res.json({
      success: true,
      message: "Encryption keys saved successfully",
      publicKey: user.publicKey,
    });
  } catch (error) {
    console.error("Error saving encryption keys:", error);
    res.status(500).json({ error: "Failed to save encryption keys" });
  }
};

/**
 * DELETE /api/users/:userId/encryption-keys
 * Delete user's encryption keys (for key rotation)
 */
export const deleteEncryptionKeys = async (req, res) => {
  try {
    const { userId } = req.params;

    // Security: User can only delete their own keys
    if (req.user.id !== userId && req.user._id.toString() !== userId) {
      return res.status(403).json({
        error: "You can only delete your own encryption keys",
      });
    }

    await User.findByIdAndUpdate(userId, {
      $unset: {
        publicKey: "",
        encryptedPrivateKey: "",
        privateKeyIv: "",
        privateKeyAuthTag: "",
      },
    });

    console.log(`🗑️ Deleted encryption keys for user ${userId}`);

    res.json({
      success: true,
      message: "Encryption keys deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting encryption keys:", error);
    res.status(500).json({ error: "Failed to delete encryption keys" });
  }
};

/**
 * GET /api/users/:userId/public-key
 * Get only the public key (for other users to encrypt messages)
 */
export const getPublicKey = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select("publicKey");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.publicKey) {
      return res.status(404).json({
        error: "User has not set up encryption yet",
        hasPublicKey: false,
      });
    }

    res.json({
      publicKey: user.publicKey,
    });
  } catch (error) {
    console.error("Error fetching public key:", error);
    res.status(500).json({ error: "Failed to fetch public key" });
  }
};
