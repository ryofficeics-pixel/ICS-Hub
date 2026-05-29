import crypto from "node:crypto";

const ALLOWED_MODULES = new Set(["daily", "weekly", "survey", "attendance"]);

function signParams(params, apiSecret) {
  const payload = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
  return crypto.createHash("sha1").update(`${payload}${apiSecret}`).digest("hex");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET || "";
  if (!cloudName || !apiKey || !apiSecret) {
    return res.status(500).json({ error: "Cloudinary environment is not configured." });
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  const moduleName = ALLOWED_MODULES.has(body.module) ? body.module : "daily";
  const projectId = String(body.projectId || "general").replace(/[^a-zA-Z0-9_-]/g, "");
  const recordId = String(body.relatedRecordId || Date.now()).replace(/[^a-zA-Z0-9_-]/g, "");
  const folder = `ics-office-tools/${moduleName}/${projectId}/${recordId}`;
  const timestamp = Math.floor(Date.now() / 1000);

  const signatureParams = {
    folder,
    timestamp
  };
  const signature = signParams(signatureParams, apiSecret);

  return res.status(200).json({
    cloudName,
    apiKey,
    timestamp,
    folder,
    signature,
    uploadPreset
  });
}
