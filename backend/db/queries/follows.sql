-- name: FollowUser :exec
INSERT INTO follows (follower_id, following_id)
VALUES ($1, $2)
ON CONFLICT DO NOTHING;

-- name: UnfollowUser :exec
DELETE FROM follows WHERE follower_id = $1 AND following_id = $2;

-- name: IsFollowing :one
SELECT EXISTS(
  SELECT 1 FROM follows WHERE follower_id = $1 AND following_id = $2
);
