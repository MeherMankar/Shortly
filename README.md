# WebShortener
A simple web shortener made with [Oak](https://deno.land/x/oak) and
[MongoDB](https://mongodb.com), deployable as either a Deno app or Vercel
Functions.

<a href="https://www.producthunt.com/posts/webshortener?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-webshortener" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=429959&theme=dark" alt="WebShortener - A&#0032;simple&#0032;lightweight&#0032;link&#0032;shortener&#0032;using&#0032;MongoDB&#0046; | Product Hunt" style="width: 250px; height: 54px;" width="250" height="54" /></a>

# Live Version
You can find the live version of this project [here](https://short.meher.tech).

# API
Send a JSON `POST` request to `/shorten` with a `url` field:

```json
{ "url": "https://example.com" }
```

Successful requests return `{ "hash": "..." }`. Visit `/<hash>` to redirect to
the original URL. Only HTTP and HTTPS URLs up to 2048 characters are accepted.

# Local development

Install Deno, copy `.env.sample` to `.env`, and set `MONGO_URL` to a MongoDB
connection string. Then run:

```sh
deno task start
```

The app listens on port 8000 by default; set `PORT` to change it. Run the URL
validation tests with `deno task test` and type-check the server with
`deno task check`.

# Deployment

## Vercel

Import the repository into Vercel and set `MONGO_URL` in the project's
environment variables. Vercel serves the frontend from `public/` and runs the
Node.js API functions in `api/`. The `/shorten` and `/<hash>` routes are
rewritten to those functions.

## Deno

Deploy this as a long-running Deno application on a host that supports Deno and
MongoDB network access. Configure `MONGO_URL` and, if required by the host,
`PORT` as environment variables. Grant the app only the environment, network,
and file-read permissions used by the start task. Configure rate limiting at
the hosting platform or reverse proxy before exposing the public endpoint.

# License
This project is licensed under the [MIT License](./LICENSE).

# Credits
Made with ❤️ by [Meher Mankar](https://www.meher.tech).
