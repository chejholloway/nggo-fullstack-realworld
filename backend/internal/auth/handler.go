package auth

import (
	"context"

	"connectrpc.com/connect"
	authv1 "github.com/chejholloway/conduit-backend/gen/auth/v1"
)

type Handler struct{}

func (h *Handler) Register(ctx context.Context, req *connect.Request[authv1.RegisterRequest]) (*connect.Response[authv1.RegisterResponse], error) {
	return connect.NewResponse(&authv1.RegisterResponse{}), nil
}

func (h *Handler) Login(ctx context.Context, req *connect.Request[authv1.LoginRequest]) (*connect.Response[authv1.LoginResponse], error) {
	return connect.NewResponse(&authv1.LoginResponse{}), nil
}

func (h *Handler) GetCurrentUser(ctx context.Context, req *connect.Request[authv1.GetCurrentUserRequest]) (*connect.Response[authv1.GetCurrentUserResponse], error) {
	return connect.NewResponse(&authv1.GetCurrentUserResponse{}), nil
}

func (h *Handler) UpdateUser(ctx context.Context, req *connect.Request[authv1.UpdateUserRequest]) (*connect.Response[authv1.UpdateUserResponse], error) {
	return connect.NewResponse(&authv1.UpdateUserResponse{}), nil
}