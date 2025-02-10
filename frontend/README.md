# How to setup
## frontend
- ### run `npm install`
- ### rename `.env.example` to `.env`
## github oauth
- ### go to `settings` > `developer settings` > `OAuth Apps`
- ### register a new OAuth app
- ### the `Authorization callback URL` should be `http://127.0.0.1:8090/api/oauth2-redirect`
- ### save the Client ID/Secret
- ### go to pocketbase in the `users` collection
- ### press `edit collection` > `Options` > `OAuth 2` > `Add provider` > `github`
- ### paste your Client ID/Secret 