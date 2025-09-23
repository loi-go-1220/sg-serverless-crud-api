# AWS API Gateway CRUD REST API
## The Challenge


Build a Serverless Framework REST API with AWS API Gateway which supports CRUD functionality (Create, Read, Update, Delete) *don't use service proxy integration directly to DynamoDB from API Gateway
Please use GitHub Actions CI/CD pipeline, AWS CodePipeline, or Serverless Pro CI/CD to handle deployments.
You can take screenshots of the CI/CD setup and include them in the README.
The CI/CD should trigger a deployment based on a git push to the master branch which goes through and deploys the backend Serverless Framework REST API and any other resources e.g. DynamoDB Table(s).
### Requirements
0. All application code must be written using NodeJS, Typescript is acceptable as well
1. All AWS Infrastructure needs to be automated with IAC using [Serverless Framework](https://www.serverless.com/)
2. The API Gateway REST API should store data in DynamoDB
3. There should be 4-5 lambdas that include the following CRUD functionality (Create, Read, Update, Delete) *don't use service proxy integration directly to DynamoDB from API Gateway
4. Build the CI/CD pipeline to support multi-stage deployments e.g. dev, prod
5. The template should be fully working and documented
6. A public GitHub repository must be shared with frequent commits
7. A video should be recorded ([www.loom.com](http://www.loom.com/)) of you talking over the application code, IAC, and any additional areas you want to highlight in your solution to demonstrate add
Please spend only what you consider a reasonable amount of time for this.

## Optionally

[](https://github.com/serverless-guru/code-challenges/tree/master/code-challenge-5#optionally)

Please feel free to include any of the following to show additional experience:

1. Make the project fit a specific business case e.g. Coffee Shop APIs vs Notes CRUD directly from AWS docs
2. AWS Lambda packaging
3. Organization of YAML files
4. Bash/other scripts to support deployment
5. Unit tests, integration tests, etc