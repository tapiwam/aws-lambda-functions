const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");
const {
    DynamoDBDocumentClient,
    DeleteCommand,
  } = require("@aws-sdk/lib-dynamodb");

const TODO_TABLE = process.env.TODO_TABLE;
const dynamoDb = new DynamoDBClient();
const dynamoDbClient = DynamoDBDocumentClient.from(dynamoDb);


module.exports.deleteTodo =  (event, context, callback) => {

        // Get path param id
        const id = event.pathParameters.id;

        const params = {
            TableName: TODO_TABLE,
            Key: {
                id: id
            }
        };

    console.log("Deleting todo item from DB for id: " + JSON.stringify(params));
    const command = new DeleteCommand(params);

    dynamoDbClient.send(command, (error, data1) => {
        if(error) {
            console.error('Failed to delete todo item from DB. ' + JSON.stringify(error));
            
            response = {
                statusCode: 500,
                body: JSON.stringify(error),
                cors: true
            };

            callback(new Error(error), response);

            return;
        }

        const response = data1["$metadata"]["httpStatusCode"] == 200
                ? {
                    statusCode: 200,
                    body: JSON.stringify({
                        message: "Successfully deleted todo item in DB",
                        id: id
                    })
                }
                : {
                    statusCode: 500,
                    body: JSON.stringify({
                        message: "Failed to deleted todo item in DB",
                        id: id
                    })
                };

        callback(null, response);
    });


}