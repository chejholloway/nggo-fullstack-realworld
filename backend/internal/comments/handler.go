package comments

import (
	"context"

	"connectrpc.com/connect"
	commentsv1 "github.com/chejholloway/conduit-backend/gen/comments/v1"
)

type Handler struct{}

func (h *Handler) AddComment(ctx context.Context, req *connect.Request[commentsv1.AddCommentRequest]) (*connect.Response[commentsv1.AddCommentResponse], error) {
	return connect.NewResponse(&commentsv1.AddCommentResponse{}), nil
}

func (h *Handler) GetComments(ctx context.Context, req *connect.Request[commentsv1.GetCommentsRequest]) (*connect.Response[commentsv1.GetCommentsResponse], error) {
	return connect.NewResponse(&commentsv1.GetCommentsResponse{}), nil
}

func (h *Handler) DeleteComment(ctx context.Context, req *connect.Request[commentsv1.DeleteCommentRequest]) (*connect.Response[commentsv1.DeleteCommentResponse], error) {
	return connect.NewResponse(&commentsv1.DeleteCommentResponse{}), nil
}