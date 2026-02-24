import { DynamoDBDocumentClient, PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import bcrypt from "bcryptjs";

export default class UserAuth {
  constructor(docClient) {
    this.docClient = docClient;
    this.tableName = "users";
  }

  async registerUser(username, password) {
    const hashed = await bcrypt.hash(password, 10);
    const params = {
      TableName: this.tableName,
      Item: { username, password: hashed }
    };
    await this.docClient.send(new PutCommand(params));
    return true;
  }

  async authenticateUser(username, password) {
    const params = {
      TableName: this.tableName,
      Key: { username }
    };
    const data = await this.docClient.send(new GetCommand(params));
    if (!data.Item) return false;
    const valid = await bcrypt.compare(password, data.Item.password);
    return valid;
  }
}
