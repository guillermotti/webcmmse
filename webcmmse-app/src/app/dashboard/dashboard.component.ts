import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {


  // Esto debe ser configurable en un app.conf
  date = new Date();
  year = this.date.getFullYear();
  urlCMMSE = 'http://cmmse.usal.es/cmmse2018/';

  constructor() { }

  ngOnInit() {
  }

}
