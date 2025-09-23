import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { Book } from '../types/book';
import { dynamoDb, TABLE_NAME } from '../utils/dynamodb';
import { ScanCommand } from '@aws-sdk/lib-dynamodb';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('GetBooks handler called:', JSON.stringify(event, null, 2));
  
  try {
    const result = await dynamoDb.send(new ScanCommand({
      TableName: TABLE_NAME,
    }));

    const books: Book[] = result.Items as Book[] || [];
    
    console.log(`Found ${books.length} books`);

    return {
      statusCode: 200,
      headers: { 
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(books),
    };
  } catch (error) {
    console.error('Error getting books:', error);
    return {
      statusCode: 500,
      headers: { 
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        error: 'Could not get books', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }),
    };
  }
};
