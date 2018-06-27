import { Component, OnInit, ViewChild, AfterViewInit, Inject } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort, MatDialog, MatSnackBar, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { AngularFireStorage, AngularFireStorageReference, AngularFireUploadTask } from 'angularfire2/storage';
import { FirebaseCallerService } from '../../services/firebase-caller.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import * as _ from 'lodash';
import { FormControl, Validators } from '@angular/forms';
import { AppConfig } from '../../config/app.config';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';
import { CryptoService } from '../../services/crypto.service';
import { MailSenderService } from '../../services/mail-sender.service';

@Component({
  selector: 'app-papers-admin',
  templateUrl: './papers-admin.component.html',
  styleUrls: ['./papers-admin.component.scss']
})
export class PapersAdminComponent implements OnInit {

  year; urlCMMSE; email; emailSender; emailPass; emailBCC; emailOpen; emailPaper;
  status = ['_UPLOADED', '_REVISION', '_ACCEPTED', '_REJECTED', '_MAJOR/_MINOR'];

  // Table purposes
  displayedColumns = ['title', 'conference', 'corresponding_author', 'file', 'status', 'actions'];
  papers: MatTableDataSource<any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private storage: AngularFireStorage, private firebaseService: FirebaseCallerService, public dialog: MatDialog,
    private translationService: TranslateService, public snackBar: MatSnackBar, private mailSenderService: MailSenderService,
    private router: Router, private cryptoService: CryptoService) {

  }

  ngOnInit() {
    const user = JSON.parse(window.sessionStorage.getItem('user'));
    const papers = [];
    if (_.isNil(user)) {
      this.router.navigate(['login']);
    } else {
      // Assign the data to the data source for the table to render
      const obser = this.firebaseService.getCollection('users').subscribe(response => {
        window.sessionStorage.setItem('users', JSON.stringify(response));
        response.forEach(item => {
          if (item.papers) {
            item.papers.forEach(paper => {
              paper.corresponding_author = paper.authors[0].email;
              paper.conference = paper.minisymposium;
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
        this.emailBCC = response[0].emails;
        this.emailSender = response[0].email_sender;
        this.emailPass = this.cryptoService.decrypt(response[0].email_password);
        this.emailOpen = response[0].email_opened;
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
      this.emailPaper = response[0].email;
      response[0].papers.forEach(item => {
        if (item.id_file === paper.id_file) {
          item.state = paper.state;
        }
      });
      this.firebaseService.updateItemFromCollection('users', response[0].id, response[0]).then(() => {
        const observable = this.firebaseService.getCollection('users').subscribe(resp => {
          window.sessionStorage.setItem('users', JSON.stringify(resp));
          const papers = [];
          resp.forEach(itemUser => {
            if (itemUser.papers) {
              itemUser.papers.forEach(itemPaper => {
                itemPaper.corresponding_author = itemPaper.authors[0].email;
                itemPaper.conference = itemPaper.minisymposium;
                papers.push(itemPaper);
              });
            }
          });
          this.translationService.get(paper.state).subscribe(translation => {
            const form = {
              year: this.year, emailSender: this.emailSender, url: paper.url_file,
              author: paper.authors[0].first_name + ' ' + paper.authors[0].last_name, authorEmail: paper.authors[0].email,
              emailPass: this.emailPass, state: translation, title: paper.title, name: _.capitalize(response[0].first_name),
              bcc: this.emailBCC, email: [this.emailPaper, this.emailSender]
            };
            if (this.emailOpen) {
              const obser2 = this.mailSenderService.sendChangePaperStatusMessage(form).subscribe(() => {
                console.log('Mensaje enviado correctamente');
                obser2.unsubscribe();
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

  editPaper(paper) {
    const dialogRef = this.dialog.open(EditPaperAdminDialogComponent, {
      width: 'auto',
      data: { paper: paper }
    });

    const obser = dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.firebaseService.updateItemFromCollection('users', result[0].id, result[0]).then(() => {
          this.translationService.get('_PAPER_UPDATED_SUCCESFULLY').subscribe(resp => {
            this.snackBar.open(resp, null, {
              duration: 2000,
            });
          });
        });
        const papers = [];
        const obser2 = this.firebaseService.getCollection('users').subscribe(response => {
          window.sessionStorage.setItem('users', JSON.stringify(response));
          response.forEach(item => {
            if (item.papers) {
              item.papers.forEach(paperItem => {
                paperItem.corresponding_author = paperItem.authors[0].email;
                paperItem.conference = paperItem.minisymposium;
                papers.push(paperItem);
              });
            }
          });
          this.papers = new MatTableDataSource(papers);
          this.papers.paginator = this.paginator;
          this.papers.sort = this.sort;
          obser2.unsubscribe();
        });
      }
      console.log('The dialog was closed', result);
      obser.unsubscribe();
    });

    dialogRef.updateSize('50%', 'auto');
  }

  clickDeletePaper(paper) {
    const dialogRef = this.dialog.open(ConfirmDeletePaperAdminDialogComponent, {
      width: '400px',
      data: { paper: paper }
    });

    const obser = dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.firebaseService.updateItemFromCollection('users', result[0].id, result[0]).then(() => {
          this.translationService.get('_PAPER_DELETED_SUCCESFULLY').subscribe(resp => {
            this.snackBar.open(resp, null, {
              duration: 2000,
            });
          });
        });
        const papers = [];
        const obser2 = this.firebaseService.getCollection('users').subscribe(response => {
          window.sessionStorage.setItem('users', JSON.stringify(response));
          response.forEach(item => {
            if (item.papers) {
              item.papers.forEach(paperItem => {
                paperItem.corresponding_author = paperItem.authors[0].email;
                paperItem.conference = paperItem.minisymposium;
                papers.push(paperItem);
              });
            }
          });
          this.papers = new MatTableDataSource(papers);
          this.papers.paginator = this.paginator;
          this.papers.sort = this.sort;
          obser2.unsubscribe();
        });
      }
      console.log('The dialog was closed', result);
      obser.unsubscribe();
    });
  }

}

@Component({
  selector: 'app-edit-paper-admin-dialog',
  templateUrl: 'edit-paper-admin-dialog.html',
})
export class EditPaperAdminDialogComponent implements OnInit {

  minisymposiums = [];
  formControl = new FormControl('', [Validators.required]);
  // For upload file
  fileName; fileURL; progressBarValue;
  ref: AngularFireStorageReference;
  task: AngularFireUploadTask;
  uploadState: Observable<string>;
  uploadProgress: Observable<number>;
  downloadURL: Observable<string>;
  @ViewChild('fileInput') myInputVariable: any;

  constructor(
    public dialogRef: MatDialogRef<EditPaperAdminDialogComponent>,
    private translationService: TranslateService, public snackBar: MatSnackBar,
    private firebaseService: FirebaseCallerService, @Inject(MAT_DIALOG_DATA) public data: any, private storage: AngularFireStorage) { }

  ngOnInit() {
    const obser = this.firebaseService.getCollection('conferences').subscribe(response => {
      const values = [];
      const sortedValues = [];
      response.forEach(item => { // Taking values from response to sort them
        values.push(item.value);
      });
      values.sort().forEach(item => { // Sorting values and retorning to array
        sortedValues.push({ value: item });
      });
      this.minisymposiums = sortedValues;
      obser.unsubscribe();
    });
    this.fileURL = this.data.paper.url_file;
    this.fileName = this.data.paper.name_file !== '' ? this.data.paper.name_file : '_FILE_NAME';
  }

  upload(event) {
    this.fileName = event.target.files[0].name;
    const user = JSON.parse(window.sessionStorage.getItem('user'));
    const id = this.data.paper.id_file;
    this.ref = this.storage.ref(id);
    this.task = this.storage.upload('/papers/' + id, event.target.files[0]);
    this.uploadState = this.task.snapshotChanges().pipe(map(s => s.state));
    this.uploadProgress = this.task.percentageChanges();
    this.task.percentageChanges().subscribe((value) => {
      this.progressBarValue = value.toFixed(2).toString() + '%';
    });
    this.downloadURL = this.task.downloadURL();
    const obser = this.downloadURL.subscribe(url => {
      this.fileURL = url;
      user.papers.forEach((paper, index) => {
        if (this.data.paper.id_file === paper.id_file) {
          paper.name_file = this.fileName;
          this.data.paper.name_file = this.fileName;
          paper.url_file = url;
          this.data.url_file = url;
          user.papers[index] = paper;
        }
      });
      this.firebaseService.updateItemFromCollection('users', user.id, user).then(() => {
        const obser2 = this.firebaseService.getUserFromCollection(user.email).subscribe(response => {
          window.sessionStorage.setItem('user', JSON.stringify(response[0]));
          obser2.unsubscribe();
        });
        this.translationService.get('_FILE_UPLOADED_SUCCESFULLY').subscribe(resp => {
          this.snackBar.open(resp, null, {
            duration: 2000,
          });
        });
      });
      obser.unsubscribe();
    });

  }

  openTabTo(url) {
    window.open(url);
  }

  removePaper() {
    const userId = this.data.paper.id_file.split('paper')[1].split('-')[0];
    const obser = this.firebaseService.getItemFromCollection(userId, 'users').subscribe(response => {
      response[0].papers.forEach((paper, index) => {
        if (this.data.paper.id_file === paper.id_file) {
          paper.name_file = '';
          paper.url_file = '';
          response[0].papers[index] = paper;
          const numberOfPaper = index + 1;
          const id = 'paper' + response[0].id + '-' + numberOfPaper;
          this.storage.ref('/papers/' + id).delete().subscribe(() => {
            this.translationService.get('_FILE_DELETED_SUCCESFULLY').subscribe(resp => {
              this.snackBar.open(resp, null, {
                duration: 2000,
              });
            });
          });
        }
      });
      this.fileURL = null;
      this.uploadState = null;
      this.fileName = '_FILE_NAME';
      this.myInputVariable.nativeElement.value = '';
      this.firebaseService.updateItemFromCollection('users', response[0].id, response[0]);
      window.sessionStorage.setItem('user', JSON.stringify(response[0]));
      obser.unsubscribe();
    });
  }

  onCloseClick(): void {
    this.dialogRef.close();
  }

  onSaveClick(paper): void {
    const obser = this.firebaseService.getItemFromCollection(paper.id_file.split('paper')[1].split('-')[0], 'users').subscribe(response => {
      response[0].papers.forEach(item => {
        if (item.id_file === paper.id_file) {
          item.title = paper.title;
          item.minisymposium = paper.minisymposium;
          item.poster = paper.poster;
          item.authors = paper.authors;
        }
      });
      this.dialogRef.close(response);
      obser.unsubscribe();
    });
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

  isAllDisabled() {
    if (this.data.paper.state === '_REVISION' || this.data.paper.state === '_ACCEPTED' || this.data.paper.state === '_REJECTED') {
      return true;
    } else {
      return false;
    }
  }

  isAuthorDisabled(index) {
    if (index === 0 && (this.data.paper.state === '_MAJOR/_MINOR' || this.isAllDisabled())) {
      return true;
    } else {
      return this.isAllDisabled();
    }
  }

}

@Component({
  selector: 'app-confirm-delete-paper-admin-dialog',
  templateUrl: 'confirm-delete-paper-admin-dialog.html',
})
export class ConfirmDeletePaperAdminDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<ConfirmDeletePaperAdminDialogComponent>, private translationService: TranslateService,
    public snackBar: MatSnackBar, private storage: AngularFireStorage,
    private firebaseService: FirebaseCallerService, @Inject(MAT_DIALOG_DATA) public data: any) { }

  onCancelClick(): void {
    this.dialogRef.close();
  }

  removePaperFromTable(paper) {
    const obser = this.firebaseService.getItemFromCollection(paper.id_file.split('paper')[1].split('-')[0], 'users').subscribe(response => {
      response[0].papers.forEach(item => {
        if (item.id_file === paper.id_file) {
          response[0].papers = _.pull(response[0].papers, item);
        }
      });
      obser.unsubscribe();
      this.dialogRef.close(response);
    });
  }

}
