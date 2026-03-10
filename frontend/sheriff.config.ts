import type { SheriffConfig } from '@softarc/sheriff-core';

export const sheriffConfig: SheriffConfig = {
  version: 1,
  tagging: {
    'apps/<app>': ['type:app', 'scope:<app>'],
    '<domain>/<type>': ['type:<type>', 'scope:<domain>'],
  },
  depRules: {
    root: ['*'],
    'type:app': ['type:feature', 'type:ui', 'type:data-access', 'type:util'],
    'type:feature': ['type:ui', 'type:data-access', 'type:util'],
    'type:ui': ['type:util'],
    'type:data-access': ['type:util'],
    'type:util': [],
  },
};
