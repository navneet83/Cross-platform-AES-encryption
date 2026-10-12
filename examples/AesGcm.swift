// AES-256-GCM with a password, using CryptoKit (iOS 13+, macOS 10.15+) and CommonCrypto for PBKDF2.
// Layout of the output, Base64: salt (16) || nonce (12) || ciphertext || tag (16).
// Key: PBKDF2-HMAC-SHA256, 600000 iterations, from the UTF-8 bytes of the password.
// Run as a script: swift AesGcm.swift

import CommonCrypto
import CryptoKit
import Foundation

let iterations: UInt32 = 600_000
let saltBytes = 16
let nonceBytes = 12

enum AesGcmError: Error { case badInput, kdfFailed }

func deriveKey(password: String, salt: Data) throws -> SymmetricKey {
    var key = [UInt8](repeating: 0, count: 32)
    let status = salt.withUnsafeBytes { saltPtr in
        CCKeyDerivationPBKDF(CCPBKDFAlgorithm(kCCPBKDF2), password, password.utf8.count,
                             saltPtr.bindMemory(to: UInt8.self).baseAddress, salt.count,
                             CCPseudoRandomAlgorithm(kCCPRFHmacAlgSHA256), iterations, &key, key.count)
    }
    guard status == kCCSuccess else { throw AesGcmError.kdfFailed }
    return SymmetricKey(data: key)
}

func randomData(_ count: Int) -> Data {
    var bytes = [UInt8](repeating: 0, count: count)
    _ = SecRandomCopyBytes(kSecRandomDefault, count, &bytes)
    return Data(bytes)
}

func encrypt(password: String, plaintext: String, salt: Data? = nil, nonce: Data? = nil) throws -> String {
    let salt = salt ?? randomData(saltBytes)
    let nonce = nonce ?? randomData(nonceBytes)
    let key = try deriveKey(password: password, salt: salt)
    let box = try AES.GCM.seal(Data(plaintext.utf8), using: key, nonce: AES.GCM.Nonce(data: nonce))
    // `combined` is nonce || ciphertext || tag, so the salt is the only thing to prepend.
    return (salt + box.combined!).base64EncodedString()
}

func decrypt(password: String, text: String) throws -> String {
    guard let data = Data(base64Encoded: text), data.count > saltBytes + nonceBytes + 16 else { throw AesGcmError.badInput }
    let salt = data.prefix(saltBytes)
    let key = try deriveKey(password: password, salt: salt)
    // A wrong password or a modified ciphertext throws here; there is no partial output.
    let opened = try AES.GCM.open(AES.GCM.SealedBox(combined: data.dropFirst(saltBytes)), using: key)
    guard let s = String(data: opened, encoding: .utf8) else { throw AesGcmError.badInput }
    return s
}

func hex(_ s: String) -> Data {
    var out = Data(); var i = s.startIndex
    while i < s.endIndex { let j = s.index(i, offsetBy: 2); out.append(UInt8(s[i..<j], radix: 16)!); i = j }
    return out
}

struct Vector: Decodable { let password, salt_hex, nonce_hex, plaintext, output_base64: String }
let url = URL(fileURLWithPath: CommandLine.arguments[0]).deletingLastPathComponent().appendingPathComponent("vector.json")
let vector = try JSONDecoder().decode(Vector.self, from: Data(contentsOf: url))
let produced = try encrypt(password: vector.password, plaintext: vector.plaintext, salt: hex(vector.salt_hex), nonce: hex(vector.nonce_hex))
precondition(produced == vector.output_base64, "vector mismatch: \(produced)")
let decrypted = try decrypt(password: vector.password, text: vector.output_base64)
precondition(decrypted == vector.plaintext, "vector decrypt failed")
let roundTrip = try decrypt(password: "another password", text: encrypt(password: "another password", plaintext: "round trip"))
precondition(roundTrip == "round trip", "round trip failed")
print("AesGcm.swift: vector and round trip OK")
