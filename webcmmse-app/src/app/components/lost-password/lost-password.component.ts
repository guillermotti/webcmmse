import { Component, OnInit } from '@angular/core';
import { AppConfig } from '../../config/app.config';
import { FirebaseCallerService } from '../../services/firebase-caller.service';

@Component({
  selector: 'app-lost-password',
  templateUrl: './lost-password.component.html',
  styleUrls: ['./lost-password.component.scss']
})
export class LostPasswordComponent implements OnInit {

  year;
  urlCMMSE;
  hide = true;
  user;
  password;
  userIncorrect = false;

  constructor(private firebaseService: FirebaseCallerService) { }

  ngOnInit() {
    this.firebaseService.getCollection('config').subscribe(response => {
      this.year = response[0].conference_year;
      this.urlCMMSE = response[0].conference_url;
    });
  }

  recoverPassword() {

  }

}
