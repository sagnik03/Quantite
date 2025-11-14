import { NFTStorage, File } from "nft.storage";

const WEB3STORAGE_TOKEN = process.env.WEB3STORAGE_TOKEN;

if (!WEB3STORAGE_TOKEN) {
  console.warn("WEB3STORAGE_TOKEN not set - IPFS uploads will fail");
}

function getClient(): NFTStorage {
  if (!WEB3STORAGE_TOKEN) {
    throw new Error("Web3.Storage/NFT.Storage token not configured");
  }
  return new NFTStorage({ token: WEB3STORAGE_TOKEN });
}

export async function uploadToIPFS(fileBuffer: Buffer, filename: string): Promise<string> {
  try {
    const client = getClient();
    
    // Create a File object from the buffer
    const file = new File([fileBuffer], filename);
    
    // Upload to IPFS via NFT.Storage (uses same infrastructure as Web3.Storage)
    const cid = await client.storeBlob(file);

    console.log(`File uploaded to IPFS with CID: ${cid}`);
    return cid;
  } catch (error: any) {
    console.error("IPFS upload error:", error);
    throw new Error(`IPFS upload failed: ${error.message}`);
  }
}
