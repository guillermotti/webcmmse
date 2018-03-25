import { Component, OnInit } from '@angular/core';
import { FirebaseCallerService } from '../../services/firebase-caller.service';
import { AppConfig } from '../../config/app.config';
import { CryptoService } from '../../services/crypto.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  year = AppConfig.year;
  urlCMMSE = AppConfig.urlCMMSE;
  hide = true;
  user = '';
  password = '';
  userIncorrect = false;

  constructor(private firebaseCaller: FirebaseCallerService, private crytoService: CryptoService, private router: Router) { }

  ngOnInit() {
  }

  submitLogin() {
    this.firebaseCaller.getItemFromCollection(this.user, 'users').subscribe( response => {
      console.log(response);
      if (this.crytoService.decrypt(response[0].password) === this.password) {
        window.sessionStorage.setItem('user', JSON.stringify(response[0]));
        this.router.navigate(['user']);
      } else {
        this.userIncorrect = true;
      }
    });
  }

  isEnabled() {

  }

}
