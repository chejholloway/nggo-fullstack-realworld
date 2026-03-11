package auth

import (
	"context"
	"database/sql"

	"connectrpc.com/connect"
	"golang.org/x/crypto/bcrypt"

	db "github.com/chejholloway/conduit-backend/db/sqlc"
	authv1 "github.com/chejholloway/conduit-backend/gen/auth/v1"
	"github.com/chejholloway/conduit-backend/internal/middleware"
)

type Handler struct {
	queries *db.Queries
}

func NewHandler(queries *db.Queries) *Handler {
	return &Handler{queries: queries}
}

func (h *Handler) Register(ctx context.Context, req *connect.Request[authv1.RegisterRequest]) (*connect.Response[authv1.RegisterResponse], error) {
	hashed, err := bcrypt.GenerateFromPassword([]byte(req.Msg.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}
	user, err := h.queries.CreateUser(ctx, db.CreateUserParams{
		Email:    req.Msg.Email,
		Username: req.Msg.Username,
		Password: string(hashed),
	})
	if err != nil {
		return nil, connect.NewError(connect.CodeAlreadyExists, err)
	}
	token, err := GenerateToken(user.ID)
	if err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}
	return connect.NewResponse(&authv1.RegisterResponse{
		User: &authv1.User{Email: user.Email, Token: token, Username: user.Username, Bio: user.Bio, Image: user.Image},
	}), nil
}

func (h *Handler) Login(ctx context.Context, req *connect.Request[authv1.LoginRequest]) (*connect.Response[authv1.LoginResponse], error) {
	user, err := h.queries.GetUserByEmail(ctx, req.Msg.Email)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, connect.NewError(connect.CodeNotFound, err)
		}
		return nil, connect.NewError(connect.CodeInternal, err)
	}
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Msg.Password)); err != nil {
		return nil, connect.NewError(connect.CodeUnauthenticated, err)
	}
	token, err := GenerateToken(user.ID)
	if err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}
	return connect.NewResponse(&authv1.LoginResponse{
		User: &authv1.User{Email: user.Email, Token: token, Username: user.Username, Bio: user.Bio, Image: user.Image},
	}), nil
}

func (h *Handler) GetCurrentUser(ctx context.Context, req *connect.Request[authv1.GetCurrentUserRequest]) (*connect.Response[authv1.GetCurrentUserResponse], error) {
	token := middleware.TokenFromContext(ctx)
	if token == "" {
		return nil, connect.NewError(connect.CodeUnauthenticated, nil)
	}
	userID, err := ValidateToken(token)
	if err != nil {
		return nil, connect.NewError(connect.CodeUnauthenticated, err)
	}
	user, err := h.queries.GetUserByID(ctx, userID)
	if err != nil {
		return nil, connect.NewError(connect.CodeNotFound, err)
	}
	newToken, err := GenerateToken(user.ID)
	if err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}
	return connect.NewResponse(&authv1.GetCurrentUserResponse{
		User: &authv1.User{Email: user.Email, Token: newToken, Username: user.Username, Bio: user.Bio, Image: user.Image},
	}), nil
}

func (h *Handler) UpdateUser(ctx context.Context, req *connect.Request[authv1.UpdateUserRequest]) (*connect.Response[authv1.UpdateUserResponse], error) {
	token := middleware.TokenFromContext(ctx)
	if token == "" {
		return nil, connect.NewError(connect.CodeUnauthenticated, nil)
	}
	userID, err := ValidateToken(token)
	if err != nil {
		return nil, connect.NewError(connect.CodeUnauthenticated, err)
	}
	params := db.UpdateUserParams{ID: userID}
	if req.Msg.Email != "" {
		params.Email = sql.NullString{String: req.Msg.Email, Valid: true}
	}
	if req.Msg.Username != "" {
		params.Username = sql.NullString{String: req.Msg.Username, Valid: true}
	}
	if req.Msg.Bio != "" {
		params.Bio = sql.NullString{String: req.Msg.Bio, Valid: true}
	}
	if req.Msg.Image != "" {
		params.Image = sql.NullString{String: req.Msg.Image, Valid: true}
	}
	if req.Msg.Password != "" {
		hashed, err := bcrypt.GenerateFromPassword([]byte(req.Msg.Password), bcrypt.DefaultCost)
		if err != nil {
			return nil, connect.NewError(connect.CodeInternal, err)
		}
		params.Password = sql.NullString{String: string(hashed), Valid: true}
	}
	user, err := h.queries.UpdateUser(ctx, params)
	if err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}
	newToken, err := GenerateToken(user.ID)
	if err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}
	return connect.NewResponse(&authv1.UpdateUserResponse{
		User: &authv1.User{Email: user.Email, Token: newToken, Username: user.Username, Bio: user.Bio, Image: user.Image},
	}), nil
}
