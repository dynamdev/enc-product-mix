export interface INft {
  tokenId: number;
  mintDate: Date | null;
  title: string;
  description: string;
  jsonCid: string;
  videoCid: string;
  thumbnailCid: string;
}
