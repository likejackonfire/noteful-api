const express = require('express');
const logger = require('../logger');
const jsonParser = express.json();
const foldersService = require('./folders-service');
const xss = require('xss');

const foldersRouter = express.Router();

function sanitizeFolder(folder) {
  return {
    id: folder.id,
    folder_name: xss(folder.folder_name)
  };
}

foldersRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    foldersService.getAllFolders(knexInstance)
      .then(folders => {
        return res.json(folders.map(folder => sanitizeFolder(folder)));
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const knexInstance = req.app.get('db');
    const { folder_name } = req.body;
    if (!folder_name) {
      return res.status(400).json({error: {message: 'Missing title in request body'}});
    }
    foldersService.insertFolder(knexInstance, { folder_name })
      .then(folder => {
        logger.info(`Created folder with id ${folder.id}`);
        res
          .status(201)
          .location(`/api/folders/${folder.id}`)
          .json(sanitizeFolder(folder));
      });
  })
  .delete((req, res, next) => {
    const { id } = req.params;
    foldersService.deleteFolder(req.app.get('db'), id)
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  });


foldersRouter
  .route('/:folderId')
  .all((req, res, next) => {
    const folderId = req.params.folderId;
    const db = req.app.get('db');
    foldersService.getFolderById(db, folderId)
      .then(folder => {
        if (!folder) {
          logger.error(`Folder with id ${folderId} not found`);
          return res.status(404).json({
            error: {message: `Folder with id ${folderId} not found` }
          });
        }
        res.folder = folder;
        next();
      })
      .catch(next);
  })
  .delete((req, res, next) => {
    const id = req.params.folderId;
    const db = req.app.get('db');
    foldersService.deleteFolder(db, id)
      .then(() => {
        logger.info(`Folder with id ${id} deleted`);
        res.status(204).end();
      })
      .catch(next);
  })
  .patch(jsonParser, (req, res, next) => {
    const { folder_name } = req.body;
    const id = req.params.folderId;
    if (!folder_name) {
      return res.status(400).json({error: { message: 'No updated fields were found to update from'}});
    }
    const newFolder = { folder_name };
    const db = req.app.get('db');
    foldersService.updateFolder(db, id, newFolder)
      .then(() => {
        logger.info(`Folder with id ${id} updated with name ${folder_name}`);
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = foldersRouter;