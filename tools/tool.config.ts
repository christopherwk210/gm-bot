import path = require('path');

/** Project option references */
export const Project = {

  /** Root of the project source folder */
  SOURCE_ROOT: path.join(__dirname, '../src')
};

// Echo source config
export * from '../src/config';
