# NoseBook API

This is the api for the NoseBook app, a Facebook clone.

[Front-end repository](https://github.com/ShirshoDipto/social-media-client)

[Socket repository](https://github.com/ShirshoDipto/nosebook-socket)

## Running Locally

To run the front-end and socket server locally, follow the instructions on the [Front-end Repository](https://github.com/ShirshoDipto/social-media-client) and [Socket repository](https://github.com/ShirshoDipto/nosebook-socket) respectively.

### Clone repository

```
git clone git@github.com:ShirshoDipto/social-media-api.git
```

```
cd social-media-api
```

### Set up environment variables

```
MONGODB_URI = <URI used to connect to a MongoDB database>

NODE_ENV = production

PORT = <A port for local address, e.g 5000>

JWT_SECRET = <jwt secret key for jwt authentication>

CLIENT_URI = <Address of the client. https://nosebook-social.netlify.app or local address, e.g http://localhost:3000>

SOCKET_URI = <Address of the socket server. https://nosebook-socket.onrender.com or local address, e.g http://localhost:4000>

GOOGLE_CLIENT_ID = <Google client id achieved from google console for log in/sign up with google>

GOOGLE_CLIENT_SECRET = <Google client secret achieved from google console for log in/sign up with google>

CLOUD_NAME = <A cloud name achieved from cloudinary account>

CLOUD_API_KEY = <A cloud api key achieved from cloudinary account>

CLOUD_API_SECRET = <A cloud api key achieved from cloudinary account>
```

### Install packages and start server

```
npm install
```

```
npm start
```
