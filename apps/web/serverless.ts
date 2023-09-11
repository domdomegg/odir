import type { AWS } from '@serverless/typescript';
import env from './src/env/env';

const ODIR_SERVICE_NAME = 'odir-website';
const ODIR_S3_BUCKET_NAME = `${ODIR_SERVICE_NAME}-${env.STAGE}`;

const serverlessConfiguration: AWS = {
  service: ODIR_SERVICE_NAME,
  frameworkVersion: '3',
  custom: {
    s3Sync: [
      {
        bucketName: ODIR_S3_BUCKET_NAME,
        localDir: './dist',
        params: [
          // https://www.gatsbyjs.com/docs/caching/
          { '**/*.html': { CacheControl: 'public, max-age=0, must-revalidate' } },
          { '**/page-data.json': { CacheControl: 'public, max-age=0, must-revalidate' } },
          { 'page-data/app-data.json': { CacheControl: 'public, max-age=0, must-revalidate' } },
          { 'chunk-map.json': { CacheControl: 'public, max-age=0, must-revalidate' } },
          { 'webpack.stats.json': { CacheControl: 'public, max-age=0, must-revalidate' } },
          { 'static/**': { CacheControl: 'public, max-age=31536000, immutable' } },
          { '**/*.js': { CacheControl: 'public, max-age=31536000, immutable' } },
          { '**/*.css': { CacheControl: 'public, max-age=31536000, immutable' } },
        ],
      },
    ],
  },
  plugins: [
    'serverless-s3-sync',
  ],
  provider: {
    name: 'aws',
    runtime: 'nodejs16.x',
    region: 'eu-west-1',
    stage: env.STAGE,
  },
  resources: {
    Resources: {
      OdirWebsiteBucket: {
        Type: 'AWS::S3::Bucket',
        Properties: {
          BucketName: ODIR_S3_BUCKET_NAME,
          WebsiteConfiguration: {
            IndexDocument: 'index.html',
            ErrorDocument: 'index.html',
          },
        },
      },
      OdirWebsiteBucketPolicy: {
        Type: 'AWS::S3::BucketPolicy',
        Properties: {
          Bucket: {
            Ref: 'OdirWebsiteBucket',
          },
          PolicyDocument: {
            Statement: [
              {
                Action: [
                  's3:GetObject',
                ],
                Effect: 'Allow',
                Principal: '*',
                Resource: { 'Fn::Join': ['', [{ 'Fn::GetAtt': ['OdirWebsiteBucket', 'Arn'] }, '/*']] },
                Condition: {
                  StringEquals: {
                    // eslint-disable-next-line no-template-curly-in-string
                    'AWS:SourceArn': { 'Fn::Sub': 'arn:aws:cloudfront::${AWS::AccountId}:distribution/${OdirCDN}' }
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
                Resource: { 'Fn::GetAtt': ['OdirWebsiteBucket', 'Arn'] },
                Condition: {
                  StringEquals: {
                    // eslint-disable-next-line no-template-curly-in-string
                    'AWS:SourceArn': { 'Fn::Sub': 'arn:aws:cloudfront::${AWS::AccountId}:distribution/${OdirCDN}' }
                  }
                }
              },
            ],
            Version: '2012-10-17',
          },
        },
      },
      OdirCDN: {
        Type: 'AWS::CloudFront::Distribution',
        Properties: {
          DistributionConfig: {
            Aliases: [env.CUSTOM_ODIR_DOMAIN],
            Comment: `${ODIR_SERVICE_NAME}-${env.STAGE}`,
            DefaultCacheBehavior: {
              AllowedMethods: ['GET', 'HEAD'],
              CachedMethods: ['GET', 'HEAD'],
              CachePolicyId: '658327ea-f89d-4fab-a63d-7e88639e58f6', // Managed-CachingOptimized
              Compress: true,
              // eslint-disable-next-line no-template-curly-in-string
              TargetOriginId: { 'Fn::Sub': 'S3-origin-${OdirWebsiteBucket}' },
              ViewerProtocolPolicy: 'redirect-to-https',
            },
            DefaultRootObject: 'index.html',
            Enabled: true,
            HttpVersion: 'http2',
            IPV6Enabled: true,
            Origins: [{
              DomainName: { 'Fn::GetAtt': ['OdirWebsiteBucket', 'DomainName'] },
              // eslint-disable-next-line no-template-curly-in-string
              Id: { 'Fn::Sub': 'S3-origin-${OdirWebsiteBucket}' },
              OriginAccessControlId: { Ref: 'OriginAccessControl' },
              S3OriginConfig: {}
            }],
            // Redirect 404s and 403s to the Gatsby index page. This will handle appropriately displaying the right page.
            CustomErrorResponses: [{
              ErrorCode: 404,
              // Almost all pages are not server-side rendered, so we will not exist in the bucket - resulting in a 404
              // Redirecting back to index.html means Gatsby routing will take over and the correct page will be displayed
              // (effectively we're (ab)using Gatsby as a SPA framework)
              ResponseCode: 200,
              ResponsePagePath: '/index.html',
            }],
            PriceClass: 'PriceClass_100',
            ViewerCertificate: {
              AcmCertificateArn: 'arn:aws:acm:us-east-1:338337944728:certificate/56922203-03c3-41c7-a57e-0811d5aef1b6',
              MinimumProtocolVersion: 'TLSv1.2_2021',
              SslSupportMethod: 'sni-only',
            },
          },
        },
      },
      OriginAccessControl: {
        Type: 'AWS::CloudFront::OriginAccessControl',
        Properties: {
          OriginAccessControlConfig: {
            // eslint-disable-next-line no-template-curly-in-string
            Name: { 'Fn::Sub': 'oac-${OdirWebsiteBucket}' },
            OriginAccessControlOriginType: 's3',
            SigningBehavior: 'always',
            SigningProtocol: 'sigv4',
          }
        }
      }
    },
    Outputs: {
      WebsiteURL: {
        Value: { 'Fn::Join': ['', ['https://', { 'Fn::GetAtt': ['OdirCDN', 'DomainName'] }]] },
        Description: 'CloudFront URL for the website',
      },
    },
  },
};

module.exports = serverlessConfiguration;
