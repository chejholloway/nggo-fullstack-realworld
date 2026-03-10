package middleware

import (
	"context"
	"net/http"
	"strings"
)

type contextKey string

const tokenKey contextKey = "auth_token"

func Auth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		token := strings.TrimPrefix(r.Header.Get("Authorization"), "Token ")
		if token != "" {
			r = r.WithContext(context.WithValue(r.Context(), tokenKey, token))
		}
		next.ServeHTTP(w, r)
	})
}

func TokenFromContext(ctx context.Context) string {
	token, _ := ctx.Value(tokenKey).(string)
	return token
}