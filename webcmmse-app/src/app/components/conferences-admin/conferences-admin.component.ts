import { Component, OnInit, ViewChild, AfterViewInit, Inject } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort, MatDialog, MatSnackBar, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { AngularFireStorage } from 'angularfire2/storage';
import { FirebaseCallerService } from '../../services/firebase-caller.service';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import { Router } from '@angular/router';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-conferences-admin',
  templateUrl: './conferences-admin.component.html',
  styleUrls: ['./conferences-admin.component.scss']
})
export class ConferencesAdminComponent implements OnInit, AfterViewInit {

  year; urlCMMSE; email; conference;
  isNew = true;

  // Table purposes
  displayedColumns = ['value', 'papers', 'posters', 'actions'];
  conferences: MatTableDataSource<any>;
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
      this.firebaseService.getCollection('conferences').subscribe(response => {
        this.firebaseService.getCollection('users').subscribe(users => {
          response.forEach(conference => {
            conference.papers = 0;
            conference.posters = 0;
            users.forEach(item => {
              if (item.papers) {
                item.papers.forEach(paper => {
                  if (paper.minisymposium === conference.value) {
                    conference.papers = conference.papers + 1;
                    if (paper.poster) {
                      conference.posters = conference.posters + 1;
                    }
                  }
                });
              }
            });
          });
        });

        this.conferences = new MatTableDataSource(response);
        this.conferences.paginator = this.paginator;
        this.conferences.sort = this.sort;
      });
      this.email = user.user;
      this.firebaseService.getCollection('config').subscribe(response => {
        this.year = response[0].conference_year;
        this.urlCMMSE = response[0].conference_url;
      });
    }
  }

  /**
* Set the paginator and sort after the view init since this component will
* be able to query its view for the initialized paginator and sort.
*/
  ngAfterViewInit() {
    if (this.conferences) {
      this.conferences.paginator = this.paginator;
      this.conferences.sort = this.sort;
    }
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.conferences.filter = filterValue;
  }

  logOut() {
    window.sessionStorage.clear();
  }

  editConference(conference) {
    const dialogRef = this.dialog.open(EditConferenceDialogComponent, {
      width: 'auto',
      data: { conference: conference }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.firebaseService.getCollection('conferences').subscribe(() => {
        this.ngOnInit();
      });
    });

    dialogRef.updateSize('50%', 'auto');
  }

  clickDeleteConference(conference) {
    const dialogRef = this.dialog.open(ConfirmDeleteConferenceDialogComponent, {
      width: '400px',
      data: { conference: conference }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.firebaseService.getCollection('conferences').subscribe(() => {
        this.ngOnInit();
      });
    });
  }

  addConference() {
    const newConference = { value: this.conference };
    this.isNew = true;
    this.conferences.data.forEach(conference => {
      if (conference.value === newConference.value) {
        this.isNew = false;
      }
    });
    if (this.isNew) {
      this.firebaseService.addItemToCollection('conferences', newConference).then(() => {
        this.translationService.get('_CONFERENCE_ADDED_SUCCESFULLY').subscribe(resp => {
          this.snackBar.open(resp, null, {
            duration: 2000,
          });
        });
      });
    }
  }

  isDisabled() {
    if (this.conference === '' || this.conference === undefined) {
      return true;
    } else {
      return false;
    }
  }

}

@Component({
  selector: 'app-edit-conference-dialog',
  templateUrl: 'edit-conference-dialog.html',
})
export class EditConferenceDialogComponent {

  formControl = new FormControl('', [Validators.required]);

  constructor(
    public dialogRef: MatDialogRef<EditConferenceDialogComponent>,
    private translationService: TranslateService, public snackBar: MatSnackBar,
    private firebaseService: FirebaseCallerService, @Inject(MAT_DIALOG_DATA) public data: any) { }

  onCloseClick(): void {
    this.dialogRef.close();
  }

  onSaveClick(conference): void {
    this.firebaseService.updateItemFromCollection('conferences', conference.id, conference).then(() => {
      this.translationService.get('_CONFERENCE_UPDATED_SUCCESFULLY').subscribe(resp => {
        this.snackBar.open(resp, null, {
          duration: 2000,
        });
      });
    });
    this.dialogRef.close();
  }

  submitDialogDisabled(conference) {
    if (conference.value === '') {
      return true;
    }
    return false;
  }

}

@Component({
  selector: 'app-confirm-delete-conference-dialog',
  templateUrl: 'confirm-delete-conference-dialog.html',
})
export class ConfirmDeleteConferenceDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<ConfirmDeleteConferenceDialogComponent>, private translationService: TranslateService,
    public snackBar: MatSnackBar, private storage: AngularFireStorage,
    private firebaseService: FirebaseCallerService, @Inject(MAT_DIALOG_DATA) public data: any) { }

  onCancelClick(): void {
    this.dialogRef.close();
  }

  removeConferenceFromTable(conference) {
    this.firebaseService.deleteItemFromCollection('conferences', conference.conference.id).then(() => {
      this.translationService.get('_CONFERENCE_DELETED_SUCCESFULLY').subscribe(resp => {
        this.snackBar.open(resp, null, {
          duration: 2000,
        });
      });
    });
    this.dialogRef.close();
  }

}
