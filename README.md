# NC News API

A RESTful news API built with Node.js, Express.js, and PostgreSQL. This backend service provides endpoints for managing articles, comments, topics, and users in a Reddit-style news aggregation platform.

## 🚀 Hosted Version

**Live API:** [https://nc-news-be-rdh6.onrender.com/](https://nc-news-be-rdh6.onrender.com/)

## 📖 Project Summary

NC News API is a backend service that allows users to:
- Browse news articles by topic with sorting and filtering options
- Read individual articles with comment counts
- Post and manage comments on articles
- Vote on articles to influence their ranking
- View user profiles and topic information

The API follows REST conventions and returns JSON responses with appropriate HTTP status codes and error handling.

## 🏗️ Built With

- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **PostgreSQL** - Relational database
- **Jest & Supertest** - Testing framework
- **dotenv** - Environment variable management

## 📋 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api` | Get API documentation |
| GET | `/api/topics` | Get all topics |
| GET | `/api/articles` | Get all articles (with sorting & filtering) |
| GET | `/api/articles/:article_id` | Get article by ID |
| GET | `/api/articles/:article_id/comments` | Get comments for an article |
| POST | `/api/articles/:article_id/comments` | Add a comment to an article |
| PATCH | `/api/articles/:article_id` | Update article votes |
| GET | `/api/users` | Get all users |
| DELETE | `/api/comments/:comment_id` | Delete a comment |

## 🛠️ Setup Instructions

### Prerequisites

- **Node.js:** v18.0.0 or higher
- **PostgreSQL:** v12.0 or higher

### 1. Clone the Repository

```bash
git clone https://github.com/S-entinel/northcoders-news-be.git
cd northcoders-news-be
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create two environment files in the project root:

**`.env.development`**
```
PGDATABASE=nc_news
```

**`.env.test`**  
```
PGDATABASE=nc_news_test
```

**`.env.production`** (for deployment)
```
DATABASE_URL=your_database_url_here
```

### 4. Database Setup

```bash
# Create databases
npm run setup-dbs

# Seed development database
npm run seed
```

### 5. Running the Application

```bash
# Start the server (production)
npm start

# Development mode
npm run seed && npm start
```

The server will run on port 9090 by default, or the port specified in your PORT environment variable.

## 🧪 Testing

```bash
# Run all tests
npm test

# Run database seeding tests only
npm run test-seed
```

## 📂 Project Structure

```
├── app.js                 # Express app setup and routes
├── listen.js              # Server startup
├── controllers/           # Route handlers
├── models/               # Database queries
├── db/
│   ├── connection.js     # Database connection
│   ├── setup-dbs.sql     # Database creation script
│   ├── seeds/            # Database seeding
│   └── data/             # Test and development data
├── __tests__/            # Jest test suites
├── errors.js             # Error handling middleware
└── endpoints.json        # API documentation
```

## 🔧 Available Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start the production server |
| `npm test` | Run all tests |
| `npm run setup-dbs` | Create development and test databases |
| `npm run seed` | Seed development database |
| `npm run test-seed` | Run seeding tests |
| `npm run seed-prod` | Seed production database |

## 🌐 Example API Usage

### Get All Articles
```bash
GET /api/articles
GET /api/articles?sort_by=votes&order=desc&topic=coding
```

### Get Article by ID
```bash
GET /api/articles/1
```

### Post a Comment
```bash
POST /api/articles/1/comments
Content-Type: application/json

{
  "username": "butter_bridge",
  "body": "Great article!"
}
```

### Update Article Votes
```bash
PATCH /api/articles/1
Content-Type: application/json

{
  "inc_votes": 5
}
```

## 📊 Database Schema

### Articles
- `article_id` (Primary Key)
- `title` 
- `topic` (Foreign Key)
- `author` (Foreign Key)
- `body`
- `created_at`
- `votes`
- `article_img_url`

### Comments
- `comment_id` (Primary Key)
- `article_id` (Foreign Key)
- `author` (Foreign Key)
- `body`
- `votes`
- `created_at`

### Topics
- `slug` (Primary Key)
- `description`
- `img_url`

### Users
- `username` (Primary Key)
- `name`
- `avatar_url`

## 🔒 Error Handling

The API returns appropriate HTTP status codes:

- `200` - Success
- `201` - Created
- `204` - No Content
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error
