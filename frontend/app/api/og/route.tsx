import { ImageResponse } from "next/og";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#000000",
          backgroundImage:
            "linear-gradient(45deg, #1a1a1a 25%, transparent 25%), linear-gradient(-45deg, #1a1a1a 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1a1a1a 75%), linear-gradient(-45deg, transparent 75%, #1a1a1a 75%)",
          backgroundSize: "20px 20px",
          backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
        }}
      >
        {/* Main Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            borderRadius: "20px",
            border: "2px solid #00ff88",
            boxShadow: "0 0 30px rgba(0, 255, 136, 0.3)",
          }}
        >
          {/* Title */}
          <div
            style={{
              fontSize: "64px",
              fontWeight: "bold",
              color: "#00ff88",
              textAlign: "center",
              marginBottom: "20px",
              textShadow: "0 0 20px rgba(0, 255, 136, 0.5)",
            }}
          >
            CORE GAME
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: "32px",
              color: "#ffffff",
              textAlign: "center",
              marginBottom: "30px",
              maxWidth: "800px",
              lineHeight: "1.2",
            }}
          >
            Programming Competition
          </div>

          {/* Description */}
          <div
            style={{
              fontSize: "24px",
              color: "#cccccc",
              textAlign: "center",
              maxWidth: "900px",
              lineHeight: "1.4",
            }}
          >
            Write a bot to compete against other players. Protect your core,
            spawn units, and manage resources strategically.
          </div>

          {/* Call to Action */}
          <div
            style={{
              fontSize: "28px",
              color: "#00ff88",
              textAlign: "center",
              marginTop: "30px",
              fontWeight: "bold",
              textTransform: "uppercase",
              letterSpacing: "2px",
            }}
          >
            Join the Competition
          </div>
        </div>

        {/* Bottom Branding */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            fontSize: "20px",
            color: "#666666",
            textAlign: "center",
          }}
        >
          core-game.com
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
