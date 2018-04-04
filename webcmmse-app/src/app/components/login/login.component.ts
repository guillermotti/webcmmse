import { Component, OnInit, OnDestroy } from '@angular/core';
import { FirebaseCallerService } from '../../services/firebase-caller.service';
import { AppConfig } from '../../config/app.config';
import { CryptoService } from '../../services/crypto.service';
import { Router } from '@angular/router';
import { ISubscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {

  private subscription: ISubscription;

  year = AppConfig.year;
  urlCMMSE = AppConfig.urlCMMSE;
  hide = true;
  user = '';
  password = '';
  userIncorrect = false;

  constructor(private firebaseCaller: FirebaseCallerService, private crytoService: CryptoService, private router: Router) { }

  ngOnInit() {
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  submitLogin() {
    this.subscription = this.firebaseCaller.getItemFromCollection(this.user, 'users').subscribe(response => {
      if (this.crytoService.decrypt(response[0].password) === this.password) {
        window.sessionStorage.setItem('user', JSON.stringify(response[0]));
        this.router.navigate(['user']);
      } else {
        this.userIncorrect = true;
      }
    });
  }

  isDisabled() {
    if (this.user !== '' && this.password !== '') {
      return false;
    } else {
      return true;
    }
  }

}
