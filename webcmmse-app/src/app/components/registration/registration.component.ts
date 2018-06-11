import { Component, OnInit, Inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { FirebaseCallerService } from '../../services/firebase-caller.service';
import { AppConfig } from '../../config/app.config';
import { CryptoService } from '../../services/crypto.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import * as _ from 'lodash';
import { MailSenderService } from '../../services/mail-sender.service';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent implements OnInit {

  year; urlCMMSE; hide = true; hide2 = true; emailBCC; emailSender; emailPass; emailOpen;
  form = {
    'name': '',
    'lastName': '',
    'title': '',
    'country': '',
    'city': '',
    'state': '',
    'universityCompany': '',
    'postalCode': '',
    'address': '',
    'phone': '',
    'email': '',
    'emailCheck': '',
    'password': '',
    'passwordCheck': '',
    'check': false,
    'year': '',
    'bcc': '',
    'emailSender': '',
    'emailPass': '',
    'tax': ''
  };

  formControl = new FormControl('', [Validators.required]);
  emailControl = new FormControl('', [Validators.required, Validators.email]);
  emailControl2 = new FormControl('', [Validators.required, Validators.email]);

  titles = AppConfig.titles;
  countries = AppConfig.countries;

  constructor(public dialog: MatDialog, public snackBar: MatSnackBar,
    private firebaseService: FirebaseCallerService, private cryptoService: CryptoService,
    private translationService: TranslateService, private router: Router, public mailSenderService: MailSenderService) { }

  ngOnInit() {
    this.firebaseService.getCollection('config').subscribe(response => {
      this.year = response[0].conference_year;
      this.urlCMMSE = response[0].conference_url;
      this.emailBCC = response[0].emails;
      this.emailSender = response[0].email_sender;
      this.emailPass = this.cryptoService.decrypt(response[0].email_password);
      this.form.tax = response[0].fee_to_pay;
      this.emailOpen = response[0].email_opened;
    });
    const passCheckInput = document.getElementById('passCheck');
    const emailCheckInput = document.getElementById('emailCheck');
    passCheckInput.onpaste = function (e) {
      e.preventDefault();
    };
    emailCheckInput.onpaste = function (e) {
      e.preventDefault();
    };
  }

  isFormValid() {
    if (this.areFieldsEmpty() || this.form.check === false || this.isPasswordWeak()) {
      return true;
    } else if (this.form.email !== this.form.emailCheck || this.form.password !== this.form.passwordCheck) {
      return true;
    } else if (this.emailControl2.hasError('email') || this.emailControl.hasError('email')) {
      return true;
    } else {
      return false;
    }
  }

  areFieldsEmpty() {
    if (this.form.country === '' || this.form.email === '' || this.form.emailCheck === ''
      || this.form.lastName === '' || this.form.name === '' || this.form.password === '' || this.form.passwordCheck === ''
      || this.form.title === '' || this.form.universityCompany === '') {
      return true;
    }
  }

  isPasswordWeak() {
    const pwd = this.form.password;
    const regex = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*\d)(?=.*[^A-Za-z0-9])([A-Za-z\d$@$!%*?&]|[^ ]){8,}$/;
    if (!regex.test(pwd)) {
      return true;
    } else {
      return false;
    }
  }

  submitRegister() {
    const obser = this.firebaseService.getUserFromCollection(this.form.email).subscribe(response => {
      if (_.isEmpty(response)) {
        const user = {
          address: this.form.address,
          city: this.form.city,
          country: this.form.country,
          email: this.form.email,
          first_name: this.form.name,
          last_name: this.form.lastName,
          password: this.cryptoService.encrypt(this.form.password),
          phone: this.form.phone,
          postal_code: this.form.postalCode,
          state: this.form.state,
          title: this.form.title,
          university_company: this.form.universityCompany,
          check_payment: false,
          tax: this.form.tax
        };
        this.firebaseService.addItemToCollection('users', user).then(() => {
          this.translationService.get('_REGISTER_SUCCESFUL').subscribe(resp => {
            this.snackBar.open(resp, null, {
              duration: 2000,
            });
            this.form.year = this.year;
            this.form.bcc = this.emailBCC;
            this.form.emailSender = this.emailSender;
            this.form.emailPass = this.emailPass;
            if (this.emailOpen) {
              const obser2 = this.mailSenderService.sendRegistrationMessage(this.form).subscribe(() => {
                console.log('Mensaje enviado correctamente');
                obser2.unsubscribe();
              });
            }
          });
          this.router.navigate(['login']);
        });
      } else {
        this.form.email = null;
        this.form.emailCheck = null;
        this.translationService.get('_USER_ALREADY_EXISTS').subscribe(resp => {
          this.snackBar.open(resp, null, {
            duration: 2000,
            panelClass: 'redSnack'
          });
        });
      }
      obser.unsubscribe();
    });
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(AccordanceTermsDialogComponent, {
      width: '400px',
      data: {}
    });

    const obser = dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed', result);
      obser.unsubscribe();
    });
  }

}

@Component({
  selector: 'app-accordance-terms-dialog',
  templateUrl: 'accordance-terms-dialog.html',
})
export class AccordanceTermsDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<AccordanceTermsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  onOkClick(): void {
    this.dialogRef.close();
  }

}
