# RabbitMQ Message Format

This document describes the message formats used for communication with the game system via RabbitMQ.

## Starting a Game

To start a game, send a message to the `game_queue` channel with the following JSON format:

### Message Structure

```json
{
  "pattern": "start",
  "data": {
    "ID": "550e8400-e29b-41d4-a716-446655440000",
    "Image": "ghcr.io/42core-team/game-server:dev",
    "Bots": [
      {
        "ID": "550e8400-e29b-41d4-a716-446655440001",
        "Image": "ghcr.io/42core-team/my-core-bot:dev",
        "RepoURL": "https://github.com/42core-team/my-core-bot.git"
      },
      {
        "ID": "550e8400-e29b-41d4-a716-446655440002",
        "Image": "ghcr.io/42core-team/my-core-bot:dev",
        "RepoURL": "https://github.com/42core-team/my-core-bot.git"
      }
    ]
  }
}
```

### Field Descriptions

- `pattern`: Always set to `"start"` for game initiation messages
- `data.ID`: Unique identifier for the game (UUID format)
- `data.Image`: Docker image for the game server
- `data.Bots`: Array of bot configurations
  - `ID`: Unique identifier for each bot (UUID format)
  - `Image`: Docker image for the bot
  - `RepoURL`: Git repository URL for the bot's source code

## Game Results

Game results will be published to the `game_results` queue in the following format:

```json
{
  "pattern": "successfull",
  "data": {
    "team_results": [
      {
        "id": 2,
        "name": "YOUR TEAM NAME HERE",
        "place": 1
      },
      {
        "id": 1,
        "name": "Gridmaster",
        "place": 0
      }
    ],
    "game_end_reason": 0,
    "version": "1.0.0",
    "game_id": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

### Result Field Descriptions

- `pattern`: Always `"game_result"` for game completion messages
- `data.team_results`: Array of team results ordered by performance
  - `id`: Team identifier
  - `name`: Team name
  - `place`: Final placement (0-based, where 0 is the winner)
- `data.game_end_reason`: Reason code for game termination
- `data.version`: API version
- `data.game_id`: UUID of the completed game

## Queue Names

- **Input Queue**: `game_queue` - Send game start messages here
- **Output Queue**: `game_results` - Listen for game completion results here

## Notes

- All UUIDs should be in standard UUID format
- Docker images should be fully qualified with registry, repository, and tag
- Repository URLs should be accessible Git repositories
- The system expects exactly the structure shown above for proper message processing