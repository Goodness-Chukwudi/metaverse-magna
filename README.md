# Transaction Streamer

# Introduction

The application tracks the activities on an ethereum block. It streams the transactions on the blockchain as they happen using socket.io..

## Prerequisites

Before you can set up and run this application on your machine, you need the following installed:

- Node.js
- postgres db
- Postman to access the documentation and test the API endpoints

## Setup

Follow these steps to set up and run the Task Management System on your machine:

1. **Install Dependencies**:

   After cloning the project, navigate to the project folder using your terminal and enter the command "npm install" to install all the required dependencies. The package.json file specifies all the needed dependecies to run the application.

2. **Run the Application**:

   - Enter the command "npm run dev" to start the application. A list of possible command scripts are specified in the package.json file as well.
   - When logged in, emit a socket.io event with the name "subscribe-to-events" with the event ("all_events", "sender", "receiver", "receiver_or_sender") type to subscribe to in the payload. A jwt token is required either in the auth payload as token or the header as x-access-token.
   - The full endpoints and examples are documented on this postman collection: https://www.postman.com/goodness-chukwudi-public/workspace/metaverse-magna/collection/26100881-997e4be6-a988-4011-838e-1d7fd92c1064?action=share&creator=26100881.
