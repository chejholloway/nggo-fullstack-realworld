CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT        NOT NULL UNIQUE,
  username   TEXT        NOT NULL UNIQUE,
  password   TEXT        NOT NULL,
  bio        TEXT        NOT NULL DEFAULT '',
  image      TEXT        NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE articles (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT        NOT NULL UNIQUE,
  title       TEXT        NOT NULL,
  description TEXT        NOT NULL DEFAULT '',
  body        TEXT        NOT NULL DEFAULT '',
  author_id   UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE tags (
  id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE article_tags (
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  tag_id     UUID NOT NULL REFERENCES tags(id)     ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

CREATE TABLE follows (
  follower_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (follower_id, following_id)
);

CREATE TABLE favorites (
  user_id    UUID NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, article_id)
);

CREATE TABLE comments (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  body       TEXT        NOT NULL,
  author_id  UUID        NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
  article_id UUID        NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
