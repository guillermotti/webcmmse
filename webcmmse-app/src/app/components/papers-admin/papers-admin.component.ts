import { Component, OnInit, ViewChild, AfterViewInit, Inject } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort, MatDialog, MatSnackBar, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { AngularFireStorage } from 'angularfire2/storage';
import { FirebaseCallerService } from '../../services/firebase-caller.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import * as _ from 'lodash';
import { FormControl, Validators } from '@angular/forms';
import { AppConfig } from '../../config/app.config';

@Component({
  selector: 'app-papers-admin',
  templateUrl: './papers-admin.component.html',
  styleUrls: ['./papers-admin.component.scss']
})
export class PapersAdminComponent implements OnInit {

  year; urlCMMSE; email;
  status = ['_UPLOADED', '_REVISION', '_ACCEPTED', '_REJECTED', '_MAJOR/_MINOR'];

  // Table purposes
  displayedColumns = ['title', 'conference', 'corresponding_author', 'file', 'status', 'actions'];
  papers: MatTableDataSource<any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private storage: AngularFireStorage, private firebaseService: FirebaseCallerService, public dialog: MatDialog,
    private translationService: TranslateService, public snackBar: MatSnackBar, private router: Router) {

  }

  ngOnInit() {
    const user = JSON.parse(window.sessionStorage.getItem('user'));
    const papers = [];
    if (_.isNil(user)) {
      window.location.href = window.location.href.split('users-admin')[0] + 'login';
    } else {
      // Assign the data to the data source for the table to render
      const obser = this.firebaseService.getCollection('users').subscribe(response => {
        window.sessionStorage.setItem('users', JSON.stringify(response));
        response.forEach(item => {
          if (item.papers) {
            item.papers.forEach(paper => {
              papers.push(paper);
            });
          }
        });
        this.papers = new MatTableDataSource(papers);
        this.papers.paginator = this.paginator;
        this.papers.sort = this.sort;
        obser.unsubscribe();
      });
      this.email = user.user;
      const observable = this.firebaseService.getCollection('config').subscribe(response => {
        this.year = response[0].conference_year;
        this.urlCMMSE = response[0].conference_url;
        observable.unsubscribe();
      });
    }
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.papers.filter = filterValue;
  }

  logOut() {
    window.sessionStorage.clear();
  }

  changeStatus(paper) {
    const obser = this.firebaseService.getItemFromCollection(paper.id_file.split('paper')[1].split('-')[0], 'users').subscribe(response => {
      response[0].papers.forEach(item => {
        if (item.id_file === paper.id_file) {
          item.state = paper.state;
        }
      });
      this.firebaseService.updateItemFromCollection('users', response[0].id, response[0]).then(() => {
        const observable = this.firebaseService.getCollection('users').subscribe(resp => {
          window.sessionStorage.setItem('users', JSON.stringify(resp[0]));
          const papers = [];
          resp.forEach(itemUser => {
            if (itemUser.papers) {
              itemUser.papers.forEach(itemPaper => {
                papers.push(itemPaper);
              });
            }
          });
          this.papers = new MatTableDataSource(papers);
          this.papers.paginator = this.paginator;
          this.papers.sort = this.sort;
          observable.unsubscribe();
        });
        this.translationService.get('_STATUS_UPDATED_SUCCESFULLY').subscribe(resp => {
          this.snackBar.open(resp, null, {
            duration: 2000,
          });
        });
      });
      obser.unsubscribe();
    });
  }

  editUser(user) {
    /**const dialogRef = this.dialog.open(EditUserDialogComponent, {
      width: 'auto',
      data: { user: user }
    });

    dialogRef.afterClosed().subscribe(result => {
      const users = JSON.parse(window.sessionStorage.getItem('users'));
      this.users = new MatTableDataSource(users);
      this.users.paginator = this.paginator;
      this.users.sort = this.sort;
      console.log('The dialog was closed', result);
    });

    dialogRef.updateSize('50%', 'auto');**/
  }

  clickDeleteUser(user) {
    /**const dialogRef = this.dialog.open(ConfirmDeleteUserDialogComponent, {
      width: '400px',
      data: { user: user }
    });

    dialogRef.afterClosed().subscribe(result => {
      const users = JSON.parse(window.sessionStorage.getItem('users'));
      this.users = new MatTableDataSource(users);
      this.users.paginator = this.paginator;
      this.users.sort = this.sort;
      console.log('The dialog was closed', result);
    });**/
  }

}

/**@Component({
  selector: 'app-edit-user-dialog',
  templateUrl: 'edit-user-dialog.html',
})
export class EditUserDialogComponent implements OnInit {

  formControl = new FormControl('', [Validators.required]);
  edit = '_EDIT';
  colorChange = 'primary';
  fieldsDisabled = true;
  titles = AppConfig.titles;
  countries = AppConfig.countries;
  minisymposiums = [];

  constructor(
    public dialogRef: MatDialogRef<EditUserDialogComponent>, private translationService: TranslateService, public snackBar: MatSnackBar,
    private firebaseService: FirebaseCallerService, @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    this.firebaseService.getCollection('conferences').subscribe(response => {
      const values = [];
      const sortedValues = [];
      response.forEach(item => { // Taking values from response to sort them
        values.push(item.value);
      });
      values.sort().forEach(item => { // Sorting values and retorning to array
        sortedValues.push({ value: item });
      });
      this.minisymposiums = sortedValues;
    });
  }

  onCloseClick(): void {
    this.dialogRef.close();
  }

  onSaveClick(user): void {
    if (this.edit === '_EDIT') {
      this.edit = '_SAVE_CHANGES';
      this.colorChange = 'accent';
      this.fieldsDisabled = false;
    } else {
      this.firebaseService.updateItemFromCollection('users', user.id, user).then(() => {
        this.firebaseService.getCollection('users').subscribe(response => {
          window.sessionStorage.setItem('users', JSON.stringify(response));
          this.edit = '_EDIT';
          this.colorChange = 'primary';
          this.fieldsDisabled = true;
        });
        this.translationService.get('_USER_UPDATED_SUCCESFULLY').subscribe(resp => {
          this.snackBar.open(resp, null, {
            duration: 2000,
          });
        });
      });
      // this.dialogRef.close();
    }
  }

  validateEmail(email) {
    const re = /^[a-zA-Z0-9.!ñç#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    return re.test(String(email).toLowerCase());
  }

  submitDialogDisabled(user) {
    if (user.title === '' || user.first_name === '' || user.last_name === '' || user.university_company === '' || user.country === ''
      || user.email === '' || !this.validateEmail(user.email)) {
      return true;
    }
    return false;
  }

}

@Component({
  selector: 'app-confirm-delete-user-dialog',
  templateUrl: 'confirm-delete-user-dialog.html',
})
export class ConfirmDeleteUserDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<ConfirmDeleteUserDialogComponent>, private translationService: TranslateService,
    public snackBar: MatSnackBar, private storage: AngularFireStorage,
    private firebaseService: FirebaseCallerService, @Inject(MAT_DIALOG_DATA) public data: any) { }

  onCancelClick(): void {
    this.dialogRef.close();
  }

  removeUserFromTable(user) {
    // Update user and table of papers
    const users = JSON.parse(window.sessionStorage.getItem('users'));
    this.firebaseService.deleteItemFromCollection('users', user.user.id).then(() => {
      this.translationService.get('_USER_DELETED_SUCCESFULLY').subscribe(resp => {
        this.snackBar.open(resp, null, {
          duration: 2000,
        });
      });
    });

    this.dialogRef.close();
  }

}**/
