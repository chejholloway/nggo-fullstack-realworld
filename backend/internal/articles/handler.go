package articles

import (
	"context"
	"database/sql"

	"connectrpc.com/connect"
	"github.com/google/uuid"

	articlesv1 "github.com/chejholloway/conduit-backend/gen/articles/v1"
	"github.com/chejholloway/conduit-backend/internal/auth"
	db "github.com/chejholloway/conduit-backend/db/sqlc"
)

type Handler struct {
	queries *db.Queries
}

func NewHandler(queries *db.Queries) *Handler {
	return &Handler{queries: queries}
}

// Helper type to unify different article row types
type articleRow struct {
	ID             uuid.UUID
	Slug           string
	Title          string
	Description    string
	Body           string
	AuthorID       uuid.UUID
	CreatedAt      string
	UpdatedAt      string
	AuthorUsername string
	AuthorBio      string
	AuthorImage    string
}

func (h *Handler) ListArticles(ctx context.Context, req *connect.Request[articlesv1.ListArticlesRequest]) (*connect.Response[articlesv1.ListArticlesResponse], error) {
	limit := req.Msg.Limit
	if limit == 0 {
		limit = 20
	}
	offset := req.Msg.Offset

	var articles []articleRow
	var err error

	if req.Msg.Tag != "" {
		rows, err := h.queries.ListArticlesByTag(ctx, db.ListArticlesByTagParams{
			Name:   req.Msg.Tag,
			Limit:  limit,
			Offset: offset,
		})
		if err != nil {
			return nil, connect.NewError(connect.CodeInternal, err)
		}
		for _, r := range rows {
			articles = append(articles, articleRow{
				ID:             r.ID,
				Slug:           r.Slug,
				Title:          r.Title,
				Description:    r.Description,
				Body:           r.Body,
				AuthorID:       r.AuthorID,
				CreatedAt:      r.CreatedAt.Format("2006-01-02T15:04:05Z"),
				UpdatedAt:      r.UpdatedAt.Format("2006-01-02T15:04:05Z"),
				AuthorUsername: r.AuthorUsername,
				AuthorBio:      r.AuthorBio,
				AuthorImage:    r.AuthorImage,
			})
		}
	} else {
		rows, err := h.queries.ListArticles(ctx, db.ListArticlesParams{
			Limit:  limit,
			Offset: offset,
		})
		if err != nil {
			return nil, connect.NewError(connect.CodeInternal, err)
		}
		for _, r := range rows {
			articles = append(articles, articleRow{
				ID:             r.ID,
				Slug:           r.Slug,
				Title:          r.Title,
				Description:    r.Description,
				Body:           r.Body,
				AuthorID:       r.AuthorID,
				CreatedAt:      r.CreatedAt.Format("2006-01-02T15:04:05Z"),
				UpdatedAt:      r.UpdatedAt.Format("2006-01-02T15:04:05Z"),
				AuthorUsername: r.AuthorUsername,
				AuthorBio:      r.AuthorBio,
				AuthorImage:    r.AuthorImage,
			})
		}
	}

	if err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}

	// Get current user ID if authenticated
	var currentUserID uuid.UUID
	if token, ok := ctx.Value("auth_token").(string); ok && token != "" {
		currentUserID, _ = auth.ValidateToken(token)
	}

	// Convert to proto articles
	protoArticles := make([]*articlesv1.Article, 0, len(articles))
	for _, article := range articles {
		tags, _ := h.queries.GetTagsForArticle(ctx, article.ID)
		favCount, _ := h.queries.GetFavoritesCount(ctx, article.Slug)
		
		var favorited bool
		if currentUserID != uuid.Nil {
			favorited, _ = h.queries.IsFavorited(ctx, db.IsFavoritedParams{
				UserID: currentUserID,
				Slug:   article.Slug,
			})
		}

		var following bool
		if currentUserID != uuid.Nil {
			following, _ = h.queries.IsFollowing(ctx, db.IsFollowingParams{
				FollowerID:  currentUserID,
				FollowingID: article.AuthorID,
			})
		}

		protoArticles = append(protoArticles, &articlesv1.Article{
			Slug:           article.Slug,
			Title:          article.Title,
			Description:    article.Description,
			Body:           article.Body,
			TagList:        tags,
			CreatedAt:      article.CreatedAt,
			UpdatedAt:      article.UpdatedAt,
			Favorited:      favorited,
			FavoritesCount: int32(favCount),
			Author: &articlesv1.Author{
				Username:  article.AuthorUsername,
				Bio:       article.AuthorBio,
				Image:     article.AuthorImage,
				Following: following,
			},
		})
	}

	return connect.NewResponse(&articlesv1.ListArticlesResponse{
		Articles:      protoArticles,
		ArticlesCount: int32(len(protoArticles)),
	}), nil
}

