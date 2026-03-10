package profile

import (
	"context"

	"connectrpc.com/connect"
	profilev1 "github.com/chejholloway/conduit-backend/gen/profile/v1"
)

type Handler struct{}

func (h *Handler) GetProfile(ctx context.Context, req *connect.Request[profilev1.GetProfileRequest]) (*connect.Response[profilev1.GetProfileResponse], error) {
	return connect.NewResponse(&profilev1.GetProfileResponse{}), nil
}

func (h *Handler) Follow(ctx context.Context, req *connect.Request[profilev1.FollowRequest]) (*connect.Response[profilev1.FollowResponse], error) {
	return connect.NewResponse(&profilev1.FollowResponse{}), nil
}

func (h *Handler) Unfollow(ctx context.Context, req *connect.Request[profilev1.UnfollowRequest]) (*connect.Response[profilev1.UnfollowResponse], error) {
	return connect.NewResponse(&profilev1.UnfollowResponse{}), nil
}