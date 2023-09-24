/* eslint-disable guard-for-in,no-restricted-syntax */
import type { AWS } from '@serverless/typescript';
import { execSync } from 'child_process';
import env from './src/env/env';
import { Table, tables } from './src/helpers/tables';
import { getFunctionEvent, getFunctionPaths, pascalCase } from './local/helpers';

const SERVICE_NAME = 'odir-server';
const S3_BUCKET_NAME = `${SERVICE_NAME}-${env.STAGE}`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createResources = (definitions: Record<string, Table<any, any, any>>): NonNullable<NonNullable<AWS['resources']>['Resources']> => Object.values(definitions).reduce<NonNullable<NonNullable<AWS['resources']>['Resources']>>((acc, table) => {
  const resourceKey = `${pascalCase(table.entityName)}Table`;
  if (acc[resourceKey] !== undefined) throw new Error(`Duplicate table resource key ${resourceKey}`);
  acc[resourceKey] = {
    Type: 'AWS::DynamoDB::Table',
    DeletionPolicy: env.STAGE === 'prod' ? 'Retain' : 'Delete',
    Properties: {
      AttributeDefinitions: [{
        AttributeName: table.partitionKey,
        AttributeType: 'S', // String
      }, ...(table.primaryKey !== table.partitionKey ? [{
        AttributeName: table.primaryKey,
        AttributeType: 'S', // String
      }] : [])],
      KeySchema: [{
        AttributeName: table.partitionKey,
        KeyType: 'HASH',
      }, ...(table.primaryKey !== table.partitionKey ? [{
        AttributeName: table.primaryKey,
        KeyType: 'RANGE',
      }] : [])],
      BillingMode: 'PAY_PER_REQUEST',
      PointInTimeRecoverySpecification: {
        PointInTimeRecoveryEnabled: env.STAGE === 'prod',
      },
      TableName: table.name,
      ...((table.schema as { properties?: { ttl?: unknown } }).properties?.ttl ? {
        TimeToLiveSpecification: {
          AttributeName: 'ttl',
          Enabled: true,
        },
      } : {}),
    },
  };

  return acc;
}, {});

const tableResources = createResources(tables);

const getVersion = (): string => {
  const hash = execSync('git rev-parse --short HEAD', { encoding: 'utf-8' });
  return `${(new Date()).toISOString().replace(/-/g, '').replace(/\..*/, '')
    .replace(/:/g, '')
    .replace('T', '.')}.${hash.trim()}`;
};

