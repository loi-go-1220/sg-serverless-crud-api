# Book Library API

A simple CRUD REST API for managing books built with AWS Serverless technologies.

## Development Approach
This project follows an incremental development approach:
1. ✅ Project setup
2. 🔄 Complete CREATE book endpoint implementation
3. ⏳ Add remaining CRUD endpoints incrementally

## Tech Stack
- AWS Lambda
- AWS API Gateway  
- AWS DynamoDB
- Serverless Framework v3
- TypeScript
- Node.js 22.17.1

## Current Status
- [x] Project initialization
- [x] Serverless Framework + TypeScript setup
- [x] CREATE book endpoint implementation
- [x] Unit tests for CREATE endpoint (6 test cases)
- [x] CI/CD pipeline (GitHub Actions)
- [x] GET books endpoints (list all + single book)
- [x] Unit tests for GET endpoints (11 test cases)
- [x] UPDATE book endpoint (partial updates)
- [x] Unit tests for UPDATE endpoint (12 test cases)
- [ ] DELETE book endpoint
- [ ] Complete documentation

## API Endpoints
```
POST   /books       - Create a new book ✅
GET    /books       - List all books ✅
GET    /books/{id}  - Get a specific book ✅
PUT    /books/{id}  - Update a book ✅
DELETE /books/{id}  - Delete a book
```

## Book Data Model
```typescript
interface Book {
  id: string;
  title: string;
  author: string;
  createdAt: string;
}
```

## Getting Started

### CREATE Book Endpoint

**Endpoint:** `POST /books`

**Request:**
```json
{
  "title": "Book Title",
  "author": "Author Name"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "title": "Book Title", 
  "author": "Author Name",
  "createdAt": "2025-09-23T14:30:00.000Z"
}
```

### GET All Books Endpoint

**Endpoint:** `GET /books`

**Response (200):**
```json
[
  {
    "id": "uuid1",
    "title": "Book 1",
    "author": "Author 1",
    "createdAt": "2025-09-23T14:30:00.000Z"
  },
  {
    "id": "uuid2",
    "title": "Book 2",
    "author": "Author 2",
    "createdAt": "2025-09-23T15:30:00.000Z"
  }
]
```

### GET Single Book Endpoint

**Endpoint:** `GET /books/{id}`

**Response (200):**
```json
{
  "id": "uuid",
  "title": "Book Title",
  "author": "Author Name",
  "createdAt": "2025-09-23T14:30:00.000Z"
}
```

**Error Response (404):**
```json
{
  "error": "Book not found"
}
```

### UPDATE Book Endpoint

**Endpoint:** `PUT /books/{id}`

**Request (partial update):**
```json
{
  "title": "Updated Title"
}
```

or

```json
{
  "author": "Updated Author"
}
```

or both:

```json
{
  "title": "New Title",
  "author": "New Author"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "title": "Updated Title",
  "author": "Original Author",
  "createdAt": "2025-09-23T14:30:00.000Z",
  "updatedAt": "2025-09-23T16:30:00.000Z"
}
```

**Error Responses:**
- **400**: Missing ID, no body, invalid JSON, or no valid fields
- **404**: Book not found
- **500**: Server error

### Prerequisites
- Node.js 22.17.1
- AWS CLI configured
- Serverless Framework v3

### Installation
```bash
npm install
```

### Development
```bash
# Build TypeScript
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Deploy to development environment
npm run deploy:dev

# Deploy to production environment
npm run deploy:prod
```

### Testing
**Total: 29 test cases with 94.7% statement coverage**

**CREATE Endpoint Tests (6 tests):**
- ✅ Successful book creation
- ✅ Validation errors (missing title/author)
- ✅ Invalid JSON handling
- ✅ DynamoDB error handling
- ✅ Empty body handling

**GET Endpoints Tests (11 tests):**
- ✅ List all books (success, empty, undefined items)
- ✅ Get single book (success, not found, missing ID)
- ✅ DynamoDB error handling for both endpoints
- ✅ Unknown error type handling

**UPDATE Endpoint Tests (12 tests):**
- ✅ Update title only, author only, and both fields
- ✅ Partial updates with automatic updatedAt timestamp
- ✅ Validation: missing ID, body, invalid JSON, no valid fields
- ✅ 404 handling for non-existent books
- ✅ DynamoDB error handling (get and update failures)
- ✅ Unknown error type handling

### CI/CD Pipeline
GitHub Actions workflow automatically:
- ✅ Runs tests on all branches
- ✅ Deploys to dev environment on `dev` branch push
- ✅ Deploys to prod environment on `main` branch push

## Git Workflow
- `main` branch: Production environment
- `dev` branch: Development environment
- `feature/*` branches: Individual features

## License
MIT
