declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;
    PARKTHARA_ADMIN_EMAIL?: string;
    /** Legacy deployment key retained during the brand transition. */
    PARKNIVA_ADMIN_EMAIL?: string;
  }
}
