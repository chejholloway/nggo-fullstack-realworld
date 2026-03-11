package comments

import (
	"context"
	"database/sql"
	"encoding/binary"

	"connectrpc.com/connect"
	"github.com/google/uuid"

	db "github.com/chejholloway/conduit-backend/db/sqlc"
	commentsv1 "github.com/chejholloway/conduit-backend/gen/comments/v1"
	"github.com/chejholloway/conduit-backend/internal/auth"
	"github.com/chejholloway/conduit-backend/internal/middleware"
)

type Handler struct {
	queries *db.Queries
}

func NewHandler(queries *db.Queries) *Handler {
	return &Handler{queries: queries}
}

func uuidToInt32(id uuid.UUID) int32 {
	return int32(binary.BigEndian.Uint32(id[:4]))
}

func (h *Handler) AddComment(ctx context.Context, req *connect.Request[commentsv1.AddCommentRequest]) (*connect.Response[commentsv1.AddCommentResponse], error) {
	token := middleware.TokenFromContext(ctx)
	if token == "" {
		return nil, connect.NewError(connect.CodeUnauthenticated, nil)
	}
	userID, err := auth.ValidateToken(token)
	if err != nil {
		return nil, connect.NewError(connect.CodeUnauthenticated, err)
	}
	comment, err := h.queries.CreateComment(ctx, db.CreateCommentParams{Body: req.Msg.Body, AuthorID: userID, Slug: req.Msg.Slug})
	if err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}
	user, _ := h.queries.GetUserByID(ctx, userID)
	return connect.NewResponse(&commentsv1.AddCommentResponse{
		Comment: &commentsv1.Comment{
			Id:        uuidToInt32(comment.ID),
			CreatedAt: comment.CreatedAt.Format("2006-01-02T15:04:05Z"),
			UpdatedAt: comment.UpdatedAt.Format("2006-01-02T15:04:05Z"),
			Body:      comment.Body,
			Author:    &commentsv1.Comment_Author{Username: user.Username, Bio: user.Bio, Image: user.Image, Following: false},
		},
	}), nil
}

func (h *Handler) GetComments(ctx context.Context, req *connect.Request[commentsv1.GetCommentsRequest]) (*connect.Response[commentsv1.GetCommentsResponse], error) {
	comments, err := h.queries.GetCommentsByArticle(ctx, req.Msg.Slug)
	if err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}
	var viewerID uuid.UUID
	if token := middleware.TokenFromContext(ctx); token != "" {
		viewerID, _ = auth.ValidateToken(token)
	}
	proto := make([]*commentsv1.Comment, 0, len(comments))
	for _, c := range comments {
		var following bool
		if viewerID != uuid.Nil {
			following, _ = h.queries.IsFollowing(ctx, db.IsFollowingParams{FollowerID: viewerID, FollowingID: c.AuthorID})
		}
		proto = append(proto, &commentsv1.Comment{
			Id:        uuidToInt32(c.ID),
			CreatedAt: c.CreatedAt.Format("2006-01-02T15:04:05Z"),
			UpdatedAt: c.UpdatedAt.Format("2006-01-02T15:04:05Z"),
			Body:      c.Body,
			Author:    &commentsv1.Comment_Author{Username: c.AuthorUsername, Bio: c.AuthorBio, Image: c.AuthorImage, Following: following},
		})
	}
	return connect.NewResponse(&commentsv1.GetCommentsResponse{Comments: proto}), nil
}

func (h *Handler) DeleteComment(ctx context.Context, req *connect.Request[commentsv1.DeleteCommentRequest]) (*connect.Response[commentsv1.DeleteCommentResponse], error) {
	token := middleware.TokenFromContext(ctx)
	if token == "" {
		return nil, connect.NewError(connect.CodeUnauthenticated, nil)
	}
	userID, err := auth.ValidateToken(token)
	if err != nil {
		return nil, connect.NewError(connect.CodeUnauthenticated, err)
	}
	// Resolve the int32 proto ID back to a UUID by scanning the article's comments.
	comments, err := h.queries.GetCommentsByArticle(ctx, req.Msg.Slug)
	if err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}
	var commentID uuid.UUID
	for _, c := range comments {
		if uuidToInt32(c.ID) == req.Msg.Id {
			commentID = c.ID
			break
		}
	}
	if commentID == uuid.Nil {
		return nil, connect.NewError(connect.CodeNotFound, nil)
	}
	err = h.queries.DeleteComment(ctx, db.DeleteCommentParams{ID: commentID, AuthorID: userID})
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, connect.NewError(connect.CodeNotFound, err)
		}
		return nil, connect.NewError(connect.CodeInternal, err)
	}
	return connect.NewResponse(&commentsv1.DeleteCommentResponse{}), nil
}
