import { Component, OnInit, ViewChild, AfterViewInit, Inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatSnackBar, MatTableDataSource, MatPaginator, MatSort, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import * as _ from 'lodash';
import * as $ from 'jquery';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators/map';

import { AppConfig } from '../../config/app.config';
import { FirebaseCallerService } from '../../services/firebase-caller.service';
import { AngularFireStorage, AngularFireStorageReference, AngularFireUploadTask } from 'angularfire2/storage';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-paper',
  templateUrl: './paper.component.html',
  styleUrls: ['./paper.component.scss']
})
export class PaperComponent implements OnInit, AfterViewInit {

  year = AppConfig.year;
  urlCMMSE = AppConfig.urlCMMSE;
  minisymposiums = AppConfig.minisymposiums;
  paper = {
    'minisymposium': '',
    'title': '',
    'poster': false,
    'state': '_REVISION',
    'authors': {}
  };
  authors = [{
    'author': 1,
    'first_name': '',
    'last_name': '',
    'email': ''
  }];
  email;

  formControl = new FormControl('', [Validators.required]);

  // For upload file
  fileName;
  fileURL;
  progressBarValue;
  ref: AngularFireStorageReference;
  task: AngularFireUploadTask;
  uploadState: Observable<string>;
  uploadProgress: Observable<number>;
  downloadURL: Observable<string>;
  @ViewChild('fileInput') myInputVariable: any;

