import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class MailSenderService {

  constructor(private _http: HttpClient) { }

  sendRegistrationMessage(body) {
    return this._http.post('http://localhost:3000/register', body);
  }

  sendNewPasswordMessage(body) {
    return this._http.post('http://localhost:3000/password', body);
  }

  sendChangePaperStatusMessage(body) {
    return this._http.post('http://localhost:3000/changePaperState', body);
  }

  sendNewPaperMessage(body) {
    return this._http.post('http://localhost:3000/newPaper', body);
  }

  sendNewProofPaymentMessage(body) {
    return this._http.post('http://localhost:3000/proofPayment', body);
  }

  sendChangeDataPaperMessage(body) {
    return this._http.post('http://localhost:3000/changeDataPaper', body);
  }

}
