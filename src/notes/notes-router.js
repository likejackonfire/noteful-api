const path = require('path');
const express = require('express');
const xss = require('xss');
const NotesService = require('./notes-service');

const notesRouter = express.Router();
const jsonParser = express.json();

const serializeNote = note => ({
  id: note.id,
  name: xss(note.notename),
  folderid: note.folderid,
  modified: note.modified,
  content: xss(note.content)
});

notesRouter
  .route('/')
  .get((req,res,next) => {
    const knexInstance = req.app.get('db');

    NotesService.getAllNotes(knexInstance)
      .then(note => 
        res.json(note.map(serializeNote))
      )
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const { folderid, notename, content } = req.body;
    const newNote = {
      folderid,
      notename,
      content
    };
    const knexInstance = req.app.get('db');
    if (!folderid || !notename)
      return res.status(400).json({
        error: {message: 'Please provide a name and folder Id'}
      });
    NotesService.insertNote(knexInstance, newNote)
      .then(note => 
        res.status(201)
          .location(path.posix.join(req.originalUrl, `/${note.id}`))
          .json(serializeNote(note))
      )
      .catch(next);
  });

notesRouter
  .route('/:noteid')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');

    NotesService.getById(knexInstance, req.params.noteid)
      .then(note => {
        if(note.length === 0){
          console.log(note);
          return res.status(404).json({
            error: {message: 'Unable to find requested note'}
          });
        } else{

          return res.json(note.map(serializeNote));}}
      )
      .catch(next);
  })
  .delete((req, res, next) => {
    const knexInstance = req.app.get('db');

    NotesService.getById(knexInstance, req.params.noteid)
      .then(note => {
        if(note.length === 0){
          console.log(note);
          return res.status(404).json({
            error: {message: 'Unable to find requested note'}
          });
        } else{

          //     return res.json(note.map(serializeNote));}}
          // )
          // .catch(next);
          NotesService.deleteById(knexInstance, req.params.noteid)
            .then(note => 
              res.status(204).send('deleted')
                .end())
            .catch(next);
        }});
    });


  

module.exports = notesRouter;