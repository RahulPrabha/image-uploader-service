const Router = require('express-promise-router');

const uploader = require('../util/uploader');
const db = require('../db');

const router = new Router();

module.router = router;

// API: Upload a cat pic.
router.post('/image', uploader.single('file'), async function(req, res, next) {
  if (req.fileMimetypeValidationError) {
    res.status(415); // HTTP 415: Unsupported Media Type
    return next(err);
  } else if (!req.file) {
    res.status(400);
    res.statusMessage = "Please provide an image to upload.";
    return next(err);
  }

  // All images are stored with v4 UUID filenames
  const [fileUuid, fileExtension] = req.file.filename.split(".");
  const description = req.body.description;

  try {
    db.query(
      'INSERT INTO image (external_uuid, file_extension, description) VALUES ($1, $2, $3)',
      [fileUuid, fileExtension, description]
      );  
  } catch (e) {
    console.error(e);
    res.status(500);
    return next(err);
  }

  res.json({ 
    uuid: fileUuid,
    file_url: buildFileUrl(req, req.file.filename),
  });
});

// API: Delete a cat pic.
router.delete('/image/:uuid', async function(req, res, next) {
  const fileUuid = req.params.uuid;
  let result;

  try {
    result = await db.query(
      'UPDATE image ' +
      'SET deleted = true ' +  
      'WHERE external_uuid = $1 AND deleted = false', [fileUuid]
    );  
  } catch (e) {
    console.error(e);
    res.status(500);
    return next(err);
  }

  if (result.rowCount == 0) {
    // DELETE operation is considered idempotent after the first delete.
    // https://developer.mozilla.org/en-US/docs/Glossary/Idempotent
    res.status(404);
    res.statusMessage = "Image not found.";
    return next(err);
  }

  // HTTP 204: No Content success response.
  res.status(204);
  res.end();
});

// API: Update a previously uploaded cat pic.
router.put('/image/:uuid', async function(req, res, next) {
  const fileUuid = req.params.uuid;
  const description = req.body.description;
  let result;
  
  try {
    result = await db.query(
      'UPDATE image ' +
      'SET description = $2 ' +  
      'WHERE external_uuid = $1 AND deleted = false', [fileUuid, description]
    );  
  } catch (e) {
    console.error(e);
    res.status(500);
    return next(err);
  }

  if (result.rowCount == 0) {
    res.status(404);
    res.statusMessage = "Image not found.";
    return next(err);
  }

  // HTTP 204: No Content success response.
  res.status(204);
  res.end();
});

// API: Fetch a particular cat pic by its ID.
router.get('/image/:uuid', async function(req, res, next) {
  const fileUuid = req.params.uuid;
  let result;
  try {
    result = await db.query(
      'SELECT external_uuid, file_extension, description ' +
      'FROM image ' +  
      'WHERE external_uuid = $1 AND deleted = false', [fileUuid]
    );  
  } catch (e) {
    console.error(e);
    res.status(500);
    return next(err);
  }

  if (result.rowCount == 0) {
    res.status(404);
    res.statusMessage = "Image not found.";
    return next(err);
  }

  result.rows.map((row, res) => buildGetResponse(req, row));  

  res.json(result.rows);
});

// API: Fetch a list of the uploaded cat pics.
router.get('/images', async function(req, res, next) {
  let result;
  try {
    result = await db.query(
      'SELECT external_uuid, file_extension, description ' +
      'FROM image ' +  
      'WHERE deleted = false ' +
      'ORDER BY id ASC',
    );  
  } catch (e) {
    console.error(e);
    res.status(500);
    return next(err);
  }

  result.rows.map((row, res) => buildGetResponse(req, row));  

  res.json(result.rows);
});

function buildGetResponse(req, row) {
  if (!req || !row) {
    return;
  }

  const fileName =  row.external_uuid + "." + row.file_extension;
  row.file_url = buildFileUrl(req, fileName);
  delete row.file_extension;
  
  return row;
}

function buildFileUrl(req, fileName) {
  if (!req || !fileName) {
    return;
  }
  
  return req.protocol + '://' + req.get('host') + '/images/' + fileName;
}

module.exports = router;
