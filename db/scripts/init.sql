-- Need to switch to template1 DB before I can conditionally drop image_uploader database
\c template1;

DROP DATABASE IF EXISTS image_uploader;

CREATE DATABASE image_uploader;

-- Make sure we're using our `image_uploader` database
\c image_uploader;

CREATE TABLE IF NOT EXISTS image (
  id BIGSERIAL PRIMARY KEY,
  external_uuid uuid UNIQUE NOT NULL,
  file_extension VARCHAR(255) DEFAULT NULL, -- Most OSs have a 255 character limit for file extensions
  description text DEFAULT NULL,
  deleted BOOLEAN NOT NULL DEFAULT FALSE,
  created_on TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
