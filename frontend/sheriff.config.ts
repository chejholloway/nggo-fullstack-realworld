import type { SheriffConfig } from '@softarc/sheriff-core';

export const sheriffConfig: SheriffConfig = {
  version: 1,
  tagging: {
    'apps/<app>': ['type:app', 'scope:<app>'],
    '<domain>/feature-<name>': ['type:feature', 'scope:<domain>'],
    '<domain>/ui-<name>': ['type:ui', 'scope:<domain>'],
    '<domain>/data-access': ['type:data-access', 'scope:<domain>'],
    '<domain>/util-<name>': ['type:util', 'scope:<domain>'],
    'libs/<domain>/feature-<name>': ['type:feature', 'scope:<domain>'],
    'libs/<domain>/ui-<name>': ['type:ui', 'scope:<domain>'],
    'libs/<domain>/data-access': ['type:data-access', 'scope:<domain>'],
    'libs/<domain>/util-<name>': ['type:util', 'scope:<domain>'],
    // Allow tag named 'noTag' to exist in code without circular deps
    noTag: ['type:util'],
  },
  depRules: {
    root: ['*'],
    'type:app': ['type:feature', 'type:ui', 'type:data-access', 'type:util'],
    'type:feature': ['type:ui', 'type:data-access', 'type:util'],
    'type:ui': ['type:util', 'type:data-access'],
    'type:data-access': ['type:util'],
    'type:util': [],

    // Domain rules
    'scope:articles': ['scope:auth', 'scope:profile', 'scope:shared', 'scope:comments'],
    'scope:profile': ['scope:auth', 'scope:articles', 'scope:shared'],
    'scope:auth': ['scope:shared'],
    'scope:comments': ['scope:auth', 'scope:shared'],
    'scope:shared': ['scope:auth'],
    'scope:conduit': ['*'],

    // Allow library/test/name-tag {'noTag'} to exist without imposing dependencies
    noTag: [],
  },
};
