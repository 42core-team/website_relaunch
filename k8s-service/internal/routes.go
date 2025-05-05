package internal

import "github.com/labstack/echo/v4"

func RegisterRoutes(c *echo.Echo) {
	c.GET("/health", func(ctx echo.Context) error {
		return ctx.String(200, "OK")
	})
}
