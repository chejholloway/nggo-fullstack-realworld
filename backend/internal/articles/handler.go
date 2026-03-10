package articles

import (
	"context"

	"connectrpc.com/connect"
	articlesv1 "github.com/chejholloway/conduit-backend/gen/articles/v1"
)

type Handler struct{}

func (h *Handler) ListArticles(ctx context.Context, req *connect.Request[articlesv1.ListArticlesRequest]) (*connect.Response[articlesv1.ListArticlesResponse], error) {
	return connect.NewResponse(&articlesv1.ListArticlesResponse{Articles: []*articlesv1.Article{}, ArticlesCount: 0}), nil
}

func (h *Handler) GetArticle(ctx context.Context, req *connect.Request[articlesv1.GetArticleRequest]) (*connect.Response[articlesv1.GetArticleResponse], error) {
	return connect.NewResponse(&articlesv1.GetArticleResponse{}), nil
}

func (h *Handler) CreateArticle(ctx context.Context, req *connect.Request[articlesv1.CreateArticleRequest]) (*connect.Response[articlesv1.CreateArticleResponse], error) {
	return connect.NewResponse(&articlesv1.CreateArticleResponse{}), nil
}

func (h *Handler) UpdateArticle(ctx context.Context, req *connect.Request[articlesv1.UpdateArticleRequest]) (*connect.Response[articlesv1.UpdateArticleResponse], error) {
	return connect.NewResponse(&articlesv1.UpdateArticleResponse{}), nil
}

func (h *Handler) DeleteArticle(ctx context.Context, req *connect.Request[articlesv1.DeleteArticleRequest]) (*connect.Response[articlesv1.DeleteArticleResponse], error) {
	return connect.NewResponse(&articlesv1.DeleteArticleResponse{}), nil
}

func (h *Handler) FavoriteArticle(ctx context.Context, req *connect.Request[articlesv1.FavoriteArticleRequest]) (*connect.Response[articlesv1.FavoriteArticleResponse], error) {
	return connect.NewResponse(&articlesv1.FavoriteArticleResponse{}), nil
}

func (h *Handler) UnfavoriteArticle(ctx context.Context, req *connect.Request[articlesv1.UnfavoriteArticleRequest]) (*connect.Response[articlesv1.UnfavoriteArticleResponse], error) {
	return connect.NewResponse(&articlesv1.UnfavoriteArticleResponse{}), nil
}