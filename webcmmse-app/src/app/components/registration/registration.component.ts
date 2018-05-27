import { Component, OnInit, Inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { FirebaseCallerService } from '../../services/firebase-caller.service';
import { AppConfig } from '../../config/app.config';
import { CryptoService } from '../../services/crypto.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import * as _ from 'lodash';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent implements OnInit {

  year; urlCMMSE; hide = true; hide2 = true;
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
    'check': false
  };

  formControl = new FormControl('', [Validators.required]);
  emailControl = new FormControl('', [Validators.required, Validators.email]);
  emailControl2 = new FormControl('', [Validators.required, Validators.email]);

  titles = AppConfig.titles;
  countries = AppConfig.countries;

  constructor(public dialog: MatDialog, public snackBar: MatSnackBar,
    private firebaseService: FirebaseCallerService, private crytoService: CryptoService,
    private translationService: TranslateService, private router: Router) { }

  ngOnInit() {
    this.firebaseService.getCollection('config').subscribe(response => {
      this.year = response[0].conference_year;
      this.urlCMMSE = response[0].conference_url;
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
    if (this.areFieldsEmpty() || this.form.check === false || this.arePasswordWeak()) {
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

  arePasswordWeak() {
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
          password: this.crytoService.encrypt(this.form.password),
          phone: this.form.phone,
          postal_code: this.form.postalCode,
          state: this.form.state,
          title: this.form.title,
          university_company: this.form.universityCompany,
          check_payment: false
        };
        this.firebaseService.addItemToCollection('users', user).then(() => {
          this.translationService.get('_REGISTER_SUCCESFUL').subscribe(resp => {
            this.snackBar.open(resp, null, {
              duration: 2000,
            });
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

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed', result);
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
