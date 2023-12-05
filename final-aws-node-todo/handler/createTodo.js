const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
// const serverless = require("serverless-http");

const TODO_TABLE = process.env.TODO_TABLE;
const client = new DynamoDBClient();


module.exports.createTodo = async (event, context) => {
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'Hello!',
            input: event,
        }),
    }
}