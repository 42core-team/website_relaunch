/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3629743757")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE UNIQUE INDEX `idx_KC7smNo5W5` ON `match_teams` (\n  `match`,\n  `team`\n)"
    ]
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3629743757")

  // update collection data
  unmarshal({
    "indexes": []
  }, collection)

  return app.save(collection)
})