func (h *Handler) GetArticle(ctx context.Context, req *connect.Request[articlesv1.GetArticleRequest]) (*connect.Response[articlesv1.GetArticleResponse], error) {
	article, err := h.queries.GetArticleBySlug(ctx, req.Msg.Slug)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, connect.NewError(connect.CodeNotFound, err)
		}
		return nil, connect.NewError(connect.CodeInternal, err)
	}

	// Get current user ID if authenticated
	var currentUserID uuid.UUID
	if token, ok := ctx.Value("auth_token").(string); ok && token != "" {
		currentUserID, _ = auth.ValidateToken(token)
	}

	tags, _ := h.queries.GetTagsForArticle(ctx, article.ID)
	favCount, _ := h.queries.GetFavoritesCount(ctx, article.Slug)
	
	var favorited bool
	if currentUserID != uuid.Nil {
		favorited, _ = h.queries.IsFavorited(ctx, db.IsFavoritedParams{
			UserID: currentUserID,
			Slug:   article.Slug,
		})
	}

	var following bool
	if currentUserID != uuid.Nil {
		following, _ = h.queries.IsFollowing(ctx, db.IsFollowingParams{
			FollowerID:  currentUserID,
			FollowingID: article.AuthorID,
		})
	}

	return connect.NewResponse(&articlesv1.GetArticleResponse{
		Article: &articlesv1.Article{
			Slug:           article.Slug,
			Title:          article.Title,
			Description:    article.Description,
			Body:           article.Body,
			TagList:        tags,
			CreatedAt:      article.CreatedAt.Format("2006-01-02T15:04:05Z"),
			UpdatedAt:      article.UpdatedAt.Format("2006-01-02T15:04:05Z"),
			Favorited:      favorited,
			FavoritesCount: int32(favCount),
			Author: &articlesv1.Author{
				Username:  article.AuthorUsername,
				Bio:       article.AuthorBio,
				Image:     article.AuthorImage,
				Following: following,
			},
		},
	}), nil
}

func (h *Handler) CreateArticle(ctx context.Context, req *connect.Request[articlesv1.CreateArticleRequest]) (*connect.Response[articlesv1.CreateArticleResponse], error) {
	// Extract and validate token
	token, ok := ctx.Value("auth_token").(string)
	if !ok || token == "" {
		return nil, connect.NewError(connect.CodeUnauthenticated, nil)
	}

	userID, err := auth.ValidateToken(token)
	if err != nil {
		return nil, connect.NewError(connect.CodeUnauthenticated, err)
	}

	// Generate slug
	slug := GenerateSlug(req.Msg.Title)

	// Create article
	article, err := h.queries.CreateArticle(ctx, db.CreateArticleParams{
		Slug:        slug,
		Title:       req.Msg.Title,
		Description: req.Msg.Description,
		Body:        req.Msg.Body,
		AuthorID:    userID,
	})
	if err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}

	// Add tags
	for _, tagName := range req.Msg.TagList {
		tag, _ := h.queries.UpsertTag(ctx, tagName)
		h.queries.AddTagToArticle(ctx, db.AddTagToArticleParams{
			ArticleID: article.ID,
			TagID:     tag.ID,
		})
	}

	// Get user info
	user, _ := h.queries.GetUserByID(ctx, userID)

	return connect.NewResponse(&articlesv1.CreateArticleResponse{
		Article: &articlesv1.Article{
			Slug:           article.Slug,
			Title:          article.Title,
			Description:    article.Description,
			Body:           article.Body,
			TagList:        req.Msg.TagList,
			CreatedAt:      article.CreatedAt.Format("2006-01-02T15:04:05Z"),
			UpdatedAt:      article.UpdatedAt.Format("2006-01-02T15:04:05Z"),
			Favorited:      false,
			FavoritesCount: 0,
			Author: &articlesv1.Author{
				Username:  user.Username,
				Bio:       user.Bio,
				Image:     user.Image,
				Following: false,
			},
		},
	}), nil
}

