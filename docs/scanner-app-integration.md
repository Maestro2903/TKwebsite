# Scanner App Integration Guide

## Overview
This document explains how to integrate QR code decryption into your scanner app for offline validation.

## Encryption Details
- **Algorithm**: AES-256-CBC
- **Format**: `IV:ENCRYPTED_DATA` (both hex encoded)
- **Key**: 32-character secret (same as backend `QR_ENCRYPTION_KEY`)

---

## QR Code Data Structure

### Individual Pass
```json
{
  "id": "pass_abc123",
  "name": "John Doe",
  "passType": "day_pass",
  "events": ["tech-hackathon", "robotics-workshop"],
  "days": ["2026-02-26", "2026-02-27"]
}
```

### Group Event Pass
```json
{
  "id": "pass_xyz789",
  "passType": "group_events",
  "teamName": "Code Warriors",
  "members": [
    {"name": "John Doe", "isLeader": true},
    {"name": "Jane Smith", "isLeader": false},
    {"name": "Bob Johnson", "isLeader": false}
  ],
  "events": ["treasure-hunt", "borderland-protocol"],
  "days": ["2026-02-27"]
}
```

---

## Implementation Examples

### JavaScript/TypeScript (Node.js or React Native)

```typescript
import crypto from 'crypto';

const SECRET_KEY = 'c82a64c06c982ee1d50863aca97856cc'; // Same as backend
const ALGORITHM = 'aes-256-cbc';

function decryptQRData(encryptedText: string): any {
  try {
    // Split IV and encrypted data
    const [ivHex, encryptedHex] = encryptedText.split(':');
    
    if (!ivHex || !encryptedHex) {
      throw new Error('Invalid QR format');
    }
    
    // Convert from hex
    const iv = Buffer.from(ivHex, 'hex');
    const key = Buffer.from(SECRET_KEY, 'utf8');
    
    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    
    // Decrypt
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    // Parse JSON
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Invalid or corrupted QR code');
  }
}

// Usage
const scannedQR = "a3f5b2c8d4e5f6g7:h8i9j0k1l2m3n4o5...";
const passData = decryptQRData(scannedQR);
console.log(passData);
```

### React Native with Crypto-JS

```javascript
import CryptoJS from 'crypto-js';

const SECRET_KEY = 'c82a64c06c982ee1d50863aca97856cc';

function decryptQRData(encryptedText) {
  try {
    const [ivHex, encryptedHex] = encryptedText.split(':');
    
    // Convert hex to WordArray
    const iv = CryptoJS.enc.Hex.parse(ivHex);
    const encrypted = CryptoJS.enc.Hex.parse(encryptedHex);
    const key = CryptoJS.enc.Utf8.parse(SECRET_KEY);
    
    // Decrypt
    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext: encrypted },
      key,
      { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
    );
    
    // Convert to string and parse JSON
    const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedText);
  } catch (error) {
    throw new Error('Invalid QR code');
  }
}
```

### Flutter/Dart

```dart
import 'dart:convert';
import 'package:encrypt/encrypt.dart';

const String SECRET_KEY = 'c82a64c06c982ee1d50863aca97856cc';

Map<String, dynamic> decryptQRData(String encryptedText) {
  try {
    final parts = encryptedText.split(':');
    if (parts.length != 2) {
      throw Exception('Invalid QR format');
    }
    
    final ivHex = parts[0];
    final encryptedHex = parts[1];
    
    // Create key and IV
    final key = Key.fromUtf8(SECRET_KEY);
    final iv = IV.fromBase16(ivHex);
    
    // Create encrypter
    final encrypter = Encrypter(AES(key, mode: AESMode.cbc));
    
    // Decrypt
    final encrypted = Encrypted.fromBase16(encryptedHex);
    final decrypted = encrypter.decrypt(encrypted, iv: iv);
    
    // Parse JSON
    return jsonDecode(decrypted);
  } catch (e) {
    throw Exception('Decryption failed: $e');
  }
}
```

---

## Validation Logic

### Basic Offline Validation

```typescript
function validatePass(passData: any, currentEventId: string, todayDate: string): boolean {
  // Check if pass allows this event
  if (!passData.events.includes(currentEventId)) {
    console.log('❌ Event not allowed for this pass');
    return false;
  }
  
  // Check if pass is valid for today
  if (!passData.days.includes(todayDate)) {
    console.log('❌ Pass not valid for today');
    return false;
  }
  
  return true;
}

// Usage
const passData = decryptQRData(scannedQR);
const currentEventId = 'tech-hackathon';
const todayDate = '2026-02-26';

if (validatePass(passData, currentEventId, todayDate)) {
  // Display user info
  if (passData.passType === 'group_events') {
    console.log(`Team: ${passData.teamName}`);
    passData.members.forEach(member => {
      console.log(`  - ${member.name} ${member.isLeader ? '(Leader)' : ''}`);
    });
  } else {
    console.log(`Name: ${passData.name}`);
  }
  
  // Allow entry
  console.log('✅ Entry allowed');
} else {
  console.log('❌ Entry denied');
}
```

### UI Display Example

```typescript
function displayPassInfo(passData: any) {
  if (passData.passType === 'group_events') {
    return {
      type: 'group',
      teamName: passData.teamName,
      members: passData.members,
      memberCount: passData.members.length,
      leader: passData.members.find(m => m.isLeader)?.name
    };
  } else {
    return {
      type: 'individual',
      name: passData.name,
      passType: passData.passType
    };
  }
}
```

---

## Security Considerations

### ✅ Best Practices
1. **Hardcode the key** in the scanner app (not in config files)
2. **Validate data structure** after decryption
3. **Handle errors gracefully** (corrupted QR, wrong format)
4. **Log scan attempts** for audit trail
5. **Sync to Firebase** when online to mark as used

### ⚠️ Limitations
- Secret key can be extracted if app is decompiled
- QR codes can be copied/screenshotted
- No server-side validation in offline mode

### 🛡️ Additional Security (Optional)
- Add timestamp validation (expire QR after X minutes)
- Track used pass IDs locally to prevent reuse
- Implement rate limiting on scans

---

## Testing

### Test Decryption

```typescript
// Test with a known encrypted string
const testEncrypted = "YOUR_TEST_ENCRYPTED_STRING";
try {
  const result = decryptQRData(testEncrypted);
  console.log('✅ Decryption successful:', result);
} catch (error) {
  console.error('❌ Decryption failed:', error);
}
```

### Generate Test QR

Run this on the backend to generate a test QR:

```bash
node scripts/db/generate-test-qr.js
```

---

## Deployment Checklist

- [ ] Add `SECRET_KEY` to scanner app (hardcoded)
- [ ] Implement decryption function
- [ ] Test with sample encrypted QR
- [ ] Implement validation logic
- [ ] Add UI to display pass info
- [ ] Test offline mode
- [ ] Implement online sync for marking passes as used
- [ ] Deploy scanner app update

---

## Support

For questions or issues:
1. Check that `SECRET_KEY` matches backend exactly
2. Verify QR format is `IV:ENCRYPTED_DATA`
3. Test decryption with known sample
4. Check encryption key length (must be 32 characters)

**Backend Encryption Key**: `c82a64c06c982ee1d50863aca97856cc`
