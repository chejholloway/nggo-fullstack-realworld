package articles

import (
	"context"
	"database/sql"

	"connectrpc.com/connect"
	"github.com/google/uuid"

	db "github.com/chejholloway/conduit-backend/db/sqlc"
	articlesv1 "github.com/chejholloway/conduit-backend/gen/articles/v1"
	"github.com/chejholloway/conduit-backend/internal/auth"
	"github.com/chejholloway/conduit-backend/internal/middleware"
)

type Handler struct {
	queries *db.Queries
}

func NewHandler(queries *db.Queries) *Handler {
	return &Handler{queries: queries}
}

func currentUserID(ctx context.Context) uuid.UUID {
	token := middleware.TokenFromContext(ctx)
	if token == "" {
		return uuid.Nil
	}
	id, err := auth.ValidateToken(token)
	if err != nil {
		return uuid.Nil
	}
	return id
}

func (h *Handler) enrich(ctx context.Context, a *articlesv1.Article, articleID, authorID, viewerID uuid.UUID) {
	tags, _ := h.queries.GetTagsForArticle(ctx, articleID)
	a.TagList = tags
	count, _ := h.queries.GetFavoritesCount(ctx, a.Slug)
	a.FavoritesCount = int32(count)
	if viewerID != uuid.Nil {
		a.Favorited, _ = h.queries.IsFavorited(ctx, db.IsFavoritedParams{UserID: viewerID, Slug: a.Slug})
		if a.Author != nil {
			a.Author.Following, _ = h.queries.IsFollowing(ctx, db.IsFollowingParams{FollowerID: viewerID, FollowingID: authorID})
		}
	}
}

func (h *Handler) ListArticles(ctx context.Context, req *connect.Request[articlesv1.ListArticlesRequest]) (*connect.Response[articlesv1.ListArticlesResponse], error) {
	limit := req.Msg.Limit
	if limit == 0 {
		limit = 20
	}
	viewer := currentUserID(ctx)

	type row struct {
		id                                         uuid.UUID
		slug, title, description, body             string
		authorID                                    uuid.UUID
		createdAt, updatedAt                        string
		authorUsername, authorBio, authorImage      string
	}
	var rows []row

	if req.Msg.Tag != "" {
		res, err := h.queries.ListArticlesByTag(ctx, db.ListArticlesByTagParams{Name: req.Msg.Tag, Limit: limit, Offset: req.Msg.Offset})
		if err != nil {
			return nil, connect.NewError(connect.CodeInternal, err)
		}
		for _, r := range res {
			rows = append(rows, row{r.ID, r.Slug, r.Title, r.Description, r.Body, r.AuthorID,
				r.CreatedAt.Format("2006-01-02T15:04:05Z"), r.UpdatedAt.Format("2006-01-02T15:04:05Z"),
				r.AuthorUsername, r.AuthorBio, r.AuthorImage})
		}
	} else {
		res, err := h.queries.ListArticles(ctx, db.ListArticlesParams{Limit: limit, Offset: req.Msg.Offset})
		if err != nil {
			return nil, connect.NewError(connect.CodeInternal, err)
		}
		for _, r := range res {
			rows = append(rows, row{r.ID, r.Slug, r.Title, r.Description, r.Body, r.AuthorID,
				r.CreatedAt.Format("2006-01-02T15:04:05Z"), r.UpdatedAt.Format("2006-01-02T15:04:05Z"),
				r.AuthorUsername, r.AuthorBio, r.AuthorImage})
		}
	}

	articles := make([]*articlesv1.Article, 0, len(rows))
	for _, r := range rows {
		a := &articlesv1.Article{
			Slug: r.slug, Title: r.title, Description: r.description, Body: r.body,
			CreatedAt: r.createdAt, UpdatedAt: r.updatedAt,
			Author: &articlesv1.Author{Username: r.authorUsername, Bio: r.authorBio, Image: r.authorImage},
		}
		h.enrich(ctx, a, r.id, r.authorID, viewer)
		articles = append(articles, a)
	}
	return connect.NewResponse(&articlesv1.ListArticlesResponse{Articles: articles, ArticlesCount: int32(len(articles))}), nil
}

