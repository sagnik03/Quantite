import { PinataSDK } from "pinata";

const PINATA_JWT = process.env.PINATA_JWT;

if (!PINATA_JWT) {
  console.warn("PINATA_JWT not set - IPFS uploads will fail");
}

function getClient(): PinataSDK {
  if (!PINATA_JWT) {
    throw new Error("Pinata JWT token not configured");
  }
  return new PinataSDK({
    pinataJwt: PINATA_JWT,
  });
}

export async function uploadToIPFS(fileBuffer: Buffer, filename: string): Promise<string> {
  try {
    const client = getClient();
    
    const file = new File([fileBuffer], filename, {
      type: "application/octet-stream"
    });
    
    const result = await client.upload.public.file(file);

    console.log(`File uploaded to IPFS with CID: ${result.cid}`);
    return result.cid;
  } catch (error: any) {
    console.error("IPFS upload error:", error);
    throw new Error(`IPFS upload failed: ${error.message}`);
  }
}
