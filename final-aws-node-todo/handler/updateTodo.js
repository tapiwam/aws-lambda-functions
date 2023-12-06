const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");
const {
    DynamoDBDocumentClient,
    GetCommand,
    PutCommand,
  } = require("@aws-sdk/lib-dynamodb");

const TODO_TABLE = process.env.TODO_TABLE;
const dynamoDb = new DynamoDBClient();
const dynamoDbClient = DynamoDBDocumentClient.from(dynamoDb);

module.exports.updateTodo =  (event, context, callback) => {

    const timestamp = new Date().getTime();

    const data = JSON.parse(event.body);

    // Get path param id
    const id = event.pathParameters.id;

    const errors = [];

    if(typeof data.todo !== "string") {
        console.log("Validation Failed for todo.");
        errors.push("todo");
    }

    // if id is blank then add to errors
    if(typeof id !== "string") {
        console.log("Validation Failed for id.");
        errors.push("id");
    }

    if(errors.length > 0) {
        const response = {
            statusCode: 400,
            body: JSON.stringify(errors),
            isBase64Encoded: false,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json"
            }
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

    dynamoDbClient.send(command, (error, item) => {
        if(error) {
            console.error('Failed to get existing item from DB. Cannot update record: ' + JSON.stringify(error));
            
            response = {
                statusCode: 500,
                body: JSON.stringify(error),
                cors: true
            };

            callback(new Error(error), response);

            return;
        }

        console.log("Found todo item in DB - Updating in DB: " + JSON.stringify(item));

        // Copy todo and checked from data into item
        const update = {
            todo: data.todo,
            checked: data.checked,
            updatedAt: timestamp
        };

        dbItem = item.Item;
        dbItem = { ...dbItem,  ...update};

        const params = {
            TableName: TODO_TABLE,
            Item: dbItem
        };

        console.log("Updating todo item: " + JSON.stringify(dbItem));

        const command = new PutCommand(params);

        dynamoDbClient.send(command, (error1, data1) => {
            if(error) {
                console.error('Failed to update todo item in DB: ' + JSON.stringify(error1));
                callback(new Error(error1));
                return;
            }

            console.log("Done updating todo item in DB: " + JSON.stringify(data1));

            const response = data1["$metadata"]["httpStatusCode"] == 200
                ? {
                    statusCode: 200,
                    body: JSON.stringify({
                        message: "Successfully updated todo item in DB",
                        data: dbItem
                    })
                }
                : {
                    statusCode: 500,
                    body: JSON.stringify({
                        message: "Failed to update todo item in DB",
                        error: error1
                    })
                };
            
            console.log("Response: " + JSON.stringify(response));
            callback(null, response);
        });
 
    });

}