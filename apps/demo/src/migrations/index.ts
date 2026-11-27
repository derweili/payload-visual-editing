import * as migration_20261127_183327_initial from './20261127_183327_initial';

export const migrations = [
  {
    up: migration_20261127_183327_initial.up,
    down: migration_20261127_183327_initial.down,
    name: '20261127_183327_initial'
  },
];
