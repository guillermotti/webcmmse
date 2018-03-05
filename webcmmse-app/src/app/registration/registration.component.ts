import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent implements OnInit {

  // Esto debe ser configurable en un app.conf
  date = new Date();
  year = this.date.getFullYear();
  urlCMMSE = 'http://cmmse.usal.es/cmmse2018/';

  constructor() { }

  ngOnInit() {
  }

}