  // Table purposes
  displayedColumns = ['minisymposium', 'title', 'file', 'state', 'actions'];
  currentPapers: MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private storage: AngularFireStorage, private firebaseService: FirebaseCallerService, public dialog: MatDialog,
    private translationService: TranslateService, public snackBar: MatSnackBar, private router: Router) {
    const user = JSON.parse(window.sessionStorage.getItem('user'));
    // Assign the data to the data source for the table to render
    this.currentPapers = new MatTableDataSource(user.papers);
  }

  ngOnInit() {
    const user = JSON.parse(window.sessionStorage.getItem('user'));
    const storage = this.storage;
    if (_.isNil(user)) {
      window.location.href = window.location.href.split('user')[0] + 'login';
    } else {
      // Update table of papers
      const papers = _.remove(user.papers, function (n) {
        if (!_.isNil(n.authors)) {
          return n;
        } else {
          // Remove invalid paper from storage
          storage.ref('/papers/' + n.id_file).delete();
        }
      });
      user.papers = papers;
      this.firebaseService.updateItemFromCollection('users', user.id, user).then(() => {
        this.firebaseService.getItemFromCollection(user.email, 'users').subscribe(response => {
          window.sessionStorage.setItem('user', JSON.stringify(response[0]));
        });
      });
      this.email = user.email;
      this.fileName = '_FILE_NAME';
      this.fileURL = null;
      this.currentPapers = new MatTableDataSource(user.papers);
      this.currentPapers.paginator = this.paginator;
      this.currentPapers.sort = this.sort;
    }
  }

  /**
 * Set the paginator and sort after the view init since this component will
 * be able to query its view for the initialized paginator and sort.
 */
  ngAfterViewInit() {
    this.currentPapers.paginator = this.paginator;
    this.currentPapers.sort = this.sort;
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.currentPapers.filter = filterValue;
  }

  logOut() {
    window.sessionStorage.clear();
  }

  upload(event) {
    this.fileName = event.target.files[0].name;
    const user = JSON.parse(window.sessionStorage.getItem('user'));
    const numberOfPaper = user.papers ?
      (user.papers.length > 0 ? Number(user.papers[user.papers.length - 1].id_file.split('-')[1]) + 1 : 1) : 1;
    const id = 'paper' + user.id + '-' + numberOfPaper;
    this.ref = this.storage.ref(id);
    this.task = this.storage.upload('/papers/' + id, event.target.files[0]);
    this.uploadState = this.task.snapshotChanges().pipe(map(s => s.state));
    this.uploadProgress = this.task.percentageChanges();
    this.task.percentageChanges().subscribe((value) => {
      this.progressBarValue = value.toFixed(2).toString() + '%';
    });
    this.downloadURL = this.task.downloadURL();
    this.downloadURL.subscribe(url => {
      this.fileURL = url;
      let papers;
      if (user.papers) {
        papers = user.papers;
        const data = { 'id_file': id, 'name_file': this.fileName, 'url_file': url };
        papers.push(data);
        papers = { papers };
      } else {
        papers = { 'papers': [{ 'id_file': id, 'name_file': this.fileName, 'url_file': url }] };
      }
      this.firebaseService.updateItemFromCollection('users', user.id, papers).then(() => {
        this.firebaseService.getItemFromCollection(user.email, 'users').subscribe(response => {
          window.sessionStorage.setItem('user', JSON.stringify(response[0]));
        });
        this.translationService.get('_FILE_UPLOADED_SUCCESFULLY').subscribe(resp => {
          this.snackBar.open(resp, null, {
            duration: 2000,
          });
        });
      });
    });

  }

  openTabTo(url) {
    window.open(url);
  }

  removePaper() {
    this.fileURL = null;
    this.uploadState = null;
    this.fileName = '_FILE_NAME';
    this.myInputVariable.nativeElement.value = '';
    const user = JSON.parse(window.sessionStorage.getItem('user'));
    const numberOfPaper = user.papers.length;
    user.papers.pop();
    this.firebaseService.updateItemFromCollection('users', user.id, user);
    const id = 'paper' + user.id + '-' + numberOfPaper;
    this.storage.ref('/papers/' + id).delete().subscribe(() => {
      this.translationService.get('_FILE_DELETED_SUCCESFULLY').subscribe(resp => {
        this.snackBar.open(resp, null, {
          duration: 2000,
        });
      });
    });
  }

  submitPaper() {
    const user = JSON.parse(window.sessionStorage.getItem('user'));
    this.paper.authors = this.authors;
    user.papers[user.papers.length - 1] = _.merge(user.papers[user.papers.length - 1], this.paper);
    this.firebaseService.updateItemFromCollection('users', user.id, user).then(() => {
      this.firebaseService.getItemFromCollection(user.email, 'users').subscribe(response => {
        window.sessionStorage.setItem('user', JSON.stringify(response[0]));
      });
      this.translationService.get('_PAPER_DATA').subscribe(translate => {
        this.snackBar.open(translate, null, {
          duration: 2000,
        });
        // Removing all values and scrolling to top
        this.currentPapers = new MatTableDataSource(user.papers);
        this.currentPapers.paginator = this.paginator;
        this.currentPapers.sort = this.sort;
        this.paper = {
          'minisymposium': '',
          'title': '',
          'poster': false,
          'state': '_REVISION',
          'authors': {}
        };
        this.authors = [{
          'author': 1,
          'first_name': '',
          'last_name': '',
          'email': ''
        }];
        this.fileName = '_FILE_NAME';
        this.myInputVariable.nativeElement.value = '';
        this.uploadState = null;
        this.fileURL = null;
        const body = $('html, body');
        body.stop().animate({ scrollTop: 0 }, 500, 'swing');
      });
    });
  }

  submitDisabled() {
    let disabled = false;
    if (this.paper.minisymposium === '' || this.paper.title === '' || !(this.progressBarValue === '100.00%')) {
      disabled = true;
    } else {
      this.authors.forEach(author => {
        if (author.first_name === '' || author.last_name === '' || author.email === '' || !this.validateEmail(author.email)) {
          disabled = true;
        }
      });
    }
    return disabled;
  }

  validateEmail(email) {
    const re = /^[a-zA-Z0-9.!ñç#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    return re.test(String(email).toLowerCase());
  }

  addAuthor() {
    const authorNumber = this.authors.length + 1;
    const author = {
      'author': authorNumber,
      'first_name': '',
      'last_name': '',
      'email': ''
    };
    this.authors.push(author);
  }

  addDisabled() {
    if (this.authors.length < 10) {
      return false;
    } else {
      return true;
    }
  }

  removeAuthor() {
    this.authors.pop();
  }

  removeDisabled() {
    if (this.authors.length > 1) {
      return false;
    } else {
      return true;
    }
  }

  checkPapers() {
    const user = JSON.parse(window.sessionStorage.getItem('user'));
    if (user && user.papers && user.papers.length > 0 && user.papers[0].authors && user.papers[0].authors.length > 0) {
      return true;
    } else {
      return false;
    }
  }

  clickDeletePaper(paper): void {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      width: '400px',
      data: { paper: paper }
    });

    dialogRef.afterClosed().subscribe(result => {
      const user = JSON.parse(window.sessionStorage.getItem('user'));
      this.currentPapers = new MatTableDataSource(user.papers);
      this.currentPapers.paginator = this.paginator;
      this.currentPapers.sort = this.sort;
      console.log('The dialog was closed', result);
    });
  }

  editPaper(paper) {
    const dialogRef = this.dialog.open(EditPaperDialogComponent, {
      width: 'auto',
      data: { paper: paper }
    });

    dialogRef.afterClosed().subscribe(result => {
      const user = JSON.parse(window.sessionStorage.getItem('user'));
      this.currentPapers = new MatTableDataSource(user.papers);
      this.currentPapers.paginator = this.paginator;
      this.currentPapers.sort = this.sort;
      console.log('The dialog was closed', result);
    });

    dialogRef.updateSize('50%', 'auto');
  }

}

