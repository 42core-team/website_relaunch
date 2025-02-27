/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_661304869")

  // update collection data
  unmarshal({
    "viewQuery": "SELECT \n    (ROW_NUMBER() OVER()) as id, \n    teams.id as event_id,\n    team_user.user as team_user, \n    teams.event as team_event,\n  teams.created as team_created,\n  teams.locked as team_locked,\n  teams.updated as team_updated,\n  teams.repo as team_repo,\n  teams.name as team_name\nFROM teams \nJOIN team_user ON teams.id = team_user.team"
  }, collection)

  // remove field
  collection.fields.removeById("_clone_ORaK")

  // remove field
  collection.fields.removeById("_clone_8yCd")

  // remove field
  collection.fields.removeById("_clone_xSye")

  // remove field
  collection.fields.removeById("_clone_2P5R")

  // remove field
  collection.fields.removeById("_clone_2utH")

  // remove field
  collection.fields.removeById("_clone_D2zj")

  // remove field
  collection.fields.removeById("_clone_hmKW")

  // add field
  collection.fields.addAt(2, new Field({
    "cascadeDelete": true,
    "collectionId": "_pb_users_auth_",
    "hidden": false,
    "id": "_clone_9t3Q",
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
    "id": "_clone_T8K0",
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
    "id": "_clone_B9up",
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
    "id": "_clone_PZVA",
    "name": "team_locked",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  // add field
  collection.fields.addAt(6, new Field({
    "hidden": false,
    "id": "_clone_5kEv",
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
    "id": "_clone_3ITm",
    "name": "team_repo",
    "onlyDomains": null,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "url"
  }))

  // add field
  collection.fields.addAt(8, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "_clone_xmYi",
    "max": 0,
    "min": 0,
    "name": "team_name",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_661304869")

  // update collection data
  unmarshal({
    "viewQuery": "SELECT \n    (ROW_NUMBER() OVER()) as id, \n    teams.id as event_id, \n    team_user.user as team_user, \n    teams.event as team_event,\n  teams.created as team_created,\n  teams.locked as team_locked,\n  teams.updated as team_updated,\n  teams.repo as team_repo,\n  teams.name as team_name\nFROM teams \nJOIN team_user ON teams.id = team_user.team"
  }, collection)

  // add field
  collection.fields.addAt(2, new Field({
    "cascadeDelete": true,
    "collectionId": "_pb_users_auth_",
    "hidden": false,
    "id": "_clone_ORaK",
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
    "id": "_clone_8yCd",
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
    "id": "_clone_xSye",
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
    "id": "_clone_2P5R",
    "name": "team_locked",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  // add field
  collection.fields.addAt(6, new Field({
    "hidden": false,
    "id": "_clone_2utH",
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
    "id": "_clone_D2zj",
    "name": "team_repo",
    "onlyDomains": null,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "url"
  }))

  // add field
  collection.fields.addAt(8, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "_clone_hmKW",
    "max": 0,
    "min": 0,
    "name": "team_name",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // remove field
  collection.fields.removeById("_clone_9t3Q")

  // remove field
  collection.fields.removeById("_clone_T8K0")

  // remove field
  collection.fields.removeById("_clone_B9up")

  // remove field
  collection.fields.removeById("_clone_PZVA")

  // remove field
  collection.fields.removeById("_clone_5kEv")

  // remove field
  collection.fields.removeById("_clone_3ITm")

  // remove field
  collection.fields.removeById("_clone_xmYi")

  return app.save(collection)
})
