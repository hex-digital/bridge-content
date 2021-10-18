import { createError } from 'h3';
import { withLeadingSlash, withoutTrailingSlash, parseURL } from 'ufo';
import { promises } from 'fs';
import { resolve, dirname } from 'pathe';
import { fileURLToPath } from 'url';

const assets = {
  "/favicon.ico": {
    "type": "image/vnd.microsoft.icon",
    "etag": "\"21bc-XwkmumvsWAWQvKTShmzlcL3xoys\"",
    "mtime": "2021-10-18T18:56:35.742Z",
    "path": "../public/favicon.ico"
  },
  "/_nuxt/00e6aaa.js": {
    "type": "application/javascript",
    "etag": "\"1b68-yd0WjO4s3gnZiLWdv1MbXx0nNA4\"",
    "mtime": "2021-10-18T18:56:35.740Z",
    "path": "../public/_nuxt/00e6aaa.js"
  },
  "/_nuxt/064a1a3.js": {
    "type": "application/javascript",
    "etag": "\"ec6b-eWCbS105T/+T2MpV5gAq/GP6L/4\"",
    "mtime": "2021-10-18T18:56:35.739Z",
    "path": "../public/_nuxt/064a1a3.js"
  },
  "/_nuxt/282bfd4.js": {
    "type": "application/javascript",
    "etag": "\"1a59-6+QA6dZFe1QKHRh4ihuUJQ8la7o\"",
    "mtime": "2021-10-18T18:56:35.738Z",
    "path": "../public/_nuxt/282bfd4.js"
  },
  "/_nuxt/3f3bcea.js": {
    "type": "application/javascript",
    "etag": "\"34e6a-cqgOcOW+B067XmcHbFf/sC4c7a8\"",
    "mtime": "2021-10-18T18:56:35.737Z",
    "path": "../public/_nuxt/3f3bcea.js"
  },
  "/_nuxt/a5ec0bd.js": {
    "type": "application/javascript",
    "etag": "\"944-gNrP+NLpiXXAidN8My0oEdcZfwY\"",
    "mtime": "2021-10-18T18:56:35.734Z",
    "path": "../public/_nuxt/a5ec0bd.js"
  },
  "/_nuxt/e5c92dc.js": {
    "type": "application/javascript",
    "etag": "\"7aa-7DNg/ZqyPFaxWR3YCkyPlRBvozc\"",
    "mtime": "2021-10-18T18:56:35.733Z",
    "path": "../public/_nuxt/e5c92dc.js"
  },
  "/_nuxt/e7a226b.js": {
    "type": "application/javascript",
    "etag": "\"d193-6ByUcu6jR6KW/3lXXD3t0y/0wdA\"",
    "mtime": "2021-10-18T18:56:35.732Z",
    "path": "../public/_nuxt/e7a226b.js"
  }
};

const mainDir = dirname(fileURLToPath(globalThis.entryURL));

function readAsset (id) {
  return promises.readFile(resolve(mainDir, getAsset(id).path))
}

function getAsset (id) {
  return assets[id]
}

const METHODS = ["HEAD", "GET"];
const PUBLIC_PATH = "/_nuxt/";
const TWO_DAYS = 2 * 60 * 60 * 24;
const STATIC_ASSETS_BASE = "/_nuxt/static" + "/" + "1634583380";
async function serveStatic(req, res) {
  if (!METHODS.includes(req.method)) {
    return;
  }
  let id = withLeadingSlash(withoutTrailingSlash(parseURL(req.url).pathname));
  let asset = getAsset(id);
  if (!asset) {
    const _id = id + "/index.html";
    const _asset = getAsset(_id);
    if (_asset) {
      asset = _asset;
      id = _id;
    }
  }
  if (!asset) {
    if (id.startsWith(PUBLIC_PATH) && !id.startsWith(STATIC_ASSETS_BASE)) {
      throw createError({
        statusMessage: "Cannot find static asset " + id,
        statusCode: 404
      });
    }
    return;
  }
  const ifNotMatch = req.headers["if-none-match"] === asset.etag;
  if (ifNotMatch) {
    res.statusCode = 304;
    return res.end("Not Modified (etag)");
  }
  const ifModifiedSinceH = req.headers["if-modified-since"];
  if (ifModifiedSinceH && asset.mtime) {
    if (new Date(ifModifiedSinceH) >= new Date(asset.mtime)) {
      res.statusCode = 304;
      return res.end("Not Modified (mtime)");
    }
  }
  if (asset.type) {
    res.setHeader("Content-Type", asset.type);
  }
  if (asset.etag) {
    res.setHeader("ETag", asset.etag);
  }
  if (asset.mtime) {
    res.setHeader("Last-Modified", asset.mtime);
  }
  if (id.startsWith(PUBLIC_PATH)) {
    res.setHeader("Cache-Control", `max-age=${TWO_DAYS}, immutable`);
  }
  const contents = await readAsset(id);
  return res.end(contents);
}

export { serveStatic as default };