const serverlessConfiguration: AWS = {
  service: SERVICE_NAME,
  frameworkVersion: '3',
  custom: {
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: {
        forceExclude: [
          // When the aws-sdk v3 is included in the lambda environment, we should exclude all of it
          '@aws-sdk/types',
          'mockdate',
        ],
      },
      // Exclude envs for security reasons, ensures we never deploy prod config to dev environment etc.
      excludeFiles: [
        'src/env/local.ts',
        'src/env/dev.ts',
        'src/env/prod.ts',
        'src/**/*.test.ts',
      ],
      packagerOptions: {
        scripts: [
          // Remove unused code that the bundler misses
          'find node_modules/ -name "*.d.ts" -type f -delete',
          'find node_modules/ -name "*.md" ! -name "LICENSE.md" -type f -delete',
        ],
      },
    },
    'serverless-offline': {
      httpPort: 8001,
      websocketPort: 8002,
      lambdaPort: 8003,
      reloadHandler: true,
    },
    dynamodb: { // serverless-dynamodb
      stages: [env.STAGE], // https://github.com/99x/serverless-dynamodb-local/issues/225
      start: {
        port: 8004,
        migrate: true,
        seed: true,
      },
      seed: {
        sample: {
          sources: [{
            table: tables.auditLog.name,
            sources: ['./local/table_auditLog.json'],
          }, {
            table: tables.group.name,
            sources: ['./local/table_group.json'],
          }, {
            table: tables.domain.name,
            sources: ['./local/table_domain.json'],
          }, {
            table: tables.user.name,
            sources: ['./local/table_user.json'],
          }, {
            table: tables.person.name,
            sources: ['./local/table_person.json'],
          }, {
            table: tables.team.name,
            sources: ['./local/table_team.json'],
          }, {
            table: tables.relation.name,
            sources: ['./local/table_relation.json'],
          }, {
            table: tables.slug.name,
            sources: ['./local/table_slug.json'],
          }],
        },
      },
    },
    s3: { // serverless-s3-local
      port: 8007,
      address: '0.0.0.0',
      directory: './.s3'
    },
    'serverless-offline-ses-v2': {
      port: 8006,
    },
    'serverless-offline-watcher': [{
      path: 'src/schemas/jsonSchema.ts',
      command: 'npm run generate:schemas',
    }],
  },
  plugins: [
    'serverless-webpack',
    'serverless-dynamodb',
    'serverless-offline',
    'serverless-offline-ses-v2',
    'serverless-offline-watcher',
    'serverless-s3-local',
  ],
  provider: {
    name: 'aws',
    runtime: 'nodejs18.x',
    region: 'eu-west-1',
    stage: env.STAGE,
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    httpApi: {
      payload: '2.0',
      cors: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      STAGE: env.STAGE,
      VERSION: getVersion(),
    },
    memorySize: 256,
    timeout: 10,
    iam: {
      role: {
        statements: [
          ...Object.keys(tableResources).map((cloudformationName) => ({
            Effect: 'Allow',
            Action: 'dynamodb:*',
            Resource: {
              'Fn::GetAtt': [cloudformationName, 'Arn'],
            },
          })),
          {
            Effect: 'Allow',
            Action: [
              'ses:SendEmail',
            ],
            Resource: '*',
          },
          {
            Effect: 'Allow',
            Action: [
              's3:GetObject',
              's3:PutObject',
              's3:ListBucket',
              's3:DeleteObject'
            ],
            Resource: [
              `arn:aws:s3:::${S3_BUCKET_NAME}`,
              `arn:aws:s3:::${S3_BUCKET_NAME}/*`
            ]
          }
        ],
      },
    },
  },
  functions: {
    apiRouter: {
      handler: 'src/api/_router.main',
      events: getFunctionPaths().map(getFunctionEvent),
      // provisionedConcurrency: env.STAGE === 'prod' ? 1 : 0,
    },
    schedulerDoScheduledThingRun: {
      handler: 'src/scheduler/do-scheduled-thing/run.main',
      events: [
        {
          schedule: env.STAGE === 'local'
            ? 'rate(1 minute)' // Every minute
            : 'cron(0 0 1 1 ? *)', // Every year
        },
      ],
    },
  },
  resources: {
    Resources: {
      // Using multiple DynamoDB tables as a conscious choice for maintainability.
      // The docs promote a single-table design - for max perf/min costs this may
      // be the case, however for us database access time and DynamoDB costs are
      // not limiting factors. Instead, simplicity and maintainability are so a
      // multiple table design makes sense. As we're using on-demand mode billing
      // (as opposed to provisioned capacity) the costs aren't much higher.
      ...tableResources,

      // The types appear a bit broken here, hence the weird spreading / casting
      ...{
        BlobBucket: {
          Type: 'AWS::S3::Bucket',
          Properties: {
            BucketName: S3_BUCKET_NAME
          }
        },
        BlobBucketPolicy: {
          Type: 'AWS::S3::BucketPolicy',
          Properties: {
            Bucket: {
              Ref: 'BlobBucket',
            },
            PolicyDocument: {
              Statement: [
                {
                  Action: [
                    's3:GetObject',
                  ],
                  Effect: 'Allow',
                  Principal: '*',
                  Resource: { 'Fn::Join': ['', [{ 'Fn::GetAtt': ['BlobBucket', 'Arn'] }, '/*']] },
                  Condition: {
                    StringEquals: {
                      // eslint-disable-next-line no-template-curly-in-string
                      'AWS:SourceArn': { 'Fn::Sub': 'arn:aws:cloudfront::${AWS::AccountId}:distribution/${BlobCDN}' }
                    }
                  }
                },
                // Give CloudFront permission to list objects
                // Without this we get 403s when a file doesn't exist in the bucket, to avoid leaking info about whether the file does or doesn't exist
                {
                  Action: [
                    's3:ListBucket',
                  ],
                  Effect: 'Allow',
                  Principal: '*',
                  Resource: { 'Fn::GetAtt': ['BlobBucket', 'Arn'] },
                  Condition: {
                    StringEquals: {
                      // eslint-disable-next-line no-template-curly-in-string
                      'AWS:SourceArn': { 'Fn::Sub': 'arn:aws:cloudfront::${AWS::AccountId}:distribution/${BlobCDN}' }
                    }
                  }
                },
              ],
              Version: '2012-10-17',
            },
          },
        },
        BlobCDN: {
          Type: 'AWS::CloudFront::Distribution',
          Properties: {
            DistributionConfig: {
              Comment: `${SERVICE_NAME}-${env.STAGE}`,
              DefaultCacheBehavior: {
                AllowedMethods: ['GET', 'HEAD'],
                CachedMethods: ['GET', 'HEAD'],
                CachePolicyId: '658327ea-f89d-4fab-a63d-7e88639e58f6', // Managed-CachingOptimized
                Compress: true,
                // eslint-disable-next-line no-template-curly-in-string
                TargetOriginId: { 'Fn::Sub': 'S3-origin-${BlobBucket}' },
                ViewerProtocolPolicy: 'redirect-to-https',
              },
              DefaultRootObject: 'index.html',
              Enabled: true,
              HttpVersion: 'http2',
              IPV6Enabled: true,
              Origins: [{
                DomainName: { 'Fn::GetAtt': ['BlobBucket', 'DomainName'] },
                // eslint-disable-next-line no-template-curly-in-string
                Id: { 'Fn::Sub': 'S3-origin-${BlobBucket}' },
                OriginAccessControlId: { Ref: 'OriginAccessControl' },
                S3OriginConfig: {}
              }],
              PriceClass: 'PriceClass_100',
            },
          },
        },
        OriginAccessControl: {
          Type: 'AWS::CloudFront::OriginAccessControl',
          Properties: {
            OriginAccessControlConfig: {
              // eslint-disable-next-line no-template-curly-in-string
              Name: { 'Fn::Sub': 'oac-${BlobBucket}' },
              OriginAccessControlOriginType: 's3',
              SigningBehavior: 'always',
              SigningProtocol: 'sigv4',
            }
          }
        }
      } as NonNullable<NonNullable<AWS['resources']>['Resources']>,
    },
  },
};

module.exports = serverlessConfiguration;
