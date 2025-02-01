package main

import (
	"context"
	"fmt"
	"os"

	"dagger.io/dagger"
)

func main() {
	ctx := context.Background()

	// Connect to the Dagger engine
	client, err := dagger.Connect(ctx, dagger.WithLogOutput(os.Stdout))
	if err != nil {
		panic(err)
	}
	defer client.Close()

	// Registry info (replace with your own)
	registry := os.Getenv("CONTAINER_REGISTRY") // e.g. "registry.hub.docker.com/myuser/myapp"
	tag := os.Getenv("IMAGE_TAG")               // e.g. "latest"
	if registry == "" || tag == "" {
		fmt.Println("Please set CONTAINER_REGISTRY and IMAGE_TAG environment variables.")
		os.Exit(1)
	}

	// 1) Get reference to the local project directory
	// Make sure the path is correct for your local Next.js project
	src := client.Host().Directory("./")

	// 2) Build Stage: Node container with all dependencies + Next.js build
	builder := client.Container().
		From("node:18-alpine").
		WithDirectory("/src", src, dagger.ContainerWithDirectoryOpts{
			Include: []string{
				"package.json",
				"package-lock.json",
				"server.js",
				"pages",
				"public",
				"components",
				".next",       // in case you're re-running or partial builds
				"next.config.js",
				"tsconfig.json",  // if using TypeScript
				"yarn.lock",      // if using Yarn
				"pnpm-lock.yaml", // if using pnpm
				// add any other files you need for a build
			},
		}).
		WithWorkdir("/src").
		// Install all dependencies (including devDependencies)
		WithExec([]string{"npm", "install"}).
		// Build the Next.js project
		WithExec([]string{"npm", "run", "build"}) // or "yarn build"

	// 3) Final Stage: minimal container for production
	//    - copy the compiled app from the builder
	//    - install only production dependencies
	//    - set entrypoint to run `server.js`
	final := client.Container().
		From("node:18-alpine").
		WithWorkdir("/app").
		// Copy relevant files from builder
		WithFile("/app/package.json", builder.File("/src/package.json")).
		WithFile("/app/package-lock.json", builder.File("/src/package-lock.json")).
		WithDirectory("/app/.next", builder.Directory("/src/.next")).
		WithFile("/app/server.js", builder.File("/src/server.js")).
		// (Optional) Copy any other assets, e.g., "public"
		// .WithDirectory("/app/public", builder.Directory("/src/public"))
		//
		// Install only production deps
		WithExec([]string{"npm", "install", "--omit=dev"}).
		// Set the startup command
		WithEntrypoint([]string{"node", "server.js"})

	// 4) Publish the final container image to your registry
	imageRef := fmt.Sprintf("%s:%s", registry, tag)
	fmt.Printf("Publishing image to: %s\n", imageRef)

	// If your registry requires authentication, you can supply it here
	// e.g. using environment variables for user/pass:
	// auth := &dagger.RegistryAuth{
	//   Username: os.Getenv("REGISTRY_USER"),
	//   Password: os.Getenv("REGISTRY_PASS"),
	// }
	// _, err = final.Publish(ctx, imageRef, dagger.ContainerPublishOpts{Auth: auth})

	_, err = final.Publish(ctx, imageRef)
	if err != nil {
		panic(err)
	}

	fmt.Println("Image published successfully!")
}