@Component({
  selector: 'app-edit-paper-dialog',
  templateUrl: 'edit-paper-dialog.html',
})
export class EditPaperDialogComponent {

  minisymposiums = AppConfig.minisymposiums;
  formControl = new FormControl('', [Validators.required]);

  constructor(
    public dialogRef: MatDialogRef<EditPaperDialogComponent>, private translationService: TranslateService, public snackBar: MatSnackBar,
    private firebaseService: FirebaseCallerService, @Inject(MAT_DIALOG_DATA) public data: any) { }

  onCloseClick(): void {
    this.dialogRef.close();
  }

  onSaveClick(): void {
    const user = JSON.parse(window.sessionStorage.getItem('user'));
    user.papers.forEach((paper, index) => {
      if (this.data.paper.id_file === paper.id_file) {
        user.papers[index] = this.data.paper;
      }
    });
    this.firebaseService.updateItemFromCollection('users', user.id, user).then(() => {
      this.firebaseService.getItemFromCollection(user.email, 'users').subscribe(response => {
        window.sessionStorage.setItem('user', JSON.stringify(response[0]));
      });
      this.translationService.get('_PAPER_UPDATED_SUCCESFULLY').subscribe(resp => {
        this.snackBar.open(resp, null, {
          duration: 2000,
        });
      });
    });
    this.dialogRef.close();
  }

  addAuthor() {
    const authorNumber = this.data.paper.authors.length + 1;
    const author = {
      'author': authorNumber,
      'first_name': '',
      'last_name': '',
      'email': ''
    };
    this.data.paper.authors.push(author);
  }

  addDisabled() {
    if (this.data.paper.authors.length < 10) {
      return false;
    } else {
      return true;
    }
  }

  removeAuthor() {
    this.data.paper.authors.pop();
  }

  removeDisabled() {
    if (this.data.paper.authors.length > 1) {
      return false;
    } else {
      return true;
    }
  }

  validateEmail(email) {
    const re = /^[a-zA-Z0-9.!ñç#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    return re.test(String(email).toLowerCase());
  }

  submitDialogDisabled() {
    let disabled = false;
    if (this.data.paper.minisymposium === '' || this.data.paper.title === '') {
      disabled = true;
    } else {
      this.data.paper.authors.forEach(author => {
        if (author.first_name === '' || author.last_name === '' || author.email === '' || !this.validateEmail(author.email)) {
          disabled = true;
        }
      });
    }
    return disabled;
  }

}

@Component({
  selector: 'app-confirm-delete-dialog',
  templateUrl: 'confirm-delete-dialog.html',
})
export class ConfirmDeleteDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<ConfirmDeleteDialogComponent>, private translationService: TranslateService,
    public snackBar: MatSnackBar, private storage: AngularFireStorage,
    private firebaseService: FirebaseCallerService, @Inject(MAT_DIALOG_DATA) public data: any) { }

  onCancelClick(): void {
    this.dialogRef.close();
  }

  removePaperFromTable(paper) {
    // Remove paper from storage
    this.storage.ref('/papers/' + paper.id_file).delete();
    // Update user and table of papers
    const user = JSON.parse(window.sessionStorage.getItem('user'));
    const papers = _.remove(user.papers, function (n) {
      if (n.id_file !== paper.id_file) {
        return n;
      }
    });
    user.papers = papers;
    this.firebaseService.updateItemFromCollection('users', user.id, user).then(() => {
      this.firebaseService.getItemFromCollection(user.email, 'users').subscribe(response => {
        window.sessionStorage.setItem('user', JSON.stringify(response[0]));
      });
      this.translationService.get('_PAPER_DELETED_SUCCESFULLY').subscribe(resp => {
        this.snackBar.open(resp, null, {
          duration: 2000,
        });
      });
    });
    this.dialogRef.close();
  }

}
