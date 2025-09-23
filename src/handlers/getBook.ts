import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { Book } from '../types/book';
import { dynamoDb, TABLE_NAME } from '../utils/dynamodb';
import { GetCommand } from '@aws-sdk/lib-dynamodb';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('GetBook handler called:', JSON.stringify(event, null, 2));
  
  try {
    const id = event.pathParameters?.id;
    
    if (!id) {
      return {
        statusCode: 400,
        headers: { 
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Book ID is required' }),
      };
    }

    console.log(`Getting book with ID: ${id}`);

    const result = await dynamoDb.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { id },
    }));

    if (!result.Item) {
      return {
        statusCode: 404,
        headers: { 
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Book not found' }),
      };
    }

    const book: Book = result.Item as Book;
    
    console.log('Book found:', book);

    return {
      statusCode: 200,
      headers: { 
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(book),
    };
  } catch (error) {
    console.error('Error getting book:', error);
    return {
      statusCode: 500,
      headers: { 
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        error: 'Could not get book', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }),
    };
  }
};
