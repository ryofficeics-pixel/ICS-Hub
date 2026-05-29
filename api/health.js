export default function handler(_req, res) {
  const supabasePublicEnv = Boolean(process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY);
  const cloudinaryEnv = Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );

  res.status(200).json({
    ok: true,
    timestamp: new Date().toISOString(),
    env: {
      supabasePublicEnv,
      cloudinaryEnv
    }
  });
}
