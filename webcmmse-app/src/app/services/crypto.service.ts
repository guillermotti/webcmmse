import { Injectable } from '@angular/core';
import { AppConfig } from '../config/app.config';

@Injectable()
export class CryptoService {

  private key: string;
  private enabled: boolean;
  private cryptoJS: any;

  constructor() {
    this.key = AppConfig.privateKey;
    this.cryptoJS = require('crypto-js');
  }

  public encrypt(plaintext: any): string {
    const encrypted = this.cryptoJS.AES.encrypt(JSON.stringify(plaintext), this.key);
    return encrypted.toString();
  }

  public decrypt(cypher: string): string {
    const bytes  = this.cryptoJS.AES.decrypt(cypher.toString(), this.key);
    const decryptedData = JSON.parse(bytes.toString(this.cryptoJS.enc.Utf8));
    return decryptedData;
  }

}
