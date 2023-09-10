import { ulid } from 'ulid';
import { fixedGroups } from '@odir/shared';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { middyfy } from '../../../helpers/wrapper';
import { assertHasGroup } from '../../../helpers/db';
import { $BlobCreation, $Url } from '../../../schemas';
import env from '../../../env/env';

const s3Client = env.STAGE === 'local'
  ? new S3Client({
    region: 'localhost',
    endpoint: 'http://0.0.0.0:8007',
    credentials: {
      accessKeyId: 'S3RVER',
      secretAccessKey: 'S3RVER'
    },
  })
  : new S3Client();

const BUCKET_NAME = `odir-server-${env.STAGE}`;
const BUCKET_BASE_URL = env.STAGE === 'local'
  ? `http://localhost:8007/${BUCKET_NAME}`
  : `https://${BUCKET_NAME}.s3.eu-west-1.amazonaws.com`;

export const main = middyfy($BlobCreation, $Url, true, async (event) => {
  assertHasGroup(event, fixedGroups.Admin);

  const id = ulid();
  const [, dataBase64] = event.body.data.split(',');
  const [dataPrefix] = event.body.data.split(';');
  const contentType = dataPrefix.slice('data:'.length);

  await s3Client.send(new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: id,
    Body: Buffer.from(dataBase64, 'base64'),
    ContentType: contentType,
  }));

  return `${BUCKET_BASE_URL}/${id}`;
});
