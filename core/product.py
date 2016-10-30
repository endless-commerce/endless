import json
import boto3
import decimal

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('dev-demostore-product')

# LoadData Function
def load(event, context):
    body = {
        "message": "ok load"
    }

    with open("core/moviedata.json") as json_file:
        movies = json.load(json_file, parse_float = decimal.Decimal)
        for movie in movies:
            year = int(movie['year'])
            title = movie['title']
            info = movie['info']
        
            table.put_item(
               Item={
                   'year': year,
                   'productID': title,
                   'info': info,
                }
            )

    response = {
        "statusCode": 200,
        "body": json.dumps(body)
    };

    return response


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