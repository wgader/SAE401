import Client from 'ssh2-sftp-client';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// On charge les accès depuis le dossier actuel (frontend)
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

async function deploy() {
  const sftp = new Client();
  
  const config = {
    host: process.env.SFTP_HOST,
    username: process.env.SFTP_USER,
    password: process.env.SFTP_PASSWORD,
    port: 22
  };

  // Le dossier local est le dossier backend (un cran au-dessus puis backend/)
  const localPath = path.resolve(__dirname, '../backend/');
  const remotePath = process.env.SFTP_REMOTE_BACKEND_PATH || 'public_html/SAE401/backend/';

  if (!config.host || !config.username || !config.password) {
    console.error('❌ Erreur: Les accès SFTP doivent être définis dans .env.local');
    process.exit(1);
  }

  try {
    console.log(`🚀 Connexion à ${config.host}...`);
    await sftp.connect(config);
    
    console.log(`📂 Vérification du dossier distant: ${remotePath}...`);
    const exists = await sftp.exists(remotePath);
    if (!exists) {
      console.log(`📁 Création du dossier ${remotePath}...`);
      await sftp.mkdir(remotePath, true);
    }

    console.log(`📤 Upload du dossier backend (${localPath}) vers ${remotePath}...`);
    console.log(`🚫 Exclusions configurées pour protéger tes données.`);

    await sftp.uploadDir(localPath, remotePath, {
      filter: (localFile, isDir) => {
        const relativePath = path.relative(localPath, localFile).replace(/\\/g, '/');
        
        // 1. NE PAS TOUCHER à vendor (trop lourd / inutile)
        if (relativePath === 'vendor' || relativePath.startsWith('vendor/')) return false;
        
        // 2. NE PAS TOUCHER aux uploads (images utilisateurs)
        if (relativePath === 'public/uploads' || relativePath.startsWith('public/uploads/')) return false;
        
        // 3. NE PAS TOUCHER aux .htaccess (sécurité serveur)
        if (relativePath === '.htaccess' || relativePath === 'public/.htaccess') return false;
        
        // 4. NE PAS TOUCHER aux logs et cache (var/)
        if (relativePath === 'var' || relativePath.startsWith('var/')) return false;

        // 5. Ignorer les dossiers node_modules s'ils traînent
        if (relativePath === 'node_modules' || relativePath.startsWith('node_modules/')) return false;

        return true;
      }
    });
    
    console.log('✅ Déploiement backend réussi !');
    console.log('💡 Note : Tes dossiers uploads/ et fichiers .htaccess sont restés intacts sur le serveur.');
  } catch (err) {
    console.error('❌ Erreur lors du déploiement:', err.message);
  } finally {
    await sftp.end();
  }
}

deploy();
