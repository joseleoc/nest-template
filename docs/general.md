# General

## Project setup
see [.env.example](../.env.example) for the required environment variables.\
Env files should be placed in the root directory, and named `.env.local`, `.env.development` or `.env.production`.\
The production environment variables are:

```bash
PORT="Used to run the server."
JWT_SECRET= "Used to sign the JWT tokens. *Required."
DB_URL="Used to connect to the mongo database."
DB_NAME="Used to connect to the mongo database."
APP_SALT="Used to salt the passwords."
OPENAI_API_KEY="The openAI api key. Used to connect to the openai api."
OPENAI_PROJECT="The openAI project id. Used to connect to the openai api."
```

All the endpoints are protected by a jwt guard by default. To change the default behavior, use the `@SkipAuth()` decorator over the controller or method.

## Database configuration

The database is configured using the [Mongoose](https://mongoosejs.com/) library.\
The database is used to store the users, stories, narrators, characters, places, plans and storiesPlaces.

All the endpoints that require authentication use the [jwt](https://jwt.io/) library to authenticate the user.