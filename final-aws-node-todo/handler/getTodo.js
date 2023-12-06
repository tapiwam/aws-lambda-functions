const { DynamoDBClient, GetItemCommand } = require("@aws-sdk/client-dynamodb");
const {
    DynamoDBDocumentClient,
    GetCommand,
    PutCommand,
  } = require("@aws-sdk/lib-dynamodb");

const TODO_TABLE = process.env.TODO_TABLE;
const dynamoDb = new DynamoDBClient();
const dynamoDbClient = DynamoDBDocumentClient.from(dynamoDb);

module.exports.getTodo =  (event, context, callback) => {

    const data = JSON.parse(event.body);

    // Get path param id
    const id = event.pathParameters.id;

    const errors = [];

    // if id is blank then add to errors
    if(typeof id !== "string") {
        console.log("Validation Failed for id.");
        errors.push("id");
    }

    if(errors.length > 0) {
        const response = {
            statusCode: 400,
            body: JSON.stringify(errors),
            cors: true
        };
        callback(null, response);
        return;
    }

    // get existing item from DB
    const params = {
        TableName: TODO_TABLE,
        Key: {
            id: id
        }
    };

    console.log("Fetching todo item from DB for id: " + JSON.stringify(params));
    const command = new GetCommand(params);

    dynamoDbClient.send(command, (error, data) => {
        if(error) {
            console.error('Failed to fetch todo item in DB: ' + JSON.stringify(error));

            response = {
                statusCode: 500,
                body: JSON.stringify(error),
                cors: true
            };

            callback(new Error(error), response);
            return;
        }

        console.log("Found todo item in DB: " + JSON.stringify(data));

        const response = data.Item 
        ? {
            statusCode: 200,
            isBase64Encoded: false,
            body: JSON.stringify(data.Item),
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json"
            }
        } : {
            statusCode: 404,
            isBase64Encoded: false,
            body: JSON.stringify({message: "Item not found."}),
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json"
            }
        };

        console.log("Final response: " + JSON.stringify(response));
        callback(null, response);
        return;
    });

}