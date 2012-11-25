var ide = require( 'crosstalk-ide' )(),
    config = {},
    workerPath = require.resolve( 'crosstalk-worker-api-aws-signature-version2' );

var worker;

worker = ide.run( workerPath, { config : config } );

var validRequestSignature = {
  awsAccessKeyId : "KEYNAME",
  host : "ec2.amazonaws.com",
  queryString : "Action=DescribeImages&ImageId.1=ami-2bb65342" + 
     "&Version=2012-10-01&Expires=2008-02-10T12%3A00%3A00Z" + 
     "&AWSAccessKeyId=KEYNAME",
  secretAccessKey : "wJalrXUtnFEMI/K7MDENG+bPxRfiCYEXAMPLEKEY"
};

worker.send( 'api.aws.signature.version2', validRequestSignature );