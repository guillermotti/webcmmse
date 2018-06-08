import { Component, OnInit, ViewChild, AfterViewInit, Inject } from '@angular/core';
import * as _ from 'lodash';
import { AppConfig } from '../../config/app.config';
import { MatTableDataSource, MatPaginator, MatSort, MatDialog, MatSnackBar, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { AngularFireStorage } from 'angularfire2/storage';
import { FirebaseCallerService } from '../../services/firebase-caller.service';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-users-admin',
  templateUrl: './users-admin.component.html',
  styleUrls: ['./users-admin.component.scss']
})
export class UsersAdminComponent implements OnInit, AfterViewInit {

  year; urlCMMSE; email;

  // Table purposes
  displayedColumns = ['first_name', 'last_name', 'email', 'university_company', 'country', 'actions'];
  users: MatTableDataSource<any>;
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
      this.firebaseService.getCollection('users').subscribe(response => {
        window.sessionStorage.setItem('users', JSON.stringify(response));
        this.users = new MatTableDataSource(response);
        this.users.paginator = this.paginator;
        this.users.sort = this.sort;
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
    if (this.users) {
      this.users.paginator = this.paginator;
      this.users.sort = this.sort;
    }
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.users.filter = filterValue;
  }

  logOut() {
    window.sessionStorage.clear();
  }

  editUser(user) {
    const dialogRef = this.dialog.open(EditUserDialogComponent, {
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

    dialogRef.updateSize('50%', 'auto');
  }

  clickDeleteUser(user) {
    const dialogRef = this.dialog.open(ConfirmDeleteUserDialogComponent, {
      width: '400px',
      data: { user: user }
    });

    dialogRef.afterClosed().subscribe(result => {
      const users = JSON.parse(window.sessionStorage.getItem('users'));
      this.users = new MatTableDataSource(users);
      this.users.paginator = this.paginator;
      this.users.sort = this.sort;
      console.log('The dialog was closed', result);
    });
  }

}

@Component({
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

  resetDocuments(user) {
    if (user.attendance_downloaded === true) {
      user.attendance_downloaded = false;
    }
    if (user.invoice_downloaded === true) {
      user.invoice_downloaded = false;
    }
    if (user.presentation_downloaded === true) {
      user.presentation_downloaded = false;
    }
    this.firebaseService.updateItemFromCollection('users', user.id, user).then(() => {
      this.firebaseService.getCollection('users').subscribe(response => {
        window.sessionStorage.setItem('users', JSON.stringify(response));
      });
      this.translationService.get('_DOCUMENTS_RESETED_SUCCESFULLY').subscribe(resp => {
        this.snackBar.open(resp, null, {
          duration: 2000,
        });
      });
    });
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

}
