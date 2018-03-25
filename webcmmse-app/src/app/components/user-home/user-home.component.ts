import { Component, OnInit, Inject } from '@angular/core';
import * as _ from 'lodash';
import { AppConfig } from '../../config/app.config';
import { FormControl, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { FirebaseCallerService } from '../../services/firebase-caller.service';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog, MatSnackBar } from '@angular/material';
import { CryptoService } from '../../services/crypto.service';

@Component({
  selector: 'app-user-home',
  templateUrl: './user-home.component.html',
  styleUrls: ['./user-home.component.scss']
})
export class UserHomeComponent implements OnInit {

  year = AppConfig.year;
  urlCMMSE = AppConfig.urlCMMSE;
  form = {
    'first_name': '',
    'last_name': '',
    'title': '',
    'country': '',
    'city': '',
    'state': '',
    'university_company': '',
    'postal_code': '',
    'address': '',
    'phone': '',
  };
  disabled = true;
  change = '_CHANGE_DATA';
  email;

  formControl = new FormControl('', [Validators.required]);

  titles = AppConfig.titles;
  countries = AppConfig.countries;

  constructor(public dialog: MatDialog, private translateService: TranslateService,
    private firebaseService: FirebaseCallerService, public snackBar: MatSnackBar) { }

  ngOnInit() {
    const user = JSON.parse(window.sessionStorage.getItem('user'));
    if (_.isNil(user)) {
      window.location.href = window.location.href.split('user')[0] + 'login';
    } else {
      this.form.title = user.title;
      this.form.address = user.address;
      this.form.city = user.city;
      this.form.country = user.country;
      this.form.last_name = user.last_name;
      this.form.first_name = user.first_name;
      this.form.phone = user.phone;
      this.form.postal_code = user.postal_code;
      this.form.state = user.state;
      this.form.university_company = user.university_company;
      this.email = user.email;
    }
  }

  changeData() {
    this.disabled = !this.disabled;
    if (this.change === '_CHANGE_DATA') {
      this.change = '_SAVE_CHANGES';
    } else {
      const user = JSON.parse(window.sessionStorage.getItem('user'));
      this.firebaseService.updateItemFromCollection('users', user.id, this.form).then(() => {
        this.translateService.get('_DATA_UPDATED').subscribe(translate => {
          this.snackBar.open(translate, null, {
            duration: 2000,
          });
        });
      });
      this.change = '_CHANGE_DATA';
    }
  }

  logOut() {
    window.sessionStorage.clear();
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(ChangePasswordDialogComponent, {
      width: '600px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed', result);
    });
  }

}

@Component({
  selector: 'app-change-password-dialog',
  templateUrl: 'change-password-dialog.html',
})
export class ChangePasswordDialogComponent {

  formControl = new FormControl('', [Validators.required]);
  hide = true;
  hide2 = true;
  hide3 = true;
  oldPassword;
  newPassword;
  newPasswordCheck;
  form = {
    'password': ''
  };

  constructor(
    private cryptoService: CryptoService, private firebaseService: FirebaseCallerService, private translateService: TranslateService,
    public dialogRef: MatDialogRef<ChangePasswordDialogComponent>, public snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  onCancelClick(): void {
    this.dialogRef.close();
  }

  saveChanges() {
    const user = JSON.parse(window.sessionStorage.getItem('user'));
    this.firebaseService.getItemFromCollection(user.email, 'users').subscribe(response => {
      const currentPass = this.cryptoService.decrypt(response[0].password);
      if (this.oldPassword === currentPass && this.newPassword === this.newPasswordCheck) {
        const passwordChanged = this.cryptoService.encrypt(this.newPassword);
        this.form.password = passwordChanged;
        this.firebaseService.updateItemFromCollection('users', user.id, this.form);
        this.dialogRef.close();
        this.translateService.get('_PASSWORD_CHANGED').subscribe(translate => {
          this.snackBar.open(translate, null, {
            duration: 2000,
          });
        });
      }
    });
  }

  areFieldsEmpty() {
    if (this.newPassword === '' || this.newPasswordCheck === '' || this.oldPassword === '') {
      return true;
    }
  }

}
