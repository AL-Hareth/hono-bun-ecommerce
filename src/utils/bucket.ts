import { Storage } from "@google-cloud/storage";

const storage = new Storage({
  keyFilename: process.env.GCP_KEY,
  projectId: process.env.GCP_PROJECT_ID,
});

const bucketName = process.env.GCP_BUCKET_NAME!;
export const bucket = storage.bucket(bucketName);

export async function uploadFile(file: File) {
  // Convert File to Buffer
  const arrayBuffer = await file.arrayBuffer();
  const filename = `images/${Date.now()}-${file.name}`;
  const buffer = Buffer.from(arrayBuffer);

  // Upload to GCP
  const gcsFile = bucket.file(`${filename}`);
  await gcsFile.save(buffer, {
    metadata: { contentType: file.type },
    resumable: false,
  });

  const [publicUrl] = await bucket.file(filename).getSignedUrl({
    version: 'v4',
    action: 'read',
    expires: Date.now() + 60 * 60 * 1000 * 24 * 365 * 10, // 10 years
  });

  return publicUrl;
}