func (h *Handler) UpdateArticle(ctx context.Context, req *connect.Request[articlesv1.UpdateArticleRequest]) (*connect.Response[articlesv1.UpdateArticleResponse], error) {
	// Extract and validate token
	token, ok := ctx.Value("auth_token").(string)
	if !ok || token == "" {
		return nil, connect.NewError(connect.CodeUnauthenticated, nil)
	}

	userID, err := auth.ValidateToken(token)
	if err != nil {
		return nil, connect.NewError(connect.CodeUnauthenticated, err)
	}

	// Get existing article to verify ownership
	existing, err := h.queries.GetArticleBySlug(ctx, req.Msg.Slug)
	if err != nil {
		return nil, connect.NewError(connect.CodeNotFound, err)
	}

	if existing.AuthorID != userID {
		return nil, connect.NewError(connect.CodePermissionDenied, nil)
	}

	// Update article
	params := db.UpdateArticleParams{
		ID: existing.ID,
	}
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

	tags, _ := h.queries.GetTagsForArticle(ctx, article.ID)
	favCount, _ := h.queries.GetFavoritesCount(ctx, article.Slug)
	favorited, _ := h.queries.IsFavorited(ctx, db.IsFavoritedParams{
		UserID: userID,
		Slug:   article.Slug,
	})

	user, _ := h.queries.GetUserByID(ctx, userID)

	return connect.NewResponse(&articlesv1.UpdateArticleResponse{
		Article: &articlesv1.Article{
			Slug:           article.Slug,
			Title:          article.Title,
			Description:    article.Description,
			Body:           article.Body,
			TagList:        tags,
			CreatedAt:      article.CreatedAt.Format("2006-01-02T15:04:05Z"),
			UpdatedAt:      article.UpdatedAt.Format("2006-01-02T15:04:05Z"),
			Favorited:      favorited,
			FavoritesCount: int32(favCount),
			Author: &articlesv1.Author{
				Username:  user.Username,
				Bio:       user.Bio,
				Image:     user.Image,
				Following: false,
			},
		},
	}), nil
}

func (h *Handler) DeleteArticle(ctx context.Context, req *connect.Request[articlesv1.DeleteArticleRequest]) (*connect.Response[articlesv1.DeleteArticleResponse], error) {
	// Extract and validate token
	token, ok := ctx.Value("auth_token").(string)
	if !ok || token == "" {
		return nil, connect.NewError(connect.CodeUnauthenticated, nil)
	}

	userID, err := auth.ValidateToken(token)
	if err != nil {
		return nil, connect.NewError(connect.CodeUnauthenticated, err)
	}

	// Delete article (query checks ownership)
	err = h.queries.DeleteArticle(ctx, db.DeleteArticleParams{
		Slug:     req.Msg.Slug,
		AuthorID: userID,
	})
	if err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}

	return connect.NewResponse(&articlesv1.DeleteArticleResponse{}), nil
}

