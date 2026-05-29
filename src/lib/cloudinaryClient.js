const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error || new Error("Failed to read file"));
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

export async function compressImage(file, maxWidth = 1920, quality = 0.82) {
  if (!file.type.startsWith("image/")) return file;
  const dataUrl = await fileToDataUrl(file);
  const image = await new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });

  const ratio = Math.min(1, maxWidth / image.width);
  if (ratio === 1 && file.size <= MAX_UPLOAD_BYTES) return file;

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(image.width * ratio);
  canvas.height = Math.round(image.height * ratio);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
  if (!blob) return file;
  return new File([blob], file.name.replace(/\.\w+$/, ".jpg"), { type: "image/jpeg" });
}

export async function uploadToCloudinary(file, metadata = {}) {
  const prepared = await compressImage(file);
  if (prepared.size > MAX_UPLOAD_BYTES) {
    throw new Error("File too large after compression. Maximum 8MB.");
  }

  const signatureRes = await fetch("/api/cloudinary-signature", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(metadata)
  });
  if (!signatureRes.ok) {
    throw new Error("Could not get upload signature.");
  }
  const signed = await signatureRes.json();

  const formData = new FormData();
  formData.set("file", prepared);
  formData.set("api_key", signed.apiKey);
  formData.set("timestamp", String(signed.timestamp));
  formData.set("signature", signed.signature);
  formData.set("folder", signed.folder);
  if (signed.uploadPreset) formData.set("upload_preset", signed.uploadPreset);

  const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${signed.cloudName}/auto/upload`, {
    method: "POST",
    body: formData
  });
  if (!uploadRes.ok) {
    const errorText = await uploadRes.text();
    throw new Error(`Cloudinary upload failed: ${errorText}`);
  }
  return uploadRes.json();
}
