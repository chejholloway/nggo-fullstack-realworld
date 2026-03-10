package comments

import (
	"context"
	"database/sql"

	"connectrpc.com/connect"
	"github.com/google/uuid"

	commentsv1 "github.com/chejholloway/conduit-backend/gen/comments/v1"
	"github.com/chejholloway/conduit-backend/internal/auth"
	db "github.com/chejholloway/conduit-backend/db/sqlc"
)

type Handler struct {
	queries *db.Queries
}

func NewHandler(queries *db.Queries) *Handler {
	return &Handler{queries: queries}
}

func (h *Handler) AddComment(ctx context.Context, req *connect.Request[commentsv1.AddCommentRequest]) (*connect.Response[commentsv1.AddCommentResponse], error) {
	// Extract and validate token
	token, ok := ctx.Value("auth_token").(string)
	if !ok || token == "" {
		return nil, connect.NewError(connect.CodeUnauthenticated, nil)
	}

	userID, err := auth.ValidateToken(token)
	if err != nil {
		return nil, connect.NewError(connect.CodeUnauthenticated, err)
	}

	// Create comment
	comment, err := h.queries.CreateComment(ctx, db.CreateCommentParams{
		Body:     req.Msg.Body,
		AuthorID: userID,
		Slug:     req.Msg.Slug,
	})
	if err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}

	// Get user info
	user, _ := h.queries.GetUserByID(ctx, userID)

	return connect.NewResponse(&commentsv1.AddCommentResponse{
		Comment: &commentsv1.Comment{
			Id:        int32(comment.ID.ID()),
			CreatedAt: comment.CreatedAt.Format("2006-01-02T15:04:05Z"),
			UpdatedAt: comment.UpdatedAt.Format("2006-01-02T15:04:05Z"),
			Body:      comment.Body,
			Author: &commentsv1.Comment_Author{
				Username:  user.Username,
				Bio:       user.Bio,
				Image:     user.Image,
				Following: false,
			},
		},
	}), nil
}

func (h *Handler) GetComments(ctx context.Context, req *connect.Request[commentsv1.GetCommentsRequest]) (*connect.Response[commentsv1.GetCommentsResponse], error) {
	// Get comments for article
	comments, err := h.queries.GetCommentsByArticle(ctx, req.Msg.Slug)
	if err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}

	// Get current user ID if authenticated
	var currentUserID uuid.UUID
	if token, ok := ctx.Value("auth_token").(string); ok && token != "" {
		currentUserID, _ = auth.ValidateToken(token)
	}

	// Convert to proto comments
	protoComments := make([]*commentsv1.Comment, 0, len(comments))
	for _, comment := range comments {
		var following bool
		if currentUserID != uuid.Nil {
			following, _ = h.queries.IsFollowing(ctx, db.IsFollowingParams{
				FollowerID:  currentUserID,
				FollowingID: comment.AuthorID,
			})
		}

		protoComments = append(protoComments, &commentsv1.Comment{
			Id:        int32(comment.ID.ID()),
			CreatedAt: comment.CreatedAt.Format("2006-01-02T15:04:05Z"),
			UpdatedAt: comment.UpdatedAt.Format("2006-01-02T15:04:05Z"),
			Body:      comment.Body,
			Author: &commentsv1.Comment_Author{
				Username:  comment.AuthorUsername,
				Bio:       comment.AuthorBio,
				Image:     comment.AuthorImage,
				Following: following,
			},
		})
	}

	return connect.NewResponse(&commentsv1.GetCommentsResponse{
		Comments: protoComments,
	}), nil
}

func (h *Handler) DeleteComment(ctx context.Context, req *connect.Request[commentsv1.DeleteCommentRequest]) (*connect.Response[commentsv1.DeleteCommentResponse], error) {
	// Extract and validate token
	token, ok := ctx.Value("auth_token").(string)
	if !ok || token == "" {
		return nil, connect.NewError(connect.CodeUnauthenticated, nil)
	}

	userID, err := auth.ValidateToken(token)
	if err != nil {
		return nil, connect.NewError(connect.CodeUnauthenticated, err)
	}

	// Convert comment ID to UUID
	commentID, err := uuid.FromBytes([]byte{0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, byte(req.Msg.Id >> 24), byte(req.Msg.Id >> 16), byte(req.Msg.Id >> 8), byte(req.Msg.Id)})
	if err != nil {
		return nil, connect.NewError(connect.CodeInvalidArgument, err)
	}

	// Delete comment (query checks ownership)
	err = h.queries.DeleteComment(ctx, db.DeleteCommentParams{
		ID:       commentID,
		AuthorID: userID,
	})
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, connect.NewError(connect.CodeNotFound, err)
		}
		return nil, connect.NewError(connect.CodeInternal, err)
	}

	return connect.NewResponse(&commentsv1.DeleteCommentResponse{}), nil
}