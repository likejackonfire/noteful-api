const foldersService = {
    getAllFolders(db) {
      return db.select('*').from('folders');
    },
    insertFolder(db, newFolder) {
      return db.insert(newFolder)
      .into('folders')
      .returning('*')
      .then(rows => rows[0]);
    },
    getFolderById(db, id) {
      return db('folders')
      .select('*').where('id', id).first();
    },
    deleteFolder(db, id) {
      return db('folders')
      .where('id', id).delete();
    },
    updateFolder(db, id, newFolder) {
      return db('folders')
      .where('id', id).first()
      .update(newFolder);
    }
  };
  
  module.exports = foldersService;