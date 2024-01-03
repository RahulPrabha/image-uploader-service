Codecademy Backend Engineering Take-home

Submitter: Rahul Prabhakar

# How to run:

1. Unzip image-uploader-service.zip
2. `cd image-uploader-service`
3. `docker-compose up`

Additional notes:
- DB schema: `image-uploader-service/db/scripts/init.sql`
- Exposed ports:
	- App: `3000`
	- Postgres: `35432`
- `image-uploader-service/.env` file plus containerization allows this project to be relatively portable across prod/dev/staging environments

# API Docs:
`https://documenter.getpostman.com/view/856551/TVt2ciTa`

To **make testing easier**, please see the `image-uploader-service/extras`
1. Sample image to upload (free-use license)
2. Postman collection with template requests (UUIDs need to be replaced)

# Additional API Docs:
- Only the following mimetypes are supported for upload (HTTP 415 returned otherwise):
	- image/gif
	- image/jpeg
	- image/png

- UPDATE calls are limited to metadata. UPDATE does not accept multipart file data. For new images, use the `POST /image` API

- Error messages are returned as HTTP status messages rather than response bodies

- HTTP 400 is returned if necessary parameters are missing
	- e.g. file to be uploaded, UUID as a path variable

- HTTP 204 (Success with empty response) is returned to keep the success responses simple for update (PUT) and delete (DELETE) calls

- GET calls return link to uploaded image. Images are stored/served statically from the public/images directory (not recommended for a production service)
	- A true production system would have images uploaded and served from external block storage (S3) and/or CDNs

- "GET all uploaded images" call returns metadata in submission order (ascending primary key order)

- DELETE is implemented as a soft-delete. Deleting of the actual file can be done asynchronously by separate "worker" machines if implementation went further

- DELETE requests are idempotent. Once an image is deleted, `404 Not Found` statues are returned on subsequent DELETEs of the same image

# Notes on possible future enhancements:
- Uploaded files are renamed with a v4 UUID. UUID might be overkill for a file name. A smaller hash may have sufficed

- Rate-limiting would be a nice addition for such a simple yet vulnerable service. Fixed + moving window rate-limiter https://www.figma.com/blog/an-alternative-approach-to-rate-limiting/
		- Return 429: Too Many Requests if thresholds are exceeded

- Implemented no limit on `description` field length
	- May want to introduce later through router validators

- Malformed UUIDs throw 500s due to Postgres's UUID requirement
	- Better to validate UUID form in a validator and gracefully return an error

- XSS sanitation would also be nice to implement on the `description` field

- Auth not implemented but OAuth 2.0 + password-grant type would be a good next step for this service
	- Introduce user associations (FK) to the images being uploaded

- Tests