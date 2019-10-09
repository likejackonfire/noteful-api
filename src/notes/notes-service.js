const NotesService = {
  // gets all notes
  getAllNotes(knex){
    return knex.select('*').from('notes');
  },

  // get a single note
  getById(knex, id){
    return knex
      .from('notes')
      .select('*')
      .where({id});
  },

  // insert note
  insertNote(knex, newNote){
    return knex
      .insert(newNote)
      .into('notes')
      .returning('*')
      .then(row => row[0]);
  },

  deleteById(knex, id){
    return knex
      .from('notes')
      .where('id', id)
      .del()
  }

};

module.exports = NotesService;