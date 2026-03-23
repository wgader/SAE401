import Client from 'ssh2-sftp-client';
import path from 'path';
import dotenv from 'dotenv';

// On charge .env puis .env.local (qui écrase .env si les variables existent)
dotenv.config();
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function deploy() {
  const sftp = new Client();
  
  const config = {
    host: process.env.SFTP_HOST,
    username: process.env.SFTP_USER,
    password: process.env.SFTP_PASSWORD,
    port: 22
  };

  const localPath = path.join(__dirname, 'dist');
  const remotePath = process.env.SFTP_REMOTE_PATH;

  if (!config.host || !config.username || !config.password || !remotePath) {
    console.error('Erreur: Les variables SFTP_HOST, SFTP_USER, SFTP_PASSWORD et SFTP_REMOTE_PATH doivent être définies dans .env.local');
    process.exit(1);
  }

  try {
    console.log(`🚀 Connexion à ${config.host}...`);
    await sftp.connect(config);
    
    console.log(`📂 Vérification du dossier distant: ${remotePath}...`);
    try {
      const exists = await sftp.exists(remotePath);
      if (!exists) {
        console.log(`📁 Création du dossier ${remotePath}...`);
        await sftp.mkdir(remotePath, true);
      }
    } catch (err) {
      console.log(`⚠️ Note: Impossible de vérifier/créer le dossier récursivement (${err.message}). On tente l'upload direct.`);
    }

    console.log(`📤 Upload du dossier dist vers ${remotePath}...`);
    await sftp.uploadDir(localPath, remotePath);
    
    console.log('✅ Déploiement réussi !');
  } catch (err) {
    console.error('❌ Erreur lors du déploiement:', err.message);
  } finally {
    await sftp.end();
  }
}

deploy();