func (h *Handler) GetArticle(ctx context.Context, req *connect.Request[articlesv1.GetArticleRequest]) (*connect.Response[articlesv1.GetArticleResponse], error) {
	r, err := h.queries.GetArticleBySlug(ctx, req.Msg.Slug)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, connect.NewError(connect.CodeNotFound, err)
		}
		return nil, connect.NewError(connect.CodeInternal, err)
	}
	a := &articlesv1.Article{
		Slug: r.Slug, Title: r.Title, Description: r.Description, Body: r.Body,
		CreatedAt: r.CreatedAt.Format("2006-01-02T15:04:05Z"), UpdatedAt: r.UpdatedAt.Format("2006-01-02T15:04:05Z"),
		Author: &articlesv1.Author{Username: r.AuthorUsername, Bio: r.AuthorBio, Image: r.AuthorImage},
	}
	h.enrich(ctx, a, r.ID, r.AuthorID, currentUserID(ctx))
	return connect.NewResponse(&articlesv1.GetArticleResponse{Article: a}), nil
}

func (h *Handler) CreateArticle(ctx context.Context, req *connect.Request[articlesv1.CreateArticleRequest]) (*connect.Response[articlesv1.CreateArticleResponse], error) {
	token := middleware.TokenFromContext(ctx)
	if token == "" {
		return nil, connect.NewError(connect.CodeUnauthenticated, nil)
	}
	userID, err := auth.ValidateToken(token)
	if err != nil {
		return nil, connect.NewError(connect.CodeUnauthenticated, err)
	}
	article, err := h.queries.CreateArticle(ctx, db.CreateArticleParams{
		Slug: GenerateSlug(req.Msg.Title), Title: req.Msg.Title,
		Description: req.Msg.Description, Body: req.Msg.Body, AuthorID: userID,
	})
	if err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}
	for _, name := range req.Msg.TagList {
		if tag, err := h.queries.UpsertTag(ctx, name); err == nil {
			_ = h.queries.AddTagToArticle(ctx, db.AddTagToArticleParams{ArticleID: article.ID, TagID: tag.ID})
		}
	}
	user, _ := h.queries.GetUserByID(ctx, userID)
	return connect.NewResponse(&articlesv1.CreateArticleResponse{
		Article: &articlesv1.Article{
			Slug: article.Slug, Title: article.Title, Description: article.Description, Body: article.Body,
			TagList: req.Msg.TagList,
			CreatedAt: article.CreatedAt.Format("2006-01-02T15:04:05Z"), UpdatedAt: article.UpdatedAt.Format("2006-01-02T15:04:05Z"),
			Author: &articlesv1.Author{Username: user.Username, Bio: user.Bio, Image: user.Image},
		},
	}), nil
}

func (h *Handler) UpdateArticle(ctx context.Context, req *connect.Request[articlesv1.UpdateArticleRequest]) (*connect.Response[articlesv1.UpdateArticleResponse], error) {
	token := middleware.TokenFromContext(ctx)
	if token == "" {
		return nil, connect.NewError(connect.CodeUnauthenticated, nil)
	}
	userID, err := auth.ValidateToken(token)
	if err != nil {
		return nil, connect.NewError(connect.CodeUnauthenticated, err)
	}
	existing, err := h.queries.GetArticleBySlug(ctx, req.Msg.Slug)
	if err != nil {
		return nil, connect.NewError(connect.CodeNotFound, err)
	}
	if existing.AuthorID != userID {
		return nil, connect.NewError(connect.CodePermissionDenied, nil)
	}
	params := db.UpdateArticleParams{ID: existing.ID}
	if req.Msg.Title != "" {
		params.Title = sql.NullString{String: req.Msg.Title, Valid: true}
		params.Slug = sql.NullString{String: GenerateSlug(req.Msg.Title), Valid: true}
	}
	if req.Msg.Description != "" {
		params.Description = sql.NullString{String: req.Msg.Description, Valid: true}
	}
	if req.Msg.Body != "" {
		params.Body = sql.NullString{String: req.Msg.Body, Valid: true}
	}
	article, err := h.queries.UpdateArticle(ctx, params)
	if err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}
	user, _ := h.queries.GetUserByID(ctx, userID)
	a := &articlesv1.Article{
		Slug: article.Slug, Title: article.Title, Description: article.Description, Body: article.Body,
		CreatedAt: article.CreatedAt.Format("2006-01-02T15:04:05Z"), UpdatedAt: article.UpdatedAt.Format("2006-01-02T15:04:05Z"),
		Author: &articlesv1.Author{Username: user.Username, Bio: user.Bio, Image: user.Image},
	}
	h.enrich(ctx, a, article.ID, article.AuthorID, userID)
	return connect.NewResponse(&articlesv1.UpdateArticleResponse{Article: a}), nil
}

