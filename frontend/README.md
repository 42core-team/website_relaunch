# How to setup

## frontend

- ### run `npm install`
- ### rename `.env.example` to `.env`

## github oauth

- ### go to `settings` > `developer settings` > `OAuth Apps`
- ### register a new OAuth app
- ### the `Authorization callback URL` should be `http://localhost:3000/api/auth/callback`
- ### save the Client ID/Secret and put it into the .env
