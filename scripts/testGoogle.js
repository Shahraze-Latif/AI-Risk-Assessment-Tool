import { getGoogleAPIs } from '../lib/google/client.js';
import { GOOGLE_CONFIG } from '../lib/google/config.js';
import { listFilesInFolder } from '../lib/google/utils.js';
import dotenv from "dotenv";
dotenv.config();

(async () => {
  try {
    console.log('🧪 Testing Google API access...');
    console.log('📁 Folder ID:', GOOGLE_CONFIG.GOOGLE_DRIVE_FOLDER_ID);
    
    const { drive } = getGoogleAPIs();
    const files = await listFilesInFolder(GOOGLE_CONFIG.GOOGLE_DRIVE_FOLDER_ID);
    
    console.log("✅ Google API connected successfully!");
    console.log("📂 Files in folder:", files.data.files);
    console.log("📊 Total files:", files.data.files?.length || 0);
  } catch (error) {
    console.error("❌ Google API test failed:", error.message);
    console.error("🔍 Error details:", error);
  }
})();
