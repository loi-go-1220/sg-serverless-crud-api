import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { dynamoDb, TABLE_NAME } from '../utils/dynamodb';
import { GetCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('DeleteBook handler called:', JSON.stringify(event, null, 2));
  
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

    console.log(`Deleting book with ID: ${id}`);

    // First check if book exists
    const getResult = await dynamoDb.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { id },
    }));

    if (!getResult.Item) {
      return {
        statusCode: 404,
        headers: { 
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Book not found' }),
      };
    }

    // Delete the book
    await dynamoDb.send(new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { id },
    }));

    console.log('Book deleted successfully');

    return {
      statusCode: 204,
      headers: { 
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: '',
    };
  } catch (error) {
    console.error('Error deleting book:', error);
    return {
      statusCode: 500,
      headers: { 
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        error: 'Could not delete book', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }),
    };
  }
};
