# 🌐 Org Directory Website

Front-end code and resources for the Org Directory platform.

It is built with [Gatsby](https://www.gatsbyjs.com/), hosted in a [S3 bucket with CloudFront](https://aws.amazon.com/blogs/networking-and-content-delivery/amazon-s3-amazon-cloudfront-a-match-made-in-the-cloud/).

### 💡 Technical details

The site is built in the TypeScript language with the React framework. We use Gatsby to bundle this into a static site that loads quickly and supports a wide range of browsers.

For the org directory platform, the site communicates with [the server](../server) using Axios.

Generally we put the clever bits in the `components` and `helpers` folder. These are reused across the site, with the most obvious example of this being the templatised organization homepages.

The pages themselves are stored in the `pages` folder, which correspond to paths off the root of the site, apart from the `admin` subfolder which uses Reach Router given its use of path parameters. This `admin` folder is the internal-facing management system for the org directory platform.

The `env` folder holds configuration for deploying the site to different environments, most relevant to org directory platform stuff.
