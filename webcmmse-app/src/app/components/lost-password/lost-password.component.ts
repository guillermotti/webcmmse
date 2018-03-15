import { Component, OnInit } from '@angular/core';
import { AppConfig } from '../../config/app.config';

@Component({
  selector: 'app-lost-password',
  templateUrl: './lost-password.component.html',
  styleUrls: ['./lost-password.component.scss']
})
export class LostPasswordComponent implements OnInit {

  year = AppConfig.year;
  urlCMMSE = AppConfig.urlCMMSE;
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
