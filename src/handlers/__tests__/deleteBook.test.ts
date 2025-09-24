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
  GetCommand: jest.fn(),
  DeleteCommand: jest.fn(),
}));

jest.mock('@aws-sdk/client-dynamodb', () => ({
  DynamoDBClient: jest.fn(),
}));

import { handler } from '../deleteBook';

describe('deleteBook handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.BOOKS_TABLE = 'test-books-table';
  });

  const createMockEvent = (id?: string): APIGatewayProxyEvent => ({
    body: null,
    headers: {},
    multiValueHeaders: {},
    httpMethod: 'DELETE',
    isBase64Encoded: false,
    path: id ? `/books/${id}` : '/books/123',
    pathParameters: id ? { id } : null,
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext: {} as any,
    resource: '',
  });

  const mockExistingBook = {
    id: '123',
    title: 'Test Book',
    author: 'Test Author',
    createdAt: '2025-09-23T10:00:00.000Z',
    updatedAt: '2025-09-23T10:00:00.000Z',
  };

  it('should delete book successfully', async () => {
    mockSend
      .mockResolvedValueOnce({ Item: mockExistingBook }) // GetCommand
      .mockResolvedValueOnce({}); // DeleteCommand

    const event = createMockEvent('123');
    const result = await handler(event);

    expect(result.statusCode).toBe(204);
    expect(result.headers?.['Content-Type']).toBe('application/json');
    expect(result.body).toBe('');

    expect(mockSend).toHaveBeenCalledTimes(2);
  });

  it('should return 404 when book not found', async () => {
    mockSend.mockResolvedValueOnce({ Item: undefined }); // Book not found

    const event = createMockEvent('nonexistent-id');
    const result = await handler(event);

    expect(result.statusCode).toBe(404);
    const responseBody = JSON.parse(result.body);
    expect(responseBody.error).toBe('Book not found');

    expect(mockSend).toHaveBeenCalledTimes(1); // Only GetCommand called
  });

  it('should return 400 when ID is missing', async () => {
    const event = createMockEvent(); // No ID

    const result = await handler(event);

    expect(result.statusCode).toBe(400);
    const responseBody = JSON.parse(result.body);
    expect(responseBody.error).toBe('Book ID is required');

    expect(mockSend).not.toHaveBeenCalled();
  });

  it('should return 400 when pathParameters is null', async () => {
    const event: APIGatewayProxyEvent = {
      body: null,
      headers: {},
      multiValueHeaders: {},
      httpMethod: 'DELETE',
      isBase64Encoded: false,
      path: '/books/123',
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
    expect(responseBody.error).toBe('Book ID is required');

    expect(mockSend).not.toHaveBeenCalled();
  });

  it('should return 500 when GetCommand fails', async () => {
    mockSend.mockRejectedValueOnce(new Error('DynamoDB get error'));

    const event = createMockEvent('123');
    const result = await handler(event);

    expect(result.statusCode).toBe(500);
    const responseBody = JSON.parse(result.body);
    expect(responseBody.error).toBe('Could not delete book');
    expect(responseBody.details).toBe('DynamoDB get error');

    expect(mockSend).toHaveBeenCalledTimes(1);
  });

  it('should return 500 when DeleteCommand fails', async () => {
    mockSend
      .mockResolvedValueOnce({ Item: mockExistingBook }) // GetCommand succeeds
      .mockRejectedValueOnce(new Error('DynamoDB delete error')); // DeleteCommand fails

    const event = createMockEvent('123');
    const result = await handler(event);

    expect(result.statusCode).toBe(500);
    const responseBody = JSON.parse(result.body);
    expect(responseBody.error).toBe('Could not delete book');
    expect(responseBody.details).toBe('DynamoDB delete error');

    expect(mockSend).toHaveBeenCalledTimes(2);
  });

  it('should handle unknown errors', async () => {
    mockSend.mockRejectedValueOnce('Unknown error type');

    const event = createMockEvent('123');
    const result = await handler(event);

    expect(result.statusCode).toBe(500);
    const responseBody = JSON.parse(result.body);
    expect(responseBody.error).toBe('Could not delete book');
    expect(responseBody.details).toBe('Unknown error');

    expect(mockSend).toHaveBeenCalledTimes(1);
  });

  it('should handle empty ID string', async () => {
    const event = createMockEvent(''); // Empty ID

    const result = await handler(event);

    expect(result.statusCode).toBe(400);
    const responseBody = JSON.parse(result.body);
    expect(responseBody.error).toBe('Book ID is required');

    expect(mockSend).not.toHaveBeenCalled();
  });
});
