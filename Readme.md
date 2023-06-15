<p align="center">
  <img src="images/BotaniPlan.png" alt="Konva logo" height="300" />
</p>

<h1 align="center">BotaniPlan</h1>

<div align="center">

</div>

Botaniplan was designed that uses machine learning technology to recommend the most suitable types of crops to grow in a farmer's area based on factors such as soil type, climate, and water availability. This application is also equipped with a market price prediction feature that can help novice farmers make the right decisions in terms of selling their agricultural products. With this application, it is hoped that novice farmers can manage their agricultural business better, increase crop yields and minimize the risk of crop failure. In addition, it is hoped that this application can increase the interest and welfare of farmers in Indonesia.


The first thing you need to know is that this service is using authentication to access each service. You need to login to access the service. The login is using username and password. You can register on the registration service. Please don't spam the registration service because it will make the registration service slow. If you have some idea to secure this service, please contact me.

> Base url of this service is: http://localhost:5000/

The service available:

- Login
  <pre>POST /login</pre>

- Register
  <pre>POST /registers</pre>

- Logout
  <pre>POST /logout</pre>

- Weather
  <pre>GET /weather?lat={latitude}&lon={longitude}</pre>

- Elevation
  <pre>GET /elevation?lat={latitude}&lon={longitude}</pre>
  
- Prediction
  <pre>POST /predict</pre>

- Recommendation
  <pre>POST /recommend</pre>
  
  
- Plant
  <pre>GET /plants/{id1,id2,id3,...}</pre> 

- City
  <pre>GET /city?lat={latitude}&lon={longitude}</pre>



# Quick Look

## Architecture

<p align="center">
  <img src="images/Architecture.jpg" alt="Konva logo" />
</p>

# Authentications

This service is using token for authentication. You should have an account to access this service. First if you don't have an account, create a new account. Then, create a token for authentication. It's like login, you need to authenticate yourself with username and password. If the autentication is valid, you will get a token. You can use this token to access the service. If dont, you will get a error message. 

The token given is accessToken and refreshToken. The refreshToken is used to refresh the token. The accessToken is valid for 30 minutes. If you want to refresh the token, you need to send the refreshToken to the service. If the refreshToken is valid, you will get a new accessToken. If the refreshToken is not valid, you will get a error message.


# Environment

In order to run this project, you need to configure the following environment variables:

```bash
#development
PORT=8080
JWT_SECRET=eyJhbGciOiJIUzI1NiJ9.eyJSb2xlIjoiQWRtaW4iLCJJc3N1ZXIiOiJJc3N1ZXIiLCJVc2VybmFtZSI6IkphdmFJblVzZSIsImV4cCI6MTY4NjE1MjAwMywiaWF0IjoxNjg2MTUyMDAzfQ.psGlhK3SxnsCbZQgvtfK1R00bV8ukGq0ayNbb5d5QWc

# Database Configuration
DB_CONNECTION_LIMIT=100
DB_HOST=34.101.195.31
DB_USER=root
DB_PASSWORD=c23@ps261
DB_DATABASE=botaniplan

# Public API
OPEN_WEATHER_API_KEY=0c138a3868d5f4fc70bbf3b8a2354f6d
OPEN_METEO_API_URL=https://api.open-meteo.com/v1

# Flask & Endpoint URL
FLASK_API_URL=https://botaniplan-model-7zyo647nsq-et.a.run.app
ENDPOINT_URL=https://botaniplan-7zyo647nsq-et.a.run.app

```

### Dependency

* [Hapi Server](https://www.npmjs.com/package/@hapi/hapi)
* [JWT](https://www.npmjs.com/package/@hapi/jwt)
* [Bcrypt](https://www.npmjs.com/package/bcrypt)
* [DotEnv](https://www.npmjs.com/package/dotenv)
* [Joi](https://www.npmjs.com/package/joi)
* [Nanoid](https://www.npmjs.com/package/nanoid)
* [node-pg-migrate](https://www.npmjs.com/package/node-pg-migrate)
* [pg](https://www.npmjs.com/package/pg)

# Testing

# Pull Requests

I'd be happy to review any pull requests that may better the BotaniPlan project, in particular if you have a bug fix, enhancement, or a new idea, you can contact us.

## Contributors

### CC Member (Master Contributor)
CC member is responsible for the development of the API service and deployment of the model. In sort, in this project CC is responsible for Backend, infrastructure, and DevOps.

### ML Member

<p>ML Member is who are contribute to create prediction and classification model that used in this web service. Without them, this service is nothing.</p>

### MD Member

<p>MD member is who are responsible to serve mobile applications based on Android and use this service as data source and more.</p>