func (h *Handler) FavoriteArticle(ctx context.Context, req *connect.Request[articlesv1.FavoriteArticleRequest]) (*connect.Response[articlesv1.FavoriteArticleResponse], error) {
	// Extract and validate token
	token, ok := ctx.Value("auth_token").(string)
	if !ok || token == "" {
		return nil, connect.NewError(connect.CodeUnauthenticated, nil)
	}

	userID, err := auth.ValidateToken(token)
	if err != nil {
		return nil, connect.NewError(connect.CodeUnauthenticated, err)
	}

	// Favorite article
	err = h.queries.FavoriteArticle(ctx, db.FavoriteArticleParams{
		UserID: userID,
		Slug:   req.Msg.Slug,
	})
	if err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}

	// Get updated article
	article, err := h.queries.GetArticleBySlug(ctx, req.Msg.Slug)
	if err != nil {
		return nil, connect.NewError(connect.CodeNotFound, err)
	}

	tags, _ := h.queries.GetTagsForArticle(ctx, article.ID)
	favCount, _ := h.queries.GetFavoritesCount(ctx, article.Slug)
	following, _ := h.queries.IsFollowing(ctx, db.IsFollowingParams{
		FollowerID:  userID,
		FollowingID: article.AuthorID,
	})

	return connect.NewResponse(&articlesv1.FavoriteArticleResponse{
		Article: &articlesv1.Article{
			Slug:           article.Slug,
			Title:          article.Title,
			Description:    article.Description,
			Body:           article.Body,
			TagList:        tags,
			CreatedAt:      article.CreatedAt.Format("2006-01-02T15:04:05Z"),
			UpdatedAt:      article.UpdatedAt.Format("2006-01-02T15:04:05Z"),
			Favorited:      true,
			FavoritesCount: int32(favCount),
			Author: &articlesv1.Author{
				Username:  article.AuthorUsername,
				Bio:       article.AuthorBio,
				Image:     article.AuthorImage,
				Following: following,
			},
		},
	}), nil
}

func (h *Handler) UnfavoriteArticle(ctx context.Context, req *connect.Request[articlesv1.UnfavoriteArticleRequest]) (*connect.Response[articlesv1.UnfavoriteArticleResponse], error) {
	// Extract and validate token
	token, ok := ctx.Value("auth_token").(string)
	if !ok || token == "" {
		return nil, connect.NewError(connect.CodeUnauthenticated, nil)
	}

	userID, err := auth.ValidateToken(token)
	if err != nil {
		return nil, connect.NewError(connect.CodeUnauthenticated, err)
	}

	// Unfavorite article
	err = h.queries.UnfavoriteArticle(ctx, db.UnfavoriteArticleParams{
		UserID: userID,
		Slug:   req.Msg.Slug,
	})
	if err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}

	// Get updated article
	article, err := h.queries.GetArticleBySlug(ctx, req.Msg.Slug)
	if err != nil {
		return nil, connect.NewError(connect.CodeNotFound, err)
	}

	tags, _ := h.queries.GetTagsForArticle(ctx, article.ID)
	favCount, _ := h.queries.GetFavoritesCount(ctx, article.Slug)
	following, _ := h.queries.IsFollowing(ctx, db.IsFollowingParams{
		FollowerID:  userID,
		FollowingID: article.AuthorID,
	})

	return connect.NewResponse(&articlesv1.UnfavoriteArticleResponse{
		Article: &articlesv1.Article{
			Slug:           article.Slug,
			Title:          article.Title,
			Description:    article.Description,
			Body:           article.Body,
			TagList:        tags,
			CreatedAt:      article.CreatedAt.Format("2006-01-02T15:04:05Z"),
			UpdatedAt:      article.UpdatedAt.Format("2006-01-02T15:04:05Z"),
			Favorited:      false,
			FavoritesCount: int32(favCount),
			Author: &articlesv1.Author{
				Username:  article.AuthorUsername,
				Bio:       article.AuthorBio,
				Image:     article.AuthorImage,
				Following: following,
			},
		},
	}), nil
}
