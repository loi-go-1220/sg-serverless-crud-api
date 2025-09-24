import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { Book } from '../types/book';
import { dynamoDb, TABLE_NAME } from '../utils/dynamodb';
import { GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('UpdateBook handler called:', JSON.stringify(event, null, 2));
  
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

    if (!event.body) {
      return {
        statusCode: 400,
        headers: { 
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Request body is required' }),
      };
    }

    let updateData;
    try {
      updateData = JSON.parse(event.body);
    } catch (parseError) {
      return {
        statusCode: 400,
        headers: { 
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Invalid JSON in request body' }),
      };
    }

    // Basic validation - at least one field should be provided
    const { title, author } = updateData;
    if (!title && !author) {
      return {
        statusCode: 400,
        headers: { 
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'At least one field (title or author) must be provided' }),
      };
    }

    console.log(`Updating book with ID: ${id}`, updateData);

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

    // Build update expression
    const updateExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};
    
    if (title) {
      updateExpressions.push('#title = :title');
      expressionAttributeNames['#title'] = 'title';
      expressionAttributeValues[':title'] = title;
    }
    
    if (author) {
      updateExpressions.push('#author = :author');
      expressionAttributeNames['#author'] = 'author';
      expressionAttributeValues[':author'] = author;
    }

    // Always update the updatedAt timestamp
    updateExpressions.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();

    const updateResult = await dynamoDb.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { id },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    }));

    const updatedBook: Book = updateResult.Attributes as Book;
    
    console.log('Book updated successfully:', updatedBook);

    return {
      statusCode: 200,
      headers: { 
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedBook),
    };
  } catch (error) {
    console.error('Error updating book:', error);
    return {
      statusCode: 500,
      headers: { 
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        error: 'Could not update book', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }),
    };
  }
};
