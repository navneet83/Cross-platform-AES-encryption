//	NSString * _secret = @"This the sample text has to be encrypted";
//	NSString * _key = @"shared secret";
//
//	//[contentView setText:str];
//
//    //encryption
//    NSData * _encryptedData = [[StringEncryption alloc] encrypt:[_secret dataUsingEncoding:NSUTF8StringEncoding] key:_key];
//    NSLog(@"encrypted data:: %@", [_encryptedData  base64EncodingWithLineLength:0]);
//
//    //decryption
//    _encryptedData = [[StringEncryption alloc] decrypt:_encryptedData  key:_key];
//    NSString * _decryptedText = [[NSString alloc] initWithData:_encryptedData encoding:NSUTF8StringEncoding];
//    NSLog(@"decrypted data:: %@", _decryptedText);
//    For base64EncodingWithLineLength refer - https://github.com/jdg/MGTwitterEngine/blob/master/NSData%2BBase64.m
//    NOTE -  This code is not yet ready for production use. IV and MD5 has be generated using a hash to make this more secure.


- (NSData *)encrypt:(NSData *)_plainText key:(NSString *)_key {
    char _keyPointer[kCCKeySizeAES128];
    bzero(_keyPointer, sizeof(_keyPointer));
    
    [_key getCString:_keyPointer maxLength:sizeof(_keyPointer) encoding:NSUTF8StringEncoding];
    
    NSUInteger _dataLength = [_plainText length];
    
    size_t _buffSize = _dataLength + kCCBlockSizeAES128;
    void *buff = malloc(_buffSize);
    
    size_t _numBytesEncrypted = 0;
    
    CCCryptorStatus _status = CCCrypt(kCCEncrypt, kCCAlgorithmAES128, kCCOptionPKCS7Padding,
                                          _keyPointer, kCCKeySizeAES128,
                                          _keyPointer, //iv
                                          [_plainText bytes], [_plainText length], //input
                                          buff, _buffSize,//output
                                          &_numBytesEncrypted);
    if (_status == kCCSuccess) {
        return [NSData dataWithBytesNoCopy:buff length:_numBytesEncrypted];
    }
    
    free(buff);
    return nil;
}

-(NSData *)decrypt:(NSData *)_encryptedText key:(NSString *)_key {
    char _keyPointer[kCCKeySizeAES128];
    //bzero(_keyPointer, sizeof(_keyPointer));
    
    [_key getCString:_keyPointer maxLength:sizeof(_keyPointer) encoding:NSUTF8StringEncoding];
    
    NSUInteger _dataLength = [_encryptedText length];
    
    size_t _buffSize = _dataLength + kCCBlockSizeAES128;
    void *buff = malloc(_buffSize);
    
    size_t _numBytesEncrypted = 0;
    
    CCCryptorStatus _status = CCCrypt(kCCDecrypt, kCCAlgorithmAES128, kCCOptionPKCS7Padding,
                                      _keyPointer, kCCKeySizeAES128,
                                      _keyPointer, //iv
                                      [_encryptedText bytes], [_encryptedText length], //input
                                      buff, _buffSize,//output
                                      &_numBytesEncrypted);
    if (_status == kCCSuccess) {
        return [NSData dataWithBytesNoCopy:buff length:_numBytesEncrypted];
    }
    
    free(buff);
    return nil;
}
