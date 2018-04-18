import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import * as _ from 'lodash';
import { ISubscription } from 'rxjs/Subscription';

import { FirebaseCallerService } from '../../services/firebase-caller.service';
import { AppConfig } from '../../config/app.config';
import { CryptoService } from '../../services/crypto.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {

  private subscription: ISubscription;

  year;
  urlCMMSE;
  hide = true;
  user = '';
  password = '';
  userIncorrect = false;
  rootPass;
  rootUser;
  cmmseOpened;

  constructor(private firebaseCaller: FirebaseCallerService, private crytoService: CryptoService, private router: Router) { }

  ngOnInit() {
    this.firebaseCaller.getCollection('config').subscribe(response => {
      this.rootPass = response[0].root_password;
      this.rootUser = response[0].root_user;
      this.cmmseOpened = response[0].cmmse_opened;
      this.year = response[0].conference_year;
      this.urlCMMSE = response[0].conference_url;
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  submitLogin() {
    if (this.crytoService.decrypt(this.rootPass) === this.password && this.user === this.rootUser) {
      const user = { user: this.rootUser, password: this.rootPass };
      window.sessionStorage.setItem('user', JSON.stringify(user));
      this.router.navigate(['users-admin']);
    } else {
      if (this.cmmseOpened) {
        this.subscription = this.firebaseCaller.getUserFromCollection(this.user).subscribe(response => {
          if (!_.isEmpty(response) && this.crytoService.decrypt(response[0].password) === this.password) {
            window.sessionStorage.setItem('user', JSON.stringify(response[0]));
            this.router.navigate(['user']);
          } else {
            this.userIncorrect = true;
          }
        });
      } else {
        this.router.navigate(['closed']);
      }

    }
  }

  isDisabled() {
    if (this.user !== '' && this.password !== '') {
      return false;
    } else {
      return true;
    }
  }

}
