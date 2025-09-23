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
- [ ] GET books endpoints
- [ ] UPDATE book endpoint
- [ ] DELETE book endpoint
- [ ] Complete documentation

## API Endpoints (Planned)
```
POST   /books       - Create a new book
GET    /books       - List all books
GET    /books/{id}  - Get a specific book
PUT    /books/{id}  - Update a book
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

**Response:**
```json
{
  "id": "uuid",
  "title": "Book Title", 
  "author": "Author Name",
  "createdAt": "2025-09-23T14:30:00.000Z"
}
```

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
The CREATE endpoint has comprehensive unit tests covering:
- ✅ Successful book creation
- ✅ Validation errors (missing title/author)
- ✅ Invalid JSON handling
- ✅ DynamoDB error handling
- ✅ Empty body handling

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
