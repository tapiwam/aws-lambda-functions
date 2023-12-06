const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
    DynamoDBDocumentClient,
    ScanCommand,
  } = require("@aws-sdk/lib-dynamodb");

const TODO_TABLE = process.env.TODO_TABLE;
const dynamoDb = new DynamoDBClient();
const dynamoDbClient = DynamoDBDocumentClient.from(dynamoDb);


module.exports.listTodos =  (event, context, callback) => {


    const params = {
        TableName: TODO_TABLE
    }

    const command = new ScanCommand(params);

    dynamoDbClient.send(command, (error, data) => {
        if(error) {
            console.error('Failed to create todo item in DB: ' + JSON.stringify(error));
            callback(new Error(error));
            return;
        }
        const response = {
            statusCode: 200,
            body: JSON.stringify(data.Items)
        };
        callback(null, response);
    });


}