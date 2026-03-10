package main

import (
	"database/sql"
	"log"
	"net/http"
	"os"

	_ "github.com/lib/pq"
	"github.com/rs/cors"
	"golang.org/x/net/http2"
	"golang.org/x/net/http2/h2c"

	articlesv1connect "github.com/chejholloway/conduit-backend/gen/articles/v1/articlesv1connect"
	authv1connect "github.com/chejholloway/conduit-backend/gen/auth/v1/authv1connect"
	commentsv1connect "github.com/chejholloway/conduit-backend/gen/comments/v1/commentsv1connect"
	profilev1connect "github.com/chejholloway/conduit-backend/gen/profile/v1/profilev1connect"

	"github.com/chejholloway/conduit-backend/internal/articles"
	"github.com/chejholloway/conduit-backend/internal/auth"
	"github.com/chejholloway/conduit-backend/internal/comments"
	"github.com/chejholloway/conduit-backend/internal/middleware"
	"github.com/chejholloway/conduit-backend/internal/profile"
	db "github.com/chejholloway/conduit-backend/db/sqlc"
)

func main() {
	// Database connection
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgresql://conduit:conduit@localhost:5432/conduit?sslmode=disable"
	}

	conn, err := sql.Open("postgres", dbURL)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer conn.Close()

	if err := conn.Ping(); err != nil {
		log.Fatal("Failed to ping database:", err)
	}

	queries := db.New(conn)

	// Setup routes
	mux := http.NewServeMux()

	mux.Handle(articlesv1connect.NewArticleServiceHandler(articles.NewHandler(queries)))
	mux.Handle(authv1connect.NewAuthServiceHandler(auth.NewHandler(queries)))
	mux.Handle(commentsv1connect.NewCommentServiceHandler(comments.NewHandler(queries)))
	mux.Handle(profilev1connect.NewProfileServiceHandler(profile.NewHandler(queries)))

	handler := cors.New(cors.Options{
		AllowedOrigins: []string{"http://localhost:4200"},
		AllowedMethods: []string{"GET", "POST", "OPTIONS"},
		AllowedHeaders: []string{"Connect-Protocol-Version", "Content-Type", "Authorization"},
	}).Handler(middleware.Auth(mux))

	log.Println("Backend running on :8080")
	log.Fatal(http.ListenAndServe(":8080", h2c.NewHandler(handler, &http2.Server{})))
}