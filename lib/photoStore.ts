import { getStore } from "@netlify/blobs";

export const PHOTO_STORE = "wedding-photos";

export function photoStore() {
  return getStore(PHOTO_STORE);
}
