package profile

import (
	"context"
	"database/sql"

	"connectrpc.com/connect"

	db "github.com/chejholloway/conduit-backend/db/sqlc"
	profilev1 "github.com/chejholloway/conduit-backend/gen/profile/v1"
	"github.com/chejholloway/conduit-backend/internal/auth"
	"github.com/chejholloway/conduit-backend/internal/middleware"
)

type Handler struct {
	queries *db.Queries
}

func NewHandler(queries *db.Queries) *Handler {
	return &Handler{queries: queries}
}

func (h *Handler) GetProfile(ctx context.Context, req *connect.Request[profilev1.GetProfileRequest]) (*connect.Response[profilev1.GetProfileResponse], error) {
	user, err := h.queries.GetUserByUsername(ctx, req.Msg.Username)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, connect.NewError(connect.CodeNotFound, err)
		}
		return nil, connect.NewError(connect.CodeInternal, err)
	}
	var following bool
	if token := middleware.TokenFromContext(ctx); token != "" {
		if currentUserID, err := auth.ValidateToken(token); err == nil {
			following, _ = h.queries.IsFollowing(ctx, db.IsFollowingParams{FollowerID: currentUserID, FollowingID: user.ID})
		}
	}
	return connect.NewResponse(&profilev1.GetProfileResponse{
		Profile: &profilev1.Profile{Username: user.Username, Bio: user.Bio, Image: user.Image, Following: following},
	}), nil
}

func (h *Handler) Follow(ctx context.Context, req *connect.Request[profilev1.FollowRequest]) (*connect.Response[profilev1.FollowResponse], error) {
	token := middleware.TokenFromContext(ctx)
	if token == "" {
		return nil, connect.NewError(connect.CodeUnauthenticated, nil)
	}
	currentUserID, err := auth.ValidateToken(token)
	if err != nil {
		return nil, connect.NewError(connect.CodeUnauthenticated, err)
	}
	user, err := h.queries.GetUserByUsername(ctx, req.Msg.Username)
	if err != nil {
		return nil, connect.NewError(connect.CodeNotFound, err)
	}
	if err := h.queries.FollowUser(ctx, db.FollowUserParams{FollowerID: currentUserID, FollowingID: user.ID}); err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}
	return connect.NewResponse(&profilev1.FollowResponse{
		Profile: &profilev1.Profile{Username: user.Username, Bio: user.Bio, Image: user.Image, Following: true},
	}), nil
}

func (h *Handler) Unfollow(ctx context.Context, req *connect.Request[profilev1.UnfollowRequest]) (*connect.Response[profilev1.UnfollowResponse], error) {
	token := middleware.TokenFromContext(ctx)
	if token == "" {
		return nil, connect.NewError(connect.CodeUnauthenticated, nil)
	}
	currentUserID, err := auth.ValidateToken(token)
	if err != nil {
		return nil, connect.NewError(connect.CodeUnauthenticated, err)
	}
	user, err := h.queries.GetUserByUsername(ctx, req.Msg.Username)
	if err != nil {
		return nil, connect.NewError(connect.CodeNotFound, err)
	}
	if err := h.queries.UnfollowUser(ctx, db.UnfollowUserParams{FollowerID: currentUserID, FollowingID: user.ID}); err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}
	return connect.NewResponse(&profilev1.UnfollowResponse{
		Profile: &profilev1.Profile{Username: user.Username, Bio: user.Bio, Image: user.Image, Following: false},
	}), nil
}
