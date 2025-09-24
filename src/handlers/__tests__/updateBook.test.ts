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
  UpdateCommand: jest.fn(),
}));

jest.mock('@aws-sdk/client-dynamodb', () => ({
  DynamoDBClient: jest.fn(),
}));

import { handler } from '../updateBook';

describe('updateBook handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.BOOKS_TABLE = 'test-books-table';
  });

  const createMockEvent = (id?: string, body?: any): APIGatewayProxyEvent => ({
    body: body ? JSON.stringify(body) : null,
    headers: {},
    multiValueHeaders: {},
    httpMethod: 'PUT',
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
    title: 'Original Title',
    author: 'Original Author',
    createdAt: '2025-09-23T10:00:00.000Z',
  };

  it('should update book title successfully', async () => {
    const updateData = { title: 'Updated Title' };
    const updatedBook = {
      ...mockExistingBook,
      title: 'Updated Title',
      updatedAt: '2025-09-23T12:00:00.000Z',
    };

    mockSend
      .mockResolvedValueOnce({ Item: mockExistingBook }) // GetCommand
      .mockResolvedValueOnce({ Attributes: updatedBook }); // UpdateCommand

    const event = createMockEvent('123', updateData);
    const result = await handler(event);

    expect(result.statusCode).toBe(200);
    expect(result.headers?.['Content-Type']).toBe('application/json');
    
    const responseBody = JSON.parse(result.body);
    expect(responseBody.title).toBe('Updated Title');
    expect(responseBody.author).toBe('Original Author');
    expect(responseBody.updatedAt).toBeDefined();

    expect(mockSend).toHaveBeenCalledTimes(2);
  });

  it('should update book author successfully', async () => {
    const updateData = { author: 'Updated Author' };
    const updatedBook = {
      ...mockExistingBook,
      author: 'Updated Author',
      updatedAt: '2025-09-23T12:00:00.000Z',
    };

    mockSend
      .mockResolvedValueOnce({ Item: mockExistingBook })
      .mockResolvedValueOnce({ Attributes: updatedBook });

    const event = createMockEvent('123', updateData);
    const result = await handler(event);

    expect(result.statusCode).toBe(200);
    const responseBody = JSON.parse(result.body);
    expect(responseBody.title).toBe('Original Title');
    expect(responseBody.author).toBe('Updated Author');

    expect(mockSend).toHaveBeenCalledTimes(2);
  });

  it('should update both title and author successfully', async () => {
    const updateData = { title: 'New Title', author: 'New Author' };
    const updatedBook = {
      ...mockExistingBook,
      title: 'New Title',
      author: 'New Author',
      updatedAt: '2025-09-23T12:00:00.000Z',
    };

    mockSend
      .mockResolvedValueOnce({ Item: mockExistingBook })
      .mockResolvedValueOnce({ Attributes: updatedBook });

    const event = createMockEvent('123', updateData);
    const result = await handler(event);

    expect(result.statusCode).toBe(200);
    const responseBody = JSON.parse(result.body);
    expect(responseBody.title).toBe('New Title');
    expect(responseBody.author).toBe('New Author');

    expect(mockSend).toHaveBeenCalledTimes(2);
  });

  it('should return 404 when book not found', async () => {
    const updateData = { title: 'Updated Title' };

    mockSend.mockResolvedValueOnce({ Item: undefined }); // Book not found

    const event = createMockEvent('nonexistent-id', updateData);
    const result = await handler(event);

    expect(result.statusCode).toBe(404);
    const responseBody = JSON.parse(result.body);
    expect(responseBody.error).toBe('Book not found');

    expect(mockSend).toHaveBeenCalledTimes(1); // Only GetCommand called
  });

  it('should return 400 when ID is missing', async () => {
    const updateData = { title: 'Updated Title' };

    const event = createMockEvent(undefined, updateData); // No ID

    const result = await handler(event);

    expect(result.statusCode).toBe(400);
    const responseBody = JSON.parse(result.body);
    expect(responseBody.error).toBe('Book ID is required');

    expect(mockSend).not.toHaveBeenCalled();
  });

  it('should return 400 when body is missing', async () => {
    const event = createMockEvent('123'); // No body

    const result = await handler(event);

    expect(result.statusCode).toBe(400);
    const responseBody = JSON.parse(result.body);
    expect(responseBody.error).toBe('Request body is required');

    expect(mockSend).not.toHaveBeenCalled();
  });

  it('should return 400 when body is invalid JSON', async () => {
    const event: APIGatewayProxyEvent = {
      body: 'invalid json',
      headers: {},
      multiValueHeaders: {},
      httpMethod: 'PUT',
      isBase64Encoded: false,
      path: '/books/123',
      pathParameters: { id: '123' },
      queryStringParameters: null,
      multiValueQueryStringParameters: null,
      stageVariables: null,
      requestContext: {} as any,
      resource: '',
    };

    const result = await handler(event);

    expect(result.statusCode).toBe(400);
    const responseBody = JSON.parse(result.body);
    expect(responseBody.error).toBe('Invalid JSON in request body');

    expect(mockSend).not.toHaveBeenCalled();
  });

  it('should return 400 when no fields provided for update', async () => {
    const updateData = {}; // Empty update data

    const event = createMockEvent('123', updateData);
    const result = await handler(event);

    expect(result.statusCode).toBe(400);
    const responseBody = JSON.parse(result.body);
    expect(responseBody.error).toBe('At least one field (title or author) must be provided');

    expect(mockSend).not.toHaveBeenCalled();
  });

  it('should return 400 when only unknown fields provided', async () => {
    const updateData = { unknownField: 'value' }; // Only unknown fields

    const event = createMockEvent('123', updateData);
    const result = await handler(event);

    expect(result.statusCode).toBe(400);
    const responseBody = JSON.parse(result.body);
    expect(responseBody.error).toBe('At least one field (title or author) must be provided');

    expect(mockSend).not.toHaveBeenCalled();
  });

  it('should return 500 when GetCommand fails', async () => {
    const updateData = { title: 'Updated Title' };

    mockSend.mockRejectedValueOnce(new Error('DynamoDB get error'));

    const event = createMockEvent('123', updateData);
    const result = await handler(event);

    expect(result.statusCode).toBe(500);
    const responseBody = JSON.parse(result.body);
    expect(responseBody.error).toBe('Could not update book');
    expect(responseBody.details).toBe('DynamoDB get error');

    expect(mockSend).toHaveBeenCalledTimes(1);
  });

  it('should return 500 when UpdateCommand fails', async () => {
    const updateData = { title: 'Updated Title' };

    mockSend
      .mockResolvedValueOnce({ Item: mockExistingBook }) // GetCommand succeeds
      .mockRejectedValueOnce(new Error('DynamoDB update error')); // UpdateCommand fails

    const event = createMockEvent('123', updateData);
    const result = await handler(event);

    expect(result.statusCode).toBe(500);
    const responseBody = JSON.parse(result.body);
    expect(responseBody.error).toBe('Could not update book');
    expect(responseBody.details).toBe('DynamoDB update error');

    expect(mockSend).toHaveBeenCalledTimes(2);
  });

  it('should handle unknown errors', async () => {
    const updateData = { title: 'Updated Title' };

    mockSend.mockRejectedValueOnce('Unknown error type');

    const event = createMockEvent('123', updateData);
    const result = await handler(event);

    expect(result.statusCode).toBe(500);
    const responseBody = JSON.parse(result.body);
    expect(responseBody.error).toBe('Could not update book');
    expect(responseBody.details).toBe('Unknown error');

    expect(mockSend).toHaveBeenCalledTimes(1);
  });
});
