package main

import (
	// "context"
	"database/sql"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"sync/atomic"

	"github.com/fsnotify/fsnotify"
	"github.com/gh4rris/ar-united/internal/database"

	// "github.com/jackc/pgx/v5"
	"github.com/jaschaephraim/lrserver"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

type apiConfig struct {
	port           string
	fileserverHits atomic.Int32
	apiBaseURL     string
	supabaseURL    string
	supabasekey    string
	filepathRoot   string
	assetsRoot     string
	migrationsRoot string
	db             *database.Queries
	platform       string
	host           string
	jwtSecret      string
}

func main() {
	godotenv.Load(".env")

	apiBaseURL := os.Getenv("API_BASE_URL")
	if apiBaseURL == "" {
		log.Fatal("API_BASE_URL environment variable is not set")
	}

	filepathRoot := os.Getenv("FILEPATH_ROOT")
	if filepathRoot == "" {
		log.Fatal("FILEPATH_ROOT environment variable is not set")
	}
	assetsRoot := os.Getenv("ASSETS_ROOT")
	if assetsRoot == "" {
		log.Fatal("ASSETS_ROOT environment variable is not set")
	}
	migrationsRoot := os.Getenv("MIGRATIONS_ROOT")
	if migrationsRoot == "" {
		log.Fatal("MIGRATIONS_ROOT environment variable is not set")
	}
	port := os.Getenv("PORT")
	if port == "" {
		log.Fatal("PORT environment variable is not set")
	}
	dbURL := os.Getenv("DB_URL")
	if dbURL == "" {
		log.Fatal("DB_URL environment variable is not set")
	}
	platform := os.Getenv("PLATFORM")
	if platform == "" {
		log.Fatal("PLATFORM environment variable is not set")
	}
	host := os.Getenv("HOST")
	if host == "" {
		log.Fatal("HOST environment variable is not set")
	}
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		log.Fatal("JWT_SECRET environment variable is not set")
	}
	supabaseURL := os.Getenv("SUPABASE_URL")
	if supabaseURL == "" {
		log.Fatal("SUPABASE_URL environment variable is not set")
	}
	supabaseKey := os.Getenv("SUPABASE_KEY")
	if supabaseKey == "" {
		log.Fatal("SUPABASE_Key environment variable is not set")
	}

	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		log.Fatalf("Error opening database: %s", err)
	}
	dbQueries := database.New(db)

	apiCfg := apiConfig{
		port:           port,
		fileserverHits: atomic.Int32{},
		apiBaseURL:     apiBaseURL,
		supabaseURL:    supabaseURL,
		supabasekey:    supabaseKey,
		filepathRoot:   filepathRoot,
		assetsRoot:     assetsRoot,
		migrationsRoot: migrationsRoot,
		db:             dbQueries,
		platform:       platform,
		host:           host,
		jwtSecret:      jwtSecret,
	}

	err = apiCfg.ensureAssetsDir()

	err = apiCfg.runMigrations(db)
	if err != nil {
		log.Fatalf("Failed to run migrations: %v", err)
	}

	watcher, err := fsnotify.NewWatcher()
	if err != nil {
		log.Fatalln(err)
	}
	defer watcher.Close()

	err = watcher.Add("./app")
	if err != nil {
		log.Fatalln(err)
	}
	err = watcher.Add("./app/pages")
	if err != nil {
		log.Fatalln(err)
	}

	lr := lrserver.New(lrserver.DefaultName, lrserver.DefaultPort)
	go lr.ListenAndServe()

	go func() {
		for {
			select {
			case event := <-watcher.Events:
				lr.Reload(event.Name)
			case err := <-watcher.Errors:
				log.Println(err)
			}
		}
	}()

	mux := http.NewServeMux()
	appHandler := http.StripPrefix("/app", http.FileServer(http.Dir(filepathRoot)))
	mux.Handle("/app/", noCacheMiddleware(apiCfg.middlewareMetricsInc(appHandler)))
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, filepath.Join(filepathRoot, "index.html"))
	})

	assetsHandler := http.StripPrefix("/assets", http.FileServer(http.Dir(assetsRoot)))
	mux.Handle("/assets/", noCacheMiddleware(assetsHandler))

	mux.HandleFunc("GET /api/healthz", handlerReadiness)

	mux.HandleFunc("POST /api/login", apiCfg.handlerLogin)
	mux.HandleFunc("GET /api/validate-token", apiCfg.handlerValidateToken)
	mux.HandleFunc("POST /api/refresh", apiCfg.handlerRefreshToken)
	mux.HandleFunc("POST /api/revoke", apiCfg.handlerRevoke)

	mux.HandleFunc("GET /api/search", apiCfg.handlerSearch)

	mux.HandleFunc("POST /api/users", apiCfg.handlerCreateUser)
	mux.HandleFunc("PUT /api/users", apiCfg.handlerUpdateUser)
	mux.HandleFunc("GET /api/users", apiCfg.handlerCheckUsers)
	mux.HandleFunc("GET /api/users/{slugID}", apiCfg.handlerGetUserBySlug)
	mux.HandleFunc("GET /api/users/{userID}/allies", apiCfg.handlerUserAllies)
	mux.HandleFunc("GET /api/users/{userID}/posts", apiCfg.handlerUserPosts)
	mux.HandleFunc("GET /api/users/{userID}/groups", apiCfg.handlerUserGroups)
	mux.HandleFunc("GET /api/users/{userID}/events", apiCfg.handlerUserEvents)
	mux.HandleFunc("GET /api/users/{userID}/groups/{groupID}", apiCfg.handlerIsMember)
	mux.HandleFunc("GET /api/users/{userID}/groups/admin", apiCfg.handlerAdminGroups)
	mux.HandleFunc("GET /api/users/{userID}/events/admin", apiCfg.handlerAdminEvents)

	mux.HandleFunc("POST /api/allies/{allyID}", apiCfg.handlerAddAlly)
	mux.HandleFunc("PUT /api/allies/{allyID}", apiCfg.handlerConfirmAlly)
	mux.HandleFunc("GET /api/allies/requests", apiCfg.handlerGetAllyRequests)
	mux.HandleFunc("GET /api/allies/{allyID}", apiCfg.handlerIsAlly)

	mux.HandleFunc("POST /api/posts", apiCfg.handlerCreateUserPost)
	mux.HandleFunc("POST /api/posts/groups/{groupID}", apiCfg.handlerCreateGroupPost)
	mux.HandleFunc("POST /api/posts/events/{eventID}", apiCfg.handlerCreateEventPost)
	mux.HandleFunc("GET /api/posts", apiCfg.handlerGetPosts)
	mux.HandleFunc("GET /api/posts/{postID}", apiCfg.handlerGetPost)
	mux.HandleFunc("DELETE /api/posts/{postID}", apiCfg.handlerDeletePost)

	mux.HandleFunc("POST /api/groups", apiCfg.handlerCreateGroup)
	mux.HandleFunc("POST /api/groups/{groupID}", apiCfg.handlerJoinGroup)
	mux.HandleFunc("GET /api/groups/{groupID}", apiCfg.handlerGetGroupByID)
	mux.HandleFunc("GET /api/groups/{groupID}/posts", apiCfg.handlerGroupPosts)
	mux.HandleFunc("GET /api/groups/{slugID}/slug", apiCfg.handlerGetGroupBySlug)
	mux.HandleFunc("GET /api/groups/{groupID}/users", apiCfg.handlerGroupMembers)
	mux.HandleFunc("GET /api/groups/{userID}/admin", apiCfg.handlerGroupAdmin)
	mux.HandleFunc("GET /api/groups/{groupID}/events", apiCfg.handlerGroupEvents)

	mux.HandleFunc("POST /api/events", apiCfg.handlerCreateEvent)
	mux.HandleFunc("GET /api/events/{eventID}/posts", apiCfg.handlerEventPosts)
	mux.HandleFunc("GET /api/events/{eventID}/users", apiCfg.handlerEventAttendees)
	mux.HandleFunc("GET /api/events/{slugID}", apiCfg.handlerGetEventBySlug)

	mux.HandleFunc("GET /api/attendees/{eventID}", apiCfg.handlerIsGoing)
	mux.HandleFunc("POST /api/attendees/{eventID}", apiCfg.handlerGoingEvent)
	mux.HandleFunc("DELETE /api/attendees/{eventID}", apiCfg.handlerNotGoingEvent)

	mux.HandleFunc("POST /api/profile_pic", apiCfg.handlerProfilePicUpload)

	mux.HandleFunc("GET /admin/metrics", apiCfg.handlerMetrics)
	mux.HandleFunc("POST /admin/reset", apiCfg.handlerReset)

	srv := &http.Server{
		Handler: mux,
		Addr:    ":" + port,
	}

	log.Printf("Serving on port: %s\n", port)
	log.Fatal(srv.ListenAndServe())
}
