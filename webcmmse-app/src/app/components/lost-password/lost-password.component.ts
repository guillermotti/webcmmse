import { Component, OnInit } from '@angular/core';
import { AppConfig } from '../../config/app.config';
import { FirebaseCallerService } from '../../services/firebase-caller.service';
import { FormControl, Validators } from '@angular/forms';
import * as _ from 'lodash';
import { CryptoService } from '../../services/crypto.service';
import { MailSenderService } from '../../services/mail-sender.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-lost-password',
  templateUrl: './lost-password.component.html',
  styleUrls: ['./lost-password.component.scss']
})
export class LostPasswordComponent implements OnInit {

  year; urlCMMSE; user; userIncorrect; emailSender; emailPass;
  emailControl = new FormControl('', [Validators.required, Validators.email]);

  constructor(private firebaseService: FirebaseCallerService, private cryptoService: CryptoService,
    private mailSenderService: MailSenderService, private router: Router) { }

  ngOnInit() {
    this.firebaseService.getCollection('config').subscribe(response => {
      this.year = response[0].conference_year;
      this.urlCMMSE = response[0].conference_url;
      this.emailSender = response[0].email_sender;
      this.emailPass = this.cryptoService.decrypt(response[0].email_password);
    });
  }

  recoverPassword() {
    const subscription = this.firebaseService.getUserFromCollection(this.user).subscribe(response => {
      if (!_.isEmpty(response)) {
        const newPass = Math.random().toString(36).slice(-8);
        response[0].password = this.cryptoService.encrypt(newPass);
        this.firebaseService.updateItemFromCollection('users', response[0].id, response[0]);
        const form = { year: this.year, emailSender: this.emailSender,
          emailPass: this.emailPass, password: newPass, email: this.user, name: _.capitalize(response[0].first_name)};
        this.mailSenderService.sendNewPasswordMessage(form).subscribe(() => {
          console.log('Mensaje enviado correctamente');
        });
        this.router.navigate(['login']);
      } else {
        this.userIncorrect = true;
      }
      subscription.unsubscribe();
    });
  }

}
