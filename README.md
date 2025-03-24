# Authentication System Backend

A secure and scalable authentication system backend that handles user registration, login, profile management.

## Features

- User registration and account management
- Secure authentication with JWT
- Password hashing and security

## Tech Stack

- Node.js/Express.js
- Prisma ORM
- JSON Web Tokens (JWT)
- bcrypt for password hashing

## Prerequisites

- Node.js (v18+)
- Prisma
- yarn

## Installation

1. Clone the repository:

```bash
git clone https://github.com/iLunZ/authentic-backend.git
```

2. Navigate to the project directory:

```bash
cd authentic-backend
```

3. Install dependencies:

```bash
yarn install
```

4. Create a `.env` file in the root directory with the following variables:

```bash
# ask for the database url from the database provider
DATABASE_URL="prisma+postgres://xxxxxxxxxx" 
JWT_SECRET="XXXX"
```

## Running the Application

### Development mode
if you are the first time running the app, you need to run the following command to generate the prisma client
```bash
yarn prisma:generate
```
then you can start the server with the following command

```bash
yarn run start
```
