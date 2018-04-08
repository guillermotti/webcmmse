import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import * as _ from 'lodash';
import { AppConfig } from '../../config/app.config';
import { FormControl, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { FirebaseCallerService } from '../../services/firebase-caller.service';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog, MatSnackBar } from '@angular/material';
import { CryptoService } from '../../services/crypto.service';
import { ISubscription } from 'rxjs/Subscription';

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
  colorChange = 'primary';
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
      this.firebaseService.getUserFromCollection(user.email, 'users').subscribe(response => {
        window.sessionStorage.setItem('user', JSON.stringify(response[0]));
        this.form.title = response[0].title;
        this.form.address = response[0].address;
        this.form.city = response[0].city;
        this.form.country = response[0].country;
        this.form.last_name = response[0].last_name;
        this.form.first_name = response[0].first_name;
        this.form.phone = response[0].phone;
        this.form.postal_code = response[0].postal_code;
        this.form.state = response[0].state;
        this.form.university_company = response[0].university_company;
        this.email = response[0].email;
      });
    }
  }

  changeData() {
    this.disabled = !this.disabled;
    if (this.change === '_CHANGE_DATA') {
      this.change = '_SAVE_CHANGES';
      this.colorChange = 'accent';
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
      this.colorChange = 'primary';
    }
  }

  areFieldsEmpty() {
    if (this.form.country === '' || this.form.last_name === '' || this.form.first_name === ''
      || this.form.title === '' || this.form.university_company === '') {
      return true;
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
export class ChangePasswordDialogComponent implements OnDestroy {

  private subscription: ISubscription;
  formControl = new FormControl('', [Validators.required]);
  hide = true;
  hide2 = true;
  hide3 = true;
  oldPassword;
  newPassword;
  newPasswordCheck;

  constructor(
    private cryptoService: CryptoService, private firebaseService: FirebaseCallerService, private translateService: TranslateService,
    public dialogRef: MatDialogRef<ChangePasswordDialogComponent>, public snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  onCancelClick(): void {
    this.dialogRef.close();
  }

  saveChanges() {
    const user = JSON.parse(window.sessionStorage.getItem('user'));
    const currentPass = this.cryptoService.decrypt(user.password);
    if (this.oldPassword === currentPass && this.newPassword === this.newPasswordCheck) {
      const passwordChanged = this.cryptoService.encrypt(this.newPassword);
      user.password = passwordChanged;
      this.firebaseService.updateItemFromCollection('users', user.id, user).then(() => {
        this.subscription = this.firebaseService.getUserFromCollection(user.email, 'users').subscribe(response => {
          window.sessionStorage.setItem('user', JSON.stringify(response[0]));
          this.translateService.get('_PASSWORD_CHANGED').subscribe(translate => {
            this.snackBar.open(translate, null, {
              duration: 2000,
            });
          });
          this.dialogRef.close();
        });
      });
    } else {
      this.translateService.get('_PASSWORD_INCORRECT').subscribe(translate => {
        this.snackBar.open(translate, null, {
          duration: 2000,
        });
      });
    }
  }

  areFieldsEmpty() {
    if (this.newPassword === '' || this.newPasswordCheck === '' || this.oldPassword === '' || this.newPassword !== this.newPasswordCheck
      || _.isNil(this.newPassword) || _.isNil(this.newPasswordCheck) || _.isNil(this.oldPassword)) {
      return true;
    }
  }

}
