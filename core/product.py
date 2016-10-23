import json
import boto3
import yaml

with open('../config/config.yml', 'r') as f:
    config = yaml.load(f)

dynamodb_client = boto3.client('dynamodb')
table_name = config["prefix"] + '-product'

def hello(event, context):
    body = {
        "message": "Go Serverless v1.0! Your function executed successfully!",
        "input": event
    }

    response = {
        "statusCode": 200,
        "body": json.dumps(body)
    };

    return response

    # Use this code if you don't use the http event with the LAMBDA-PROXY integration
    """
    return {
        "message": "Go Serverless v1.0! Your function executed successfully!",
        "event": event
    }
    """
    
def add(event, context):
    body = {
        "message": "Product added"
    }
    
    item = {'productID': {'S': '123'},'name': {'S': 'Product Name'},'price': {'N': '10.23'},'description': {'S': 'Product description'}}
    dynamodb_client.put_item(TableName=table_name, Item=item)
    
    response = {
        "statusCode": 200,
        "body": json.dumps(body)
    };
    
    return response