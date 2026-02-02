import { generateKeyPairSync } from 'crypto';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const KEYS_DIR = join(process.cwd(), 'keys');

function generateRSAKeys() {
  console.log('Generating RSA key pair...\n');

  // Ensure keys directory exists
  if (!existsSync(KEYS_DIR)) {
    mkdirSync(KEYS_DIR, { recursive: true });
  }

  // Generate RSA key pair
  const { publicKey, privateKey } = generateKeyPairSync('rsa', {
    modulusLength: 4096, // Strong key size
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
    },
  });

  // Write keys to files
  writeFileSync(join(KEYS_DIR, 'private.pem'), privateKey);
  writeFileSync(join(KEYS_DIR, 'public.pem'), publicKey);

  console.log('RSA keys generated successfully!\n');
  console.log(`   Private key: ${join(KEYS_DIR, 'private.pem')}`);
  console.log(`   Public key: ${join(KEYS_DIR, 'public.pem')}`);
  console.log('');
  console.log('IMPORTANT:');
  console.log('   - Keep private.pem SECRET - never commit to git');
  console.log('   - public.pem will be embedded in plugins');
  console.log('   - Backup both keys securely');
  console.log('');
  console.log('Copy the following to your .env.local file:\n');
  console.log('LICENSE_PRIVATE_KEY="' + privateKey.replace(/\n/g, '\\n') + '"');
  console.log('');
  console.log('LICENSE_PUBLIC_KEY="' + publicKey.replace(/\n/g, '\\n') + '"');
}

generateRSAKeys();