func (h *Handler) DeleteArticle(ctx context.Context, req *connect.Request[articlesv1.DeleteArticleRequest]) (*connect.Response[articlesv1.DeleteArticleResponse], error) {
	token := middleware.TokenFromContext(ctx)
	if token == "" {
		return nil, connect.NewError(connect.CodeUnauthenticated, nil)
	}
	userID, err := auth.ValidateToken(token)
	if err != nil {
		return nil, connect.NewError(connect.CodeUnauthenticated, err)
	}
	if err := h.queries.DeleteArticle(ctx, db.DeleteArticleParams{Slug: req.Msg.Slug, AuthorID: userID}); err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}
	return connect.NewResponse(&articlesv1.DeleteArticleResponse{}), nil
}

func (h *Handler) FavoriteArticle(ctx context.Context, req *connect.Request[articlesv1.FavoriteArticleRequest]) (*connect.Response[articlesv1.FavoriteArticleResponse], error) {
	token := middleware.TokenFromContext(ctx)
	if token == "" {
		return nil, connect.NewError(connect.CodeUnauthenticated, nil)
	}
	userID, err := auth.ValidateToken(token)
	if err != nil {
		return nil, connect.NewError(connect.CodeUnauthenticated, err)
	}
	if err := h.queries.FavoriteArticle(ctx, db.FavoriteArticleParams{UserID: userID, Slug: req.Msg.Slug}); err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}
	r, err := h.queries.GetArticleBySlug(ctx, req.Msg.Slug)
	if err != nil {
		return nil, connect.NewError(connect.CodeNotFound, err)
	}
	a := &articlesv1.Article{
		Slug: r.Slug, Title: r.Title, Description: r.Description, Body: r.Body,
		CreatedAt: r.CreatedAt.Format("2006-01-02T15:04:05Z"), UpdatedAt: r.UpdatedAt.Format("2006-01-02T15:04:05Z"),
		Author: &articlesv1.Author{Username: r.AuthorUsername, Bio: r.AuthorBio, Image: r.AuthorImage},
	}
	h.enrich(ctx, a, r.ID, r.AuthorID, userID)
	return connect.NewResponse(&articlesv1.FavoriteArticleResponse{Article: a}), nil
}

func (h *Handler) UnfavoriteArticle(ctx context.Context, req *connect.Request[articlesv1.UnfavoriteArticleRequest]) (*connect.Response[articlesv1.UnfavoriteArticleResponse], error) {
	token := middleware.TokenFromContext(ctx)
	if token == "" {
		return nil, connect.NewError(connect.CodeUnauthenticated, nil)
	}
	userID, err := auth.ValidateToken(token)
	if err != nil {
		return nil, connect.NewError(connect.CodeUnauthenticated, err)
	}
	if err := h.queries.UnfavoriteArticle(ctx, db.UnfavoriteArticleParams{UserID: userID, Slug: req.Msg.Slug}); err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}
	r, err := h.queries.GetArticleBySlug(ctx, req.Msg.Slug)
	if err != nil {
		return nil, connect.NewError(connect.CodeNotFound, err)
	}
	a := &articlesv1.Article{
		Slug: r.Slug, Title: r.Title, Description: r.Description, Body: r.Body,
		CreatedAt: r.CreatedAt.Format("2006-01-02T15:04:05Z"), UpdatedAt: r.UpdatedAt.Format("2006-01-02T15:04:05Z"),
		Author: &articlesv1.Author{Username: r.AuthorUsername, Bio: r.AuthorBio, Image: r.AuthorImage},
	}
	h.enrich(ctx, a, r.ID, r.AuthorID, userID)
	return connect.NewResponse(&articlesv1.UnfavoriteArticleResponse{Article: a}), nil
}
