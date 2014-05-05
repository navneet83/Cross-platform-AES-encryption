	/*****************************************************************
	 * CrossPlatform CryptLib
	 * 
	 * <p>
	 * This cross platform CryptLib uses AES 256 for encryption. This library can
	 * be used for encryptoion and de-cryption of string on iOS, Android and Windows
	 * platform.<br/>
	 * Features: <br/>
	 * 1. 256 bit AES encryption
	 * 2. Random IV generation. 
	 * 3. Provision for SHA256 hashing of key. 
	 * </p>
	 * 
	 * @since 1.0
	 * @author navneet
	 *****************************************************************/
// How to use :
// //  1. Encryption:

// NSString * _secret = @"This the sample text has to be encrypted"; // this is the text that you want to encrypt.

// NSString * _key = @"shared secret"; //secret key for encryption. To make encryption stronger, we will not use this key directly. We'll first hash the key next step and then use it.

// key = [[StringEncryption alloc] sha256:key length:32]; //this is very important, 32 bytes = 256 bit

// NSString * iv =   [[[[StringEncryption alloc] generateRandomIV:11]  base64EncodingWithLineLength:0] substringToIndex:16]; //Here we are generating random initialization vector (iv). Length of this vector = 16 bytes = 128 bits

// Now that we have input text, hashed key and random IV, we are all set for encryption:
// NSData * encryptedData = [[StringEncryption alloc] encrypt:[secret dataUsingEncoding:NSUTF8StringEncoding] key:key iv:iv];

// NSLog(@"encrypted data:: %@", [encryptedData  base64EncodingWithLineLength:0]); //print the encrypted text
// Encryption = [plainText + secretKey + randomIV] = Cyphertext

// // 2. Decryption
// for decryption, you will have to use the same IV and key which was used for encryption.

// encryptedData = [[StringEncryption alloc] decrypt:encryptedData  key:key iv:iv];
// NSString * decryptedText = [[NSString alloc] initWithData:encryptedData encoding:NSUTF8StringEncoding];
// NSLog(@"decrypted data:: %@", decryptedText); //print the decrypted text

// For base64EncodingWithLineLength refer - https://github.com/jdg/MGTwitterEngine/blob/master/NSData%2BBase64.m


#import "StringEncryption.h"
#import "NSData+Base64.h"


@implementation StringEncryption

- (NSData *)encrypt:(NSData *)plainText key:(NSString *)key  iv:(NSString *)iv {
    char keyPointer[kCCKeySizeAES256+2],// room for terminator (unused) ref: https://devforums.apple.com/message/876053#876053
    ivPointer[kCCBlockSizeAES128+2];
    BOOL patchNeeded;
    bzero(keyPointer, sizeof(keyPointer)); // fill with zeroes for padding
    //key = [[StringEncryption alloc] md5:key];
    patchNeeded= ([key length] > kCCKeySizeAES256+1);
    if(patchNeeded)
    {
        NSLog(@"Key length is longer %lu", (unsigned long)[[[StringEncryption alloc] md5:key] length]);
        key = [key substringToIndex:kCCKeySizeAES256]; // Ensure that the key isn't longer than what's needed (kCCKeySizeAES256)
    }
    
    //NSLog(@"md5 :%@", key);
    [key getCString:keyPointer maxLength:sizeof(keyPointer) encoding:NSUTF8StringEncoding];
    [iv getCString:ivPointer maxLength:sizeof(ivPointer) encoding:NSUTF8StringEncoding];
    
    if (patchNeeded) {
        keyPointer[0] = '\0';  // Previous iOS version than iOS7 set the first char to '\0' if the key was longer than kCCKeySizeAES256
    }
    
    NSUInteger dataLength = [plainText length];
    
    //see https://developer.apple.com/library/ios/documentation/System/Conceptual/ManPages_iPhoneOS/man3/CCryptorCreateFromData.3cc.html
    // For block ciphers, the output size will always be less than or equal to the input size plus the size of one block.
    size_t buffSize = dataLength + kCCBlockSizeAES128;
    void *buff = malloc(buffSize);
    
    size_t numBytesEncrypted = 0;
    //refer to http://www.opensource.apple.com/source/CommonCrypto/CommonCrypto-36064/CommonCrypto/CommonCryptor.h
    //for details on this function
    //Stateless, one-shot encrypt or decrypt operation.
    CCCryptorStatus status = CCCrypt(kCCEncrypt, /* kCCEncrypt, etc. */
                                     kCCAlgorithmAES128, /* kCCAlgorithmAES128, etc. */
                                     kCCOptionPKCS7Padding, /* kCCOptionPKCS7Padding, etc. */
                                     keyPointer, kCCKeySizeAES256, /* key and its length */
                                     ivPointer, /* initialization vector - use random IV everytime */
                                     [plainText bytes], [plainText length], /* input  */
                                     buff, buffSize,/* data RETURNED here */
                                     &numBytesEncrypted);
    if (status == kCCSuccess) {
        return [NSData dataWithBytesNoCopy:buff length:numBytesEncrypted];
    }
    
    free(buff);
    return nil;
}


