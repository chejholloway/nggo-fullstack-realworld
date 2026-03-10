import { SheriffConfig } from '@softarc/sheriff-core';

export const sheriffConfig: SheriffConfig = {
  tagging: {
    'libs/articles/feature-<name>': ['domain:articles', 'type:feature'],
    'libs/articles/ui-<name>':      ['domain:articles', 'type:ui'],
    'libs/articles/data-access':    ['domain:articles', 'type:data-access'],

    'libs/auth/feature-<name>':     ['domain:auth', 'type:feature'],
    'libs/auth/data-access':        ['domain:auth', 'type:data-access'],

    'libs/profile/feature-<name>':  ['domain:profile', 'type:feature'],
    'libs/profile/ui-<name>':       ['domain:profile', 'type:ui'],
    'libs/profile/data-access':     ['domain:profile', 'type:data-access'],

    'libs/shared/<name>':           ['domain:shared', 'type:shared'],
  },

  depRules: {
    // features can use their own data-access, UI, and shared libs
    'domain:articles': ['domain:articles', 'domain:shared'],
    'domain:auth':     ['domain:auth',     'domain:shared'],
    'domain:profile':  ['domain:profile',  'domain:shared'],

    // shared can only use shared — no sneaking into feature domains
    'domain:shared': ['domain:shared'],

    // features can't import other features directly
    'type:feature': ['type:data-access', 'type:ui', 'type:shared'],
    'type:ui':      ['type:ui', 'type:shared'],
  },
};
