/*
 * MIT License
 *
 * Copyright (c) 2017 Kavin Varnan
 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

#import "CryptLib.h"


@implementation CryptLib

- (NSData *)encrypt:(NSData *)plainText key:(NSString *)key  iv:(NSString *)iv {
    char keyPointer[kCCKeySizeAES256+2],// room for terminator (unused) ref: https://devforums.apple.com/message/876053#876053
    ivPointer[kCCBlockSizeAES128+2];
    BOOL patchNeeded;
    bzero(keyPointer, sizeof(keyPointer)); // fill with zeroes for padding
    
    patchNeeded= ([key length] > kCCKeySizeAES256+1);
    if(patchNeeded)
    {
        NSLog(@"Key length is longer %lu", (unsigned long)[[self md5:key] length]);
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
        NSLog(@"Key length is longer %lu", (unsigned long)[[self md5:key] length]);
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

- (NSString *) encryptPlainText:(NSString *)plainText key:(NSString *)key iv:(NSString *)iv {
    return [[[[CryptLib alloc] init] encrypt:[plainText dataUsingEncoding:NSUTF8StringEncoding] key:[[CryptLib alloc] sha256:key length:32] iv:iv] base64EncodedStringWithOptions:0];
}

- (NSString *) decryptCipherText:(NSString *)ciperText key:(NSString *)key iv:(NSString *)iv {
    return [[NSString alloc] initWithData:[[CryptLib alloc] decrypt:[[NSData alloc] initWithBase64EncodedString:ciperText options:NSDataBase64DecodingIgnoreUnknownCharacters] key:[[CryptLib alloc] sha256:key length:32] iv:[[CryptLib alloc] generateRandomIV16]] encoding:NSUTF8StringEncoding];
}

- (NSString *) encryptPlainTextRandomIVWithPlainText:(NSString *)plainText key:(NSString *)key {
    CryptLib *crypt = [CryptLib alloc];
    NSString *plain = [crypt generateRandomIV16];
    plain = [plain stringByAppendingString:plainText];
    return [[[crypt init] encrypt:[plain dataUsingEncoding:NSUTF8StringEncoding] key:[crypt sha256:key length:32] iv:[crypt generateRandomIV16]] base64EncodedStringWithOptions:0];
}

- (NSString *) decryptCipherTextRandomIVWithCipherText:(NSString *)cipherText key:(NSString *)key {
    CryptLib *crypt = [CryptLib alloc];
    NSString *plain = [[NSString alloc] initWithData:[crypt decrypt:[[NSData alloc] initWithBase64EncodedString:cipherText options:NSDataBase64DecodingIgnoreUnknownCharacters] key:[crypt sha256:key length:32] iv:[crypt generateRandomIV16]] encoding:NSUTF8StringEncoding];
    return [plain substringFromIndex:16];
}


//this function is no longer used in encryption / decryption
- (NSString *)md5:(NSString *) input
{
    const char *cStr = [input UTF8String];
    unsigned char digest[16];
    CC_MD5( cStr, (uint32_t)strlen(cStr), digest ); // This is the md5 call
    
    NSMutableString *output = [NSMutableString stringWithCapacity:CC_MD5_DIGEST_LENGTH * 2];
    
    for(int i = 0; i < CC_MD5_DIGEST_LENGTH; i++)
        [output appendFormat:@"%02x", digest[i]];
    
    return  output;
    
}

- (NSString*)generateRandomIV:(size_t)length {
    
    // Since the length of Base64 hash is = (3/4) x (length of input string) we can work out input length required to
    // generate 32byte hash is 24 bytes long. Note: Base64 may pad end with one, two or no '=' chars if not divisible.
    // Therefore we don't care the generated string will be too long, just trim it down before returning.
    
    NSMutableData *data = [NSMutableData dataWithLength:length];
    
    int result = SecRandomCopyBytes(NULL, length, data.mutableBytes);
    
    NSAssert(result == 0, @"Error generating random bytes: %d", errno);
    
    NSString *base64EncodedData = [[data base64EncodedStringWithOptions:0] substringToIndex:length];
    
    return base64EncodedData;
}

- (NSString*)generateRandomIV16 {
    
    // Since the length of Base64 hash is = (3/4) x (length of input string) we can work out input length required to
    // generate 32byte hash is 24 bytes long. Note: Base64 may pad end with one, two or no '=' chars if not divisible.
    // Therefore we don't care the generated string will be too long, just trim it down before returning.
    
    NSMutableData *data = [NSMutableData dataWithLength:16];
    
    int result = SecRandomCopyBytes(NULL, 16, data.mutableBytes);
    
    NSAssert(result == 0, @"Error generating random bytes: %d", errno);
    
    NSString *base64EncodedData = [[data base64EncodedStringWithOptions:0] substringToIndex:16];
    
    return base64EncodedData;
}

/**
 * This function computes the SHA256 hash of input string
 * @param key input text whose SHA256 hash has to be computed
 * @param length length of the text to be returned
 * @return returns SHA256 hash of input text
 */
- (NSString*) sha256:(NSString *)key length:(NSInteger) length{
    const char *s=[key cStringUsingEncoding:NSASCIIStringEncoding];
    NSData *keyData=[NSData dataWithBytes:s length:strlen(s)];
    
    uint8_t digest[CC_SHA256_DIGEST_LENGTH]={0};
    CC_SHA256(keyData.bytes, (CC_LONG)keyData.length, digest);
    NSData *out = [NSData dataWithBytes:digest length:CC_SHA256_DIGEST_LENGTH];
    
    // NSString *hash = [out debugDescription]; // This works but we won't rely on this due to the undocumented behaviour of description and debufDescription.
    NSString *hash = [self hex:out];
    
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

#pragma mark - String Conversion

/// Convert NSData to Hex.
/// Reference: @Abdu's answer from https://stackoverflow.com/questions/58098958/aes-encryption-cryptlib-in-ios-13-not-working
-(NSString*)hex:(NSData*)data{
    NSMutableData *result = [NSMutableData dataWithLength:2*data.length];
    unsigned const char* src = data.bytes;
    unsigned char* dst = result.mutableBytes;
    unsigned char t0, t1;
    
    for (int i = 0; i < data.length; i ++ ) {
        t0 = src[i] >> 4;
        t1 = src[i] & 0x0F;
        
        dst[i*2] = 48 + t0 + (t0 / 10) * 39;
        dst[i*2+1] = 48 + t1 + (t1 / 10) * 39;
    }
    
    return [[NSString alloc] initWithData:result encoding:NSASCIIStringEncoding];
}

@end
