import { Component, OnInit } from '@angular/core';
import { FirebaseCallerService } from '../../services/firebase-caller.service';
import { TranslateService } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { CryptoService } from '../../services/crypto.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-documents-admin',
  templateUrl: './documents-admin.component.html',
  styleUrls: ['./documents-admin.component.scss']
})
export class DocumentsAdminComponent implements OnInit {

  year; urlCMMSE; user;

  constructor(private firebaseService: FirebaseCallerService, private translationService: TranslateService,
    public snackBar: MatSnackBar, private router: Router, private cryptoService: CryptoService) {

  }

  ngOnInit() {
    const user = JSON.parse(window.sessionStorage.getItem('user'));
    if (_.isNil(user)) {
      this.router.navigate(['login']);
    } else {
      this.firebaseService.getCollection('config').subscribe(response => {
        window.sessionStorage.setItem('config', JSON.stringify(response[0]));
        this.year = response[0].conference_year;
        this.urlCMMSE = response[0].conference_url;
      });
      this.user = user.user;
    }
  }

  logOut() {
    window.sessionStorage.clear();
  }

}
