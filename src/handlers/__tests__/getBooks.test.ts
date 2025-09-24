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
  ScanCommand: jest.fn(),
}));

jest.mock('@aws-sdk/client-dynamodb', () => ({
  DynamoDBClient: jest.fn(),
}));

import { handler } from '../getBooks';

describe('getBooks handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.BOOKS_TABLE = 'test-books-table';
  });

  const createMockEvent = (): APIGatewayProxyEvent => ({
    body: null,
    headers: {},
    multiValueHeaders: {},
    httpMethod: 'GET',
    isBase64Encoded: false,
    path: '/books',
    pathParameters: null,
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext: {} as any,
    resource: '',
  });

  it('should return all books successfully', async () => {
    const mockBooks = [
      {
        id: '1',
        title: 'Book 1',
        author: 'Author 1',
        createdAt: '2025-09-23T10:00:00.000Z',
        updatedAt: '2025-09-23T10:00:00.000Z',
      },
      {
        id: '2',
        title: 'Book 2',
        author: 'Author 2',
        createdAt: '2025-09-23T11:00:00.000Z',
        updatedAt: '2025-09-23T11:00:00.000Z',
      },
    ];

    mockSend.mockResolvedValueOnce({ Items: mockBooks });

    const event = createMockEvent();
    const result = await handler(event);

    expect(result.statusCode).toBe(200);
    expect(result.headers?.['Content-Type']).toBe('application/json');
    
    const responseBody = JSON.parse(result.body);
    expect(responseBody).toEqual(mockBooks);
    expect(responseBody.length).toBe(2);

    expect(mockSend).toHaveBeenCalledTimes(1);
  });

  it('should return empty array when no books exist', async () => {
    mockSend.mockResolvedValueOnce({ Items: [] });

    const event = createMockEvent();
    const result = await handler(event);

    expect(result.statusCode).toBe(200);
    expect(result.headers?.['Content-Type']).toBe('application/json');
    
    const responseBody = JSON.parse(result.body);
    expect(responseBody).toEqual([]);

    expect(mockSend).toHaveBeenCalledTimes(1);
  });

  it('should handle undefined Items from DynamoDB', async () => {
    mockSend.mockResolvedValueOnce({ Items: undefined });

    const event = createMockEvent();
    const result = await handler(event);

    expect(result.statusCode).toBe(200);
    expect(result.headers?.['Content-Type']).toBe('application/json');
    
    const responseBody = JSON.parse(result.body);
    expect(responseBody).toEqual([]);

    expect(mockSend).toHaveBeenCalledTimes(1);
  });

  it('should return 500 when DynamoDB operation fails', async () => {
    mockSend.mockRejectedValueOnce(new Error('DynamoDB scan error'));

    const event = createMockEvent();
    const result = await handler(event);

    expect(result.statusCode).toBe(500);
    const responseBody = JSON.parse(result.body);
    expect(responseBody.error).toBe('Could not get books');
    expect(responseBody.details).toBe('DynamoDB scan error');

    expect(mockSend).toHaveBeenCalledTimes(1);
  });

  it('should handle unknown errors', async () => {
    mockSend.mockRejectedValueOnce('Unknown error type');

    const event = createMockEvent();
    const result = await handler(event);

    expect(result.statusCode).toBe(500);
    const responseBody = JSON.parse(result.body);
    expect(responseBody.error).toBe('Could not get books');
    expect(responseBody.details).toBe('Unknown error');

    expect(mockSend).toHaveBeenCalledTimes(1);
  });
});
