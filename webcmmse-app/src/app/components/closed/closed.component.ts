import { Component, OnInit } from '@angular/core';
import { FirebaseCallerService } from '../../services/firebase-caller.service';

@Component({
  selector: 'app-closed',
  templateUrl: './closed.component.html',
  styleUrls: ['./closed.component.scss']
})
export class ClosedComponent implements OnInit {

  year; urlCMMSE; nextYear;

  constructor(private firebaseService: FirebaseCallerService) { }

  ngOnInit() {
    this.firebaseService.getCollection('config').subscribe(response => {
      this.year = response[0].conference_year;
      this.urlCMMSE = response[0].conference_url;
    });
  }

}
