import { APIGatewayProxyEvent } from 'aws-lambda';

// Mock the AWS SDK and utils
const mockSend = jest.fn();

jest.mock('../../utils/dynamodb', () => ({
  dynamoDb: { send: mockSend },
  TABLE_NAME: 'test-books-table',
}));

jest.mock('@aws-sdk/lib-dynamodb', () => ({
  DynamoDBDocumentClient: {
    from: jest.fn(),
  },
  PutCommand: jest.fn(),
}));

jest.mock('@aws-sdk/client-dynamodb', () => ({
  DynamoDBClient: jest.fn(),
}));

import { handler } from '../createBook';

describe('createBook handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.BOOKS_TABLE = 'test-books-table';
  });

  const createMockEvent = (body: any): APIGatewayProxyEvent => ({
    body: JSON.stringify(body),
    headers: {},
    multiValueHeaders: {},
    httpMethod: 'POST',
    isBase64Encoded: false,
    path: '/books',
    pathParameters: null,
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext: {} as any,
    resource: '',
  });

  it('should create a book successfully', async () => {
    const bookData = {
      title: 'Test Book',
      author: 'Test Author',
    };

    mockSend.mockResolvedValueOnce({});

    const event = createMockEvent(bookData);
    const result = await handler(event);

    expect(result.statusCode).toBe(201);
    expect(result.headers?.['Content-Type']).toBe('application/json');
    
    const responseBody = JSON.parse(result.body);
    expect(responseBody.title).toBe('Test Book');
    expect(responseBody.author).toBe('Test Author');
    expect(responseBody.id).toBeDefined();
    expect(responseBody.createdAt).toBeDefined();
    expect(responseBody.updatedAt).toBeDefined();
    expect(responseBody.createdAt).toBe(responseBody.updatedAt); // Should be the same for new books

    expect(mockSend).toHaveBeenCalledTimes(1);
  });

  it('should return 400 when title is missing', async () => {
    const bookData = {
      author: 'Test Author',
    };

    const event = createMockEvent(bookData);
    const result = await handler(event);

    expect(result.statusCode).toBe(400);
    const responseBody = JSON.parse(result.body);
    expect(responseBody.error).toBe('Title and author are required');

    expect(mockSend).not.toHaveBeenCalled();
  });

  it('should return 400 when author is missing', async () => {
    const bookData = {
      title: 'Test Book',
    };

    const event = createMockEvent(bookData);
    const result = await handler(event);

    expect(result.statusCode).toBe(400);
    const responseBody = JSON.parse(result.body);
    expect(responseBody.error).toBe('Title and author are required');

    expect(mockSend).not.toHaveBeenCalled();
  });

  it('should return 400 when body is invalid JSON', async () => {
    const event: APIGatewayProxyEvent = {
      body: 'invalid json',
      headers: {},
      multiValueHeaders: {},
      httpMethod: 'POST',
      isBase64Encoded: false,
      path: '/books',
      pathParameters: null,
      queryStringParameters: null,
      multiValueQueryStringParameters: null,
      stageVariables: null,
      requestContext: {} as any,
      resource: '',
    };

    const result = await handler(event);

    expect(result.statusCode).toBe(500);
    const responseBody = JSON.parse(result.body);
    expect(responseBody.error).toBe('Could not create book');

    expect(mockSend).not.toHaveBeenCalled();
  });

  it('should return 500 when DynamoDB operation fails', async () => {
    const bookData = {
      title: 'Test Book',
      author: 'Test Author',
    };

    mockSend.mockRejectedValueOnce(new Error('DynamoDB error'));

    const event = createMockEvent(bookData);
    const result = await handler(event);

    expect(result.statusCode).toBe(500);
    const responseBody = JSON.parse(result.body);
    expect(responseBody.error).toBe('Could not create book');
    expect(responseBody.details).toBe('DynamoDB error');

    expect(mockSend).toHaveBeenCalledTimes(1);
  });

  it('should handle empty body', async () => {
    const event: APIGatewayProxyEvent = {
      body: null,
      headers: {},
      multiValueHeaders: {},
      httpMethod: 'POST',
      isBase64Encoded: false,
      path: '/books',
      pathParameters: null,
      queryStringParameters: null,
      multiValueQueryStringParameters: null,
      stageVariables: null,
      requestContext: {} as any,
      resource: '',
    };

    const result = await handler(event);

    expect(result.statusCode).toBe(400);
    const responseBody = JSON.parse(result.body);
    expect(responseBody.error).toBe('Title and author are required');

    expect(mockSend).not.toHaveBeenCalled();
  });
});
