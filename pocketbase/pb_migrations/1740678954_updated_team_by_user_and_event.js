/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_661304869")

  // update collection data
  unmarshal({
    "viewQuery": "SELECT \n    (ROW_NUMBER() OVER()) as id, \n    teams.id as event_id, \n    team_user.user as team_user, \n    teams.event as team_event,\n  teams.created as team_created,\n  teams.locked as team_locked,\n  teams.updated as team_updated,\n  teams.repo as team_repo\nFROM teams \nJOIN team_user ON teams.id = team_user.team"
  }, collection)

  // remove field
  collection.fields.removeById("_clone_TuV5")

  // remove field
  collection.fields.removeById("_clone_g6Ap")

  // add field
  collection.fields.addAt(2, new Field({
    "cascadeDelete": true,
    "collectionId": "_pb_users_auth_",
    "hidden": false,
    "id": "_clone_9e9I",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "team_user",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "relation"
  }))

  // add field
  collection.fields.addAt(3, new Field({
    "cascadeDelete": true,
    "collectionId": "pbc_1687431684",
    "hidden": false,
    "id": "_clone_k9bw",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "team_event",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "relation"
  }))

  // add field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "_clone_cGE1",
    "name": "team_created",
    "onCreate": true,
    "onUpdate": false,
    "presentable": false,
    "system": false,
    "type": "autodate"
  }))

  // add field
  collection.fields.addAt(5, new Field({
    "hidden": false,
    "id": "_clone_lisi",
    "name": "team_locked",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  // add field
  collection.fields.addAt(6, new Field({
    "hidden": false,
    "id": "_clone_vkAh",
    "name": "team_updated",
    "onCreate": true,
    "onUpdate": true,
    "presentable": false,
    "system": false,
    "type": "autodate"
  }))

  // add field
  collection.fields.addAt(7, new Field({
    "exceptDomains": null,
    "hidden": false,
    "id": "_clone_5Efd",
    "name": "team_repo",
    "onlyDomains": null,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "url"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_661304869")

  // update collection data
  unmarshal({
    "viewQuery": "SELECT \n    (ROW_NUMBER() OVER()) as id, \n    teams.id as event_id, \n    team_user.user as team_user, \n    teams.event as team_event\nFROM teams \nJOIN team_user ON teams.id = team_user.team"
  }, collection)

  // add field
  collection.fields.addAt(2, new Field({
    "cascadeDelete": true,
    "collectionId": "_pb_users_auth_",
    "hidden": false,
    "id": "_clone_TuV5",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "team_user",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "relation"
  }))

  // add field
  collection.fields.addAt(3, new Field({
    "cascadeDelete": true,
    "collectionId": "pbc_1687431684",
    "hidden": false,
    "id": "_clone_g6Ap",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "team_event",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "relation"
  }))

  // remove field
  collection.fields.removeById("_clone_9e9I")

  // remove field
  collection.fields.removeById("_clone_k9bw")

  // remove field
  collection.fields.removeById("_clone_cGE1")

  // remove field
  collection.fields.removeById("_clone_lisi")

  // remove field
  collection.fields.removeById("_clone_vkAh")

  // remove field
  collection.fields.removeById("_clone_5Efd")

  return app.save(collection)
})
