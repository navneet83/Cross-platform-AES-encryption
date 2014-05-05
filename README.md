Cross platform 256bit AES encryption / decryption.
========
This project contains the implementation of 256 bit AES encryption which works on all the platforms (C#, iOS, Android). One of the key objective is to make AES work on all the platforms with simple implementation. 

Platforms Supported:
1. iOS

2. Android

3. Windows (C#).

Features:
1. Cross platform support. Encryption-Decryption works across C#, iOS and Android. 

2. Support for Random IV (initialization vector) for encryption and decryption. Randomization is crucial for encryption schemes to achieve semantic security, a property whereby repeated usage of the scheme under the same key does not allow an attacker to infer relationships between segments of the encrypted message.

3.  Support for SHA-256 for hashing the key. Never use plain text as encryption key. Always hash the plain text key and then use for encryption. AES permits the use of 256-bit keys. Breaking a symmetric 256-bit key by brute force requires 2^128 times more computational power than a 128-bit key. A device that could check a billion billion (10^18) AES keys per second would in theory require about 3×10^51 years to exhaust the 256-bit key space.
