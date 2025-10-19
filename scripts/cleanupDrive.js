import { google } from "googleapis";
import dotenv from "dotenv";
dotenv.config();

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
  scopes: ["https://www.googleapis.com/auth/drive"],
});
const drive = google.drive({ version: "v3", auth });
const res = await drive.files.list({ pageSize: 50 });
for (const f of res.data.files) {
  await drive.files.delete({ fileId: f.id });
  console.log(`Deleted ${f.name}`);
}
