/*
 * index.js : Crosstalk AWS version 2 signature generator
 *
 * (C) 2012 Crosstalk Systems Inc.
 */
"use strict";

var crypto = require( 'crypto' );

var DEFAULT_HTTP_REQUEST_URI = "/",
    DEFAULT_HTTP_VERB = "GET",
    SIGNATURE_METHOD = "HmacSHA256",
    SIGNATURE_VERSION = 2;

var createCanonicalQueryString = function createCanonicalQueryString ( queryString ) {

  queryString += "&SignatureMethod=" + SIGNATURE_METHOD;
  queryString += "&SignatureVersion=" + SIGNATURE_VERSION;

  queryString = queryString.split( '&' );
  queryString.sort();

  var canonicalQueryString = "";

  queryString.forEach( function ( pair ) {

    canonicalQueryString += "&";

    pair = pair.split( "=" );

    if ( ! pair || pair.length != 2 ) {
      return new Error( "invalid queryString format" );
    }

    // decode first just in case we have encoded component already
    canonicalQueryString += encodeURIComponent( decodeURIComponent( pair[ 0 ] ) );
    canonicalQueryString += "=";
    canonicalQueryString += encodeURIComponent( decodeURIComponent( pair[ 1 ] ) );

  }); // queryString.forEach

  // remove the first "&" we put
  canonicalQueryString = canonicalQueryString.slice( 1 );

  return canonicalQueryString;

}; // createCanonicalQueryString

var createStringToSign = function createStringToSign ( httpVerb, host, 
   httpRequestUri, canonicalQueryString ) {

  return httpVerb.toUpperCase() + "\n"
     + host.toLowerCase() + "\n"
     + httpRequestUri + "\n"
     + canonicalQueryString;

}; // createStringToSign

var hmac = function hmac( key, stringToSign, format ) {

  return crypto.createHmac( 'sha256', key ).update( stringToSign )
    .digest( format );

}; // hmac

var version2 = function version2 ( params, callback ) {

  if ( ! callback ) { return; } // nothing to do

  //
  // required params
  //
  var awsAccessKeyId = params.awsAccessKeyId,
      host = params.host,
      queryString = params.queryString,
      secretAccessKey = params.secretAccessKey;

  if ( ! awsAccessKeyId ) return callback( { message : "missing awsAccessKeyId" } );
  if ( ! host ) return callback( { message : "missing host" } );
  if ( ! queryString ) return callback( { message : "missing queryString" } );
  if ( ! secretAccessKey ) return callback( { message : "missing secretAccessKey" } );

  //
  // optional params
  //
  var httpRequestUri = params.httpRequestUri || DEFAULT_HTTP_REQUEST_URI,
      httpVerb = params.httpVerb || DEFAULT_HTTP_VERB;

  var canonicalQueryString = createCanonicalQueryString( queryString );

  if ( typeof( canonicalQueryString ) == "object" ) { // got error
    return callback( { message : canonicalQueryString.message } );
  }

  var stringToSign = createStringToSign( httpVerb, host, httpRequestUri,
     canonicalQueryString );

  var signature = hmac( secretAccessKey, stringToSign, 'base64' );

  return callback( null, {
    host : host,
    httpVerb : httpVerb,
    httpRequestUri : httpRequestUri,
    signature : encodeURIComponent( signature ),
    signatureMethod : SIGNATURE_METHOD,
    signatureVersion : SIGNATURE_VERSION
  });

}; // version2

crosstalk.on( 'api.aws.signature.version2', 'public', version2 );