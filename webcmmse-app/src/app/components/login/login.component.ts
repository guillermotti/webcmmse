import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  // Esto debe ser configurable en un app.conf
  date = new Date();
  year = this.date.getFullYear();
  urlCMMSE = 'http://cmmse.usal.es/cmmse2018/';


  hide = true;
  user;
  password;
  userIncorrect = false;

  constructor() { }

  ngOnInit() {
  }

  submitLogin() {

  }

  isEnabled() {

  }

}