-(NSData *)decrypt:(NSData *)encryptedText key:(NSString *)key iv:(NSString *)iv {
    char keyPointer[kCCKeySizeAES256+2],// room for terminator (unused) ref: https://devforums.apple.com/message/876053#876053
    ivPointer[kCCBlockSizeAES128+2];
    BOOL patchNeeded;
  
    patchNeeded = ([key length] > kCCKeySizeAES256+1);
    if(patchNeeded)
    {
        NSLog(@"Key length is longer %lu", (unsigned long)[[[StringEncryption alloc] md5:key] length]);
        key = [key substringToIndex:kCCKeySizeAES256]; // Ensure that the key isn't longer than what's needed (kCCKeySizeAES256)
    }

    [key getCString:keyPointer maxLength:sizeof(keyPointer) encoding:NSUTF8StringEncoding];
    [iv getCString:ivPointer maxLength:sizeof(ivPointer) encoding:NSUTF8StringEncoding];

    if (patchNeeded) {
        keyPointer[0] = '\0';  // Previous iOS version than iOS7 set the first char to '\0' if the key was longer than kCCKeySizeAES256
    }
    
    NSUInteger dataLength = [encryptedText length];
    
    //see https://developer.apple.com/library/ios/documentation/System/Conceptual/ManPages_iPhoneOS/man3/CCryptorCreateFromData.3cc.html
    // For block ciphers, the output size will always be less than or equal to the input size plus the size of one block.
    size_t buffSize = dataLength + kCCBlockSizeAES128;
    
    void *buff = malloc(buffSize);
    
    size_t numBytesEncrypted = 0;
    //refer to http://www.opensource.apple.com/source/CommonCrypto/CommonCrypto-36064/CommonCrypto/CommonCryptor.h
    //for details on this function
    //Stateless, one-shot encrypt or decrypt operation.
    CCCryptorStatus status = CCCrypt(kCCDecrypt,/* kCCEncrypt, etc. */
                                     kCCAlgorithmAES128, /* kCCAlgorithmAES128, etc. */
                                     kCCOptionPKCS7Padding, /* kCCOptionPKCS7Padding, etc. */
                                     keyPointer, kCCKeySizeAES256,/* key and its length */
                                     ivPointer, /* initialization vector - use same IV which was used for decryption */
                                     [encryptedText bytes], [encryptedText length], //input
                                     buff, buffSize,//output
                                     &numBytesEncrypted);
    if (status == kCCSuccess) {
        return [NSData dataWithBytesNoCopy:buff length:numBytesEncrypted];
    }
    
    free(buff);
    return nil;
}

//this function is no longer used in encryption / decryption
- (NSString *) md5:(NSString *) input
{
    const char *cStr = [input UTF8String];
    unsigned char digest[16];
    CC_MD5( cStr, strlen(cStr), digest ); // This is the md5 call
    
    NSMutableString *output = [NSMutableString stringWithCapacity:CC_MD5_DIGEST_LENGTH * 2];
    
    for(int i = 0; i < CC_MD5_DIGEST_LENGTH; i++)
        [output appendFormat:@"%02x", digest[i]];
    
    return  output;
    
}

//function to generate random string of given length. 
//random strings are used as IV
- (NSData *)generateRandomIV:(size_t)length
{
    NSMutableData *data = [NSMutableData dataWithLength:length];
    
    int output = SecRandomCopyBytes(kSecRandomDefault,
                                    length,
                                    data.mutableBytes);
    NSAssert(output == 0, @"error generating random bytes: %d",
             errno);
    
    return data;
}

    /**
	 * This function computes the SHA256 hash of input string
	 * @param text input text whose SHA256 hash has to be computed
	 * @param length length of the text to be returned
	 * @return returns SHA256 hash of input text 
	 */
- (NSString*) sha256:(NSString *)key length:(NSInteger) length{
    const char *s=[key cStringUsingEncoding:NSASCIIStringEncoding];
    NSData *keyData=[NSData dataWithBytes:s length:strlen(s)];
    
    uint8_t digest[CC_SHA256_DIGEST_LENGTH]={0};
    CC_SHA256(keyData.bytes, keyData.length, digest);
    NSData *out=[NSData dataWithBytes:digest length:CC_SHA256_DIGEST_LENGTH];
    NSString *hash=[out description];
    hash = [hash stringByReplacingOccurrencesOfString:@" " withString:@""];
    hash = [hash stringByReplacingOccurrencesOfString:@"<" withString:@""];
    hash = [hash stringByReplacingOccurrencesOfString:@">" withString:@""];
    
    if(length > [hash length])
    {
        return  hash;
    }
    else
    {
        return [hash substringToIndex:length];
    }
 }

@end
