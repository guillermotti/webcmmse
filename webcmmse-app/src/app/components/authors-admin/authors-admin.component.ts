import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort, MatDialog, MatSnackBar } from '@angular/material';
import { AngularFireStorage } from 'angularfire2/storage';
import { FirebaseCallerService } from '../../services/firebase-caller.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import * as _ from 'lodash';

@Component({
  selector: 'app-authors-admin',
  templateUrl: './authors-admin.component.html',
  styleUrls: ['./authors-admin.component.scss']
})
export class AuthorsAdminComponent implements OnInit {

  year; urlCMMSE; email; conference;

  // Table purposes
  displayedColumns = ['firstName', 'lastName', 'university', 'country', 'numberPapers', 'numberPosters'];
  authors: MatTableDataSource<any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private storage: AngularFireStorage, private firebaseService: FirebaseCallerService, public dialog: MatDialog,
    private translationService: TranslateService, public snackBar: MatSnackBar, private router: Router) {

  }

  ngOnInit() {
    const user = JSON.parse(window.sessionStorage.getItem('user'));
    if (_.isNil(user)) {
      this.router.navigate(['login']);
    } else {
      // Assign the data to the data source for the table to render
      this.firebaseService.getCollection('users').subscribe(users => {
        const usersWithPapers = [];
        users.forEach(item => {
          if (!_.isEmpty(item.papers)) {
            item.numberPapers = 0;
            item.numberPosters = 0;
            item.papers.forEach(paper => {
              item.numberPapers += 1;
              if (paper.poster) {
                item.numberPosters += 1;
              }
            });
            usersWithPapers.push(item);
          }
        });
        this.authors = new MatTableDataSource(usersWithPapers);
        this.authors.paginator = this.paginator;
        this.authors.sort = this.sort;
      });
      this.email = user.user;
      this.firebaseService.getCollection('config').subscribe(response => {
        this.year = response[0].conference_year;
        this.urlCMMSE = response[0].conference_url;
        window.sessionStorage.setItem('config', JSON.stringify(response[0]));
      });
    }
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.authors.filter = filterValue;
  }

  logOut() {
    window.sessionStorage.clear();
  }

}
