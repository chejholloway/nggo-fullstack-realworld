package profile

import (
	"context"
	"database/sql"

	"connectrpc.com/connect"

	profilev1 "github.com/chejholloway/conduit-backend/gen/profile/v1"
	"github.com/chejholloway/conduit-backend/internal/auth"
	db "github.com/chejholloway/conduit-backend/db/sqlc"
)

type Handler struct {
	queries *db.Queries
}

func NewHandler(queries *db.Queries) *Handler {
	return &Handler{queries: queries}
}

func (h *Handler) GetProfile(ctx context.Context, req *connect.Request[profilev1.GetProfileRequest]) (*connect.Response[profilev1.GetProfileResponse], error) {
	// Get user by username
	user, err := h.queries.GetUserByUsername(ctx, req.Msg.Username)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, connect.NewError(connect.CodeNotFound, err)
		}
		return nil, connect.NewError(connect.CodeInternal, err)
	}

	// Check if current user is following
	var following bool
	if token, ok := ctx.Value("auth_token").(string); ok && token != "" {
		if currentUserID, err := auth.ValidateToken(token); err == nil {
			following, _ = h.queries.IsFollowing(ctx, db.IsFollowingParams{
				FollowerID:  currentUserID,
				FollowingID: user.ID,
			})
		}
	}

	return connect.NewResponse(&profilev1.GetProfileResponse{
		Profile: &profilev1.Profile{
			Username:  user.Username,
			Bio:       user.Bio,
			Image:     user.Image,
			Following: following,
		},
	}), nil
}

func (h *Handler) Follow(ctx context.Context, req *connect.Request[profilev1.FollowRequest]) (*connect.Response[profilev1.FollowResponse], error) {
	// Extract and validate token
	token, ok := ctx.Value("auth_token").(string)
	if !ok || token == "" {
		return nil, connect.NewError(connect.CodeUnauthenticated, nil)
	}

	currentUserID, err := auth.ValidateToken(token)
	if err != nil {
		return nil, connect.NewError(connect.CodeUnauthenticated, err)
	}

	// Get user to follow
	user, err := h.queries.GetUserByUsername(ctx, req.Msg.Username)
	if err != nil {
		return nil, connect.NewError(connect.CodeNotFound, err)
	}

	// Follow user
	err = h.queries.FollowUser(ctx, db.FollowUserParams{
		FollowerID:  currentUserID,
		FollowingID: user.ID,
	})
	if err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}

	return connect.NewResponse(&profilev1.FollowResponse{
		Profile: &profilev1.Profile{
			Username:  user.Username,
			Bio:       user.Bio,
			Image:     user.Image,
			Following: true,
		},
	}), nil
}

func (h *Handler) Unfollow(ctx context.Context, req *connect.Request[profilev1.UnfollowRequest]) (*connect.Response[profilev1.UnfollowResponse], error) {
	// Extract and validate token
	token, ok := ctx.Value("auth_token").(string)
	if !ok || token == "" {
		return nil, connect.NewError(connect.CodeUnauthenticated, nil)
	}

	currentUserID, err := auth.ValidateToken(token)
	if err != nil {
		return nil, connect.NewError(connect.CodeUnauthenticated, err)
	}

	// Get user to unfollow
	user, err := h.queries.GetUserByUsername(ctx, req.Msg.Username)
	if err != nil {
		return nil, connect.NewError(connect.CodeNotFound, err)
	}

	// Unfollow user
	err = h.queries.UnfollowUser(ctx, db.UnfollowUserParams{
		FollowerID:  currentUserID,
		FollowingID: user.ID,
	})
	if err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}

	return connect.NewResponse(&profilev1.UnfollowResponse{
		Profile: &profilev1.Profile{
			Username:  user.Username,
			Bio:       user.Bio,
			Image:     user.Image,
			Following: false,
		},
	}), nil
}