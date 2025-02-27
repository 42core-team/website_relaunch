/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    "createRule": null,
    "deleteRule": null,
    "fields": [
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text3208210256",
        "max": 0,
        "min": 0,
        "name": "id",
        "pattern": "^[a-z0-9]+$",
        "presentable": false,
        "primaryKey": true,
        "required": true,
        "system": true,
        "type": "text"
      },
      {
        "cascadeDelete": false,
        "collectionId": "pbc_1568971955",
        "hidden": false,
        "id": "relation1912072331",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "event_id",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "relation"
      },
      {
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
      },
      {
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
      }
    ],
    "id": "pbc_661304869",
    "indexes": [],
    "listRule": null,
    "name": "team_by_user_and_event",
    "system": false,
    "type": "view",
    "updateRule": null,
    "viewQuery": "SELECT \n    (ROW_NUMBER() OVER()) as id, \n    teams.id as event_id, \n    team_user.user as team_user, \n    teams.event as team_event\nFROM teams \nJOIN team_user ON teams.id = team_user.team",
    "viewRule": null
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_661304869");

  return app.delete(collection);
})
