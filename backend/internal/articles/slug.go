package articles

import (
	"fmt"
	"math/rand"
	"regexp"
	"strings"
	"time"
)

var nonAlphanumeric = regexp.MustCompile(`[^a-z0-9]+`)

func init() {
	rand.Seed(time.Now().UnixNano())
}

func GenerateSlug(title string) string {
	// Convert to lowercase
	slug := strings.ToLower(title)
	
	// Replace spaces and non-alphanumeric with hyphens
	slug = nonAlphanumeric.ReplaceAllString(slug, "-")
	
	// Trim hyphens from start and end
	slug = strings.Trim(slug, "-")
	
	// Add random suffix to ensure uniqueness
	suffix := rand.Intn(999999)
	return fmt.Sprintf("%s-%d", slug, suffix)
}
