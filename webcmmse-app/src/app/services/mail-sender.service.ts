import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class MailSenderService {

  constructor(private _http: HttpClient) { }

  sendRegistrationMessage(body) {
    // To hosting in any other place (not firebase), call to this url listening on port 3000
    // return this._http.post('http://localhost:3000/register', body);
    // To hosting with firebase, it's needed to call to this url. The mail cloud function will be executed.
    return this._http.post('https://us-central1-cmmse-app.cloudfunctions.net/mail/register', body);
  }

  sendNewPasswordMessage(body) {
    // return this._http.post('http://localhost:3000/password', body);
    return this._http.post('https://us-central1-cmmse-app.cloudfunctions.net/mail/password', body);
  }

  sendChangePaperStatusMessage(body) {
    // return this._http.post('http://localhost:3000/changePaperState', body);
    return this._http.post('https://us-central1-cmmse-app.cloudfunctions.net/mail/changePaperState', body);
  }

  sendNewPaperMessage(body) {
    // return this._http.post('http://localhost:3000/newPaper', body);
    return this._http.post('https://us-central1-cmmse-app.cloudfunctions.net/mail/newPaper', body);
  }

  sendNewProofPaymentMessage(body) {
    // return this._http.post('http://localhost:3000/proofPayment', body);
    return this._http.post('https://us-central1-cmmse-app.cloudfunctions.net/mail/proofPayment', body);
  }

  sendChangeDataPaperMessage(body) {
    // return this._http.post('http://localhost:3000/changeDataPaper', body);
    return this._http.post('https://us-central1-cmmse-app.cloudfunctions.net/mail/changeDataPaper', body);
  }

}
