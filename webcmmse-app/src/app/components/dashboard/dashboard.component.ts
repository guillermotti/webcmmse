import { Component, OnInit } from '@angular/core';
import { AppConfig } from '../../config/app.config';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  year = AppConfig.year;
  urlCMMSE = AppConfig.urlCMMSE;

  constructor() { }

  ngOnInit() {
  }

  goTo(url) {
    window.location.href = url;
  }

}
