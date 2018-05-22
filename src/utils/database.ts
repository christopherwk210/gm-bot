// Imports
const Datastore = require('nedb');

export = {
  /**
   * Sets up database connection with nedb
   * @returns {object} The database object containing all DB references
   */
  initializeDatabase: function() {
    let db: any = {};
  
    // Voip log database
    // Responsible for holding log information about voice channel activity
    db.voip = new Datastore({
      filename:'./src/data/voip.db',
      autoload: true,
      onload: function() {
        // Auto compact every 4 hours
        db.voip.persistence.setAutocompactionInterval(3600000 * 12);
      }
    });
  
    // Presence log database
    // Responsible for holding log information regarding server-wide user presence
    db.profile = new Datastore({
      filename:'./src/data/profile.db',
      autoload: true,
      onload: function() {
        // Auto compact every 4 hours
        db.voip.persistence.setAutocompactionInterval(3600000 * 24);
      }
    });
  
    return db;
  }
};
