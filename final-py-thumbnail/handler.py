from datetime import datetime
import boto3
from io import BytesIO
from PIL import Image, ImageOps
import os
import uuid
import json

# Get S3 client
s3 = boto3.client('s3')
# Get thumbnail size from environment variable
size = int(os.environ['THUMBNAIL_SIZE'])

def s3_thumbnail_generator(event, context):

    # Parse event
    print("EVENT:::", event)

    bucket = event['Records'][0]['s3']['bucket']['name']
    key = event['Records'][0]['s3']['object']['key']
    img_size = event['Records'][0]['s3']['object']['size']

    if(not key.endswith("_thumbnail.png")):
        # Get image from S3
        image = get_s3_image(bucket, key)

        # Get thumbnail
        thumbnail = image_to_thumbnail(image)

        thumbnail_key = new_filename(key)

        url = upload_to_s3(thumbnail, bucket, thumbnail_key, img_size)

        body = {
            "message": "Go Serverless v3.0! Your function executed successfully!",
            "input": event,
            "url": url
        }

        return {"statusCode": 200, "body": json.dumps(body)}

    # Get image from S3
    response = s3.get_object(Bucket=bucket, Key=key)
    image = Image.open(BytesIO(response['Body'].read()))

    # Get thumbnail

    body = {
        "message": "Go Serverless v3.0! Your function executed successfully!",
        "input": event,
    }

    return {"statusCode": 200, "body": json.dumps(body)}

def get_s3_image(bucket, key):
    response = s3.get_object(Bucket=bucket, Key=key)
    image = Image.open(BytesIO(response['Body'].read()))
    return image

def image_to_thumbnail(image):
    thumbnail = ImageOps.fit(image, (size, size), Image.Resampling.LANCZOS)
    return thumbnail

def new_filename(key):
    key_split = key.rsplit('.', 1)
    key1 = key_split[0]
    return key1 + "_thumbnail.png"

def upload_to_s3(image, bucket, key, image_size):
    out_thumnail = BytesIO()
    image.save(out_thumnail, format='PNG')
    out_thumnail.seek(0)


    # resp = s3.put_object(Body=out_thumnail, Bucket=bucket, Key=key, ContentType='image/png', ACL='public-read')
    resp = s3.put_object(Body=out_thumnail, Bucket=bucket, Key=key, ContentType='image/png')
    print(resp)

    url = '{}/{}/{}'.format(s3.meta.endpoint_url, bucket, key)

    # url = s3.generate_presigned_url('get_object', Params={'Bucket': bucket, 'Key': key})
    return url