import type { Config, Context } from "@netlify/functions";
import { getStore } from "@netlify/blobs";
import { BLOB_STORE, imageKey } from "../../lib/instagram";

/**
 * Serves one copied Instagram image from Blobs.
 *
 * Served from this site's own origin so next/image (and behind it Netlify's
 * image CDN) can resize it, and so nothing breaks when Instagram's signed
 * URLs expire. Keys are Instagram post ids, which never change, so the
 * response can be cached indefinitely.
 */
export default async function instagramImage(request: Request, context: Context) {
  const id = context.params?.id ?? new URL(request.url).pathname.split("/").pop() ?? "";
  if (!/^[\w-]+$/.test(id)) {
    return new Response("Not found", { status: 404 });
  }

  const result = await getStore(BLOB_STORE).getWithMetadata(imageKey(id), { type: "arrayBuffer" });
  if (!result) {
    return new Response("Not found", { status: 404 });
  }

  const contentType = typeof result.metadata?.contentType === "string" ? result.metadata.contentType : "image/jpeg";
  return new Response(result.data, {
    headers: {
      "content-type": contentType,
      "cache-control": "public, max-age=31536000, immutable",
      "netlify-cdn-cache-control": "public, s-maxage=31536000, immutable",
    },
  });
}

export const config: Config = {
  path: "/instagram/image/:id",
};
