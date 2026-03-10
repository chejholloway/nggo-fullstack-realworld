package auth

import (
	"context"
	"database/sql"

	"connectrpc.com/connect"
	"golang.org/x/crypto/bcrypt"

	authv1 "github.com/chejholloway/conduit-backend/gen/auth/v1"
	db "github.com/chejholloway/conduit-backend/db/sqlc"
)

type Handler struct {
	queries *db.Queries
}

func NewHandler(queries *db.Queries) *Handler {
	return &Handler{queries: queries}
}

func (h *Handler) Register(ctx context.Context, req *connect.Request[authv1.RegisterRequest]) (*connect.Response[authv1.RegisterResponse], error) {
	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Msg.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}

	// Create user
	user, err := h.queries.CreateUser(ctx, db.CreateUserParams{
		Email:    req.Msg.Email,
		Username: req.Msg.Username,
		Password: string(hashedPassword),
	})
	if err != nil {
		return nil, connect.NewError(connect.CodeAlreadyExists, err)
	}

	// Generate JWT
	token, err := GenerateToken(user.ID)
	if err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}

	return connect.NewResponse(&authv1.RegisterResponse{
		User: &authv1.User{
			Email:    user.Email,
			Token:    token,
			Username: user.Username,
			Bio:      user.Bio,
			Image:    user.Image,
		},
	}), nil
}

func (h *Handler) Login(ctx context.Context, req *connect.Request[authv1.LoginRequest]) (*connect.Response[authv1.LoginResponse], error) {
	// Get user by email
	user, err := h.queries.GetUserByEmail(ctx, req.Msg.Email)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, connect.NewError(connect.CodeNotFound, err)
		}
		return nil, connect.NewError(connect.CodeInternal, err)
	}

	// Verify password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Msg.Password)); err != nil {
		return nil, connect.NewError(connect.CodeUnauthenticated, err)
	}

	// Generate JWT
	token, err := GenerateToken(user.ID)
	if err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}

	return connect.NewResponse(&authv1.LoginResponse{
		User: &authv1.User{
			Email:    user.Email,
			Token:    token,
			Username: user.Username,
			Bio:      user.Bio,
			Image:    user.Image,
		},
	}), nil
}

func (h *Handler) GetCurrentUser(ctx context.Context, req *connect.Request[authv1.GetCurrentUserRequest]) (*connect.Response[authv1.GetCurrentUserResponse], error) {
	// Extract token from context (set by middleware)
	token, ok := ctx.Value("auth_token").(string)
	if !ok || token == "" {
		return nil, connect.NewError(connect.CodeUnauthenticated, nil)
	}

	// Validate token and get user ID
	userID, err := ValidateToken(token)
	if err != nil {
		return nil, connect.NewError(connect.CodeUnauthenticated, err)
	}

	// Get user from database
	user, err := h.queries.GetUserByID(ctx, userID)
	if err != nil {
		return nil, connect.NewError(connect.CodeNotFound, err)
	}

	// Generate new token
	newToken, err := GenerateToken(user.ID)
	if err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}

	return connect.NewResponse(&authv1.GetCurrentUserResponse{
		User: &authv1.User{
			Email:    user.Email,
			Token:    newToken,
			Username: user.Username,
			Bio:      user.Bio,
			Image:    user.Image,
		},
	}), nil
}

func (h *Handler) UpdateUser(ctx context.Context, req *connect.Request[authv1.UpdateUserRequest]) (*connect.Response[authv1.UpdateUserResponse], error) {
	// Extract token from context
	token, ok := ctx.Value("auth_token").(string)
	if !ok || token == "" {
		return nil, connect.NewError(connect.CodeUnauthenticated, nil)
	}

	// Validate token and get user ID
	userID, err := ValidateToken(token)
	if err != nil {
		return nil, connect.NewError(connect.CodeUnauthenticated, err)
	}

	// Prepare update params
	params := db.UpdateUserParams{
		ID: userID,
	}

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
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Msg.Password), bcrypt.DefaultCost)
		if err != nil {
			return nil, connect.NewError(connect.CodeInternal, err)
		}
		params.Password = sql.NullString{String: string(hashedPassword), Valid: true}
	}

	// Update user
	user, err := h.queries.UpdateUser(ctx, params)
	if err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}

	// Generate new token
	newToken, err := GenerateToken(user.ID)
	if err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}

	return connect.NewResponse(&authv1.UpdateUserResponse{
		User: &authv1.User{
			Email:    user.Email,
			Token:    newToken,
			Username: user.Username,
			Bio:      user.Bio,
			Image:    user.Image,
		},
	}), nil
}