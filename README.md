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
- [ ] CREATE book endpoint
- [ ] GET books endpoints
- [ ] UPDATE book endpoint
- [ ] DELETE book endpoint
- [ ] CI/CD pipeline
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
  isbn?: string;
  publishedYear?: number;
  genre?: string;
  createdAt: string;
  updatedAt: string;
}
```

## Getting Started
*Documentation will be updated as each endpoint is implemented*

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
# Deploy to development environment
npm run deploy:dev

# Deploy to production environment
npm run deploy:prod

# Run tests
npm test
```

## Git Workflow
- `main` branch: Production environment
- `dev` branch: Development environment
- `feature/*` branches: Individual features

## License
MIT
