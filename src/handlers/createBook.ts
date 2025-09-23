import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { Book } from '../types/book';
import { dynamoDb, TABLE_NAME } from '../utils/dynamodb';
import { PutCommand } from '@aws-sdk/lib-dynamodb';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Event received:', JSON.stringify(event, null, 2));
  
  try {
    // Parse request body
    const body = JSON.parse(event.body || '{}');
    console.log('Parsed body:', body);
    
    // Basic validation
    if (!body.title || !body.author) {
      return {
        statusCode: 400,
        headers: { 
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Title and author are required' }),
      };
    }
    
    const book: Book = {
      id: uuidv4(),
      title: body.title,
      author: body.author,
      createdAt: new Date().toISOString(),
    };

    console.log('Creating book:', book);
    console.log('Table name:', TABLE_NAME);

    await dynamoDb.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: book,
    }));

    console.log('Book created successfully');

    return {
      statusCode: 201,
      headers: { 
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(book),
    };
  } catch (error) {
    console.error('Error creating book:', error);
    return {
      statusCode: 500,
      headers: { 
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Could not create book', details: error instanceof Error ? error.message : 'Unknown error' }),
    };
  }
};
