const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");
const {
    DynamoDBDocumentClient,
    GetCommand,
    PutCommand,
  } = require("@aws-sdk/lib-dynamodb");

const TODO_TABLE = process.env.TODO_TABLE;
const dynamoDb = new DynamoDBClient();
const uuid = require('uuid');


const dynamoDbClient = DynamoDBDocumentClient.from(dynamoDb);


module.exports.createTodo =  (event, context, callback) => {

    const timestamp = new Date().getTime();

    const data = JSON.parse(event.body);

    if(typeof data.todo !== "string") {
        console.log("Validation Failed");
        return;
    }
    
    const params = {
        TableName: TODO_TABLE,
        Item: {
            // userId: event.requestContext.identity.cognitoIdentityId,
            id: uuid.v1(),
            createdAt: timestamp,
            updatedAt: timestamp,
            done: false,
            todo: data.todo
        }
    }

    const command = new PutCommand(params);

    dynamoDbClient.send(command, (error, data) => {
        if(error) {
            console.error('Failed to create todo item in DB: ' + JSON.stringify(error));
            callback(new Error(error));
            return;
        }

        console.log('Successfully created todo item in DB: ', JSON.stringify(data));

        // create a repose
        const response = {
            statusCode: 200,
            body: JSON.stringify(data.Item)
        }

        callback(null, response);
    });
}