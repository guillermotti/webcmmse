import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-lost-password',
  templateUrl: './lost-password.component.html',
  styleUrls: ['./lost-password.component.scss']
})
export class LostPasswordComponent implements OnInit {

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

  recoverPassword() {

  }

}
