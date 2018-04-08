import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material';

import * as _ from 'lodash';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators/map';

import { AppConfig } from '../../config/app.config';
import { FirebaseCallerService } from '../../services/firebase-caller.service';
import { AngularFireStorage, AngularFireStorageReference, AngularFireUploadTask } from 'angularfire2/storage';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-payments-invoices',
  templateUrl: './payments-invoices.component.html',
  styleUrls: ['./payments-invoices.component.scss']
})
export class PaymentsInvoicesComponent implements OnInit {

  year = AppConfig.year;
  urlCMMSE = AppConfig.urlCMMSE;
  titles = AppConfig.titles;
  form = {
    'first_name': '',
    'last_name': '',
    'title': '',
    'country': '',
    'city': '',
    'state': '',
    'university_company': '',
    'postal_code': '',
    'address': '',
    'phone': '',
  };
  billForm = {
    'first_name': '',
    'last_name': '',
    'title': '',
    'address': '',
    'university_company': '',
    'CIF': ''
  };
  disabled = true;
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

  constructor(private storage: AngularFireStorage, private firebaseService: FirebaseCallerService,
    private translationService: TranslateService, public snackBar: MatSnackBar) { }

  ngOnInit() {
    const user = JSON.parse(window.sessionStorage.getItem('user'));
    if (_.isNil(user)) {
      window.location.href = window.location.href.split('payments-invoices')[0] + 'login';
    } else {
      this.form.title = user.title;
      this.form.address = user.address;
      this.form.city = user.city;
      this.form.country = user.country;
      this.form.last_name = user.last_name;
      this.form.first_name = user.first_name;
      this.form.phone = user.phone;
      this.form.postal_code = user.postal_code;
      this.form.state = user.state;
      this.form.university_company = user.university_company;
      this.email = user.email;
      this.fileName = user.payment_file ? user.payment_file.name_file : '_FILE_NAME';
      this.fileURL = user.payment_file ? user.payment_file.url_file : null;
      this.billForm.title = user.bill ? user.bill.title : '';
      this.billForm.first_name = user.bill ? user.bill.first_name : '';
      this.billForm.last_name = user.bill ? user.bill.last_name : '';
      this.billForm.address = user.bill ? user.bill.address : '';
      this.billForm.university_company = user.bill ? user.bill.university_company : '';
      this.billForm.CIF = user.bill ? user.bill.CIF : '';
    }
  }

  logOut() {
    window.sessionStorage.clear();
  }

  upload(event) {
    this.fileName = event.target.files[0].name;
    const user = JSON.parse(window.sessionStorage.getItem('user'));
    const id = 'payment' + user.id;
    this.ref = this.storage.ref(id);
    this.task = this.storage.upload('/payments/' + id, event.target.files[0]);
    this.uploadState = this.task.snapshotChanges().pipe(map(s => s.state));
    this.uploadProgress = this.task.percentageChanges();
    this.task.percentageChanges().subscribe((value) => {
      this.progressBarValue = value.toFixed(2).toString() + '%';
    });
    this.downloadURL = this.task.downloadURL();
    this.downloadURL.subscribe(url => {
      this.fileURL = url;
      const data = { 'payment_file': { 'id_file': id, 'name_file': this.fileName, 'url_file': url } };
      this.firebaseService.updateItemFromCollection('users', user.id, data).then(() => {
        this.firebaseService.getUserFromCollection(user.email, 'users').subscribe(response => {
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

  removePayment() {
    this.fileURL = null;
    this.uploadState = null;
    this.fileName = '_FILE_NAME';
    this.myInputVariable.nativeElement.value = '';
    const user = JSON.parse(window.sessionStorage.getItem('user'));
    const id = 'payment' + user.id;
    this.storage.ref('/payments/' + id).delete().subscribe(() => {
      this.translationService.get('_FILE_DELETED_SUCCESFULLY').subscribe(resp => {
        this.snackBar.open(resp, null, {
          duration: 2000,
        });
      });
    });
  }

  submitInvoiceData() {
    const user = JSON.parse(window.sessionStorage.getItem('user'));
    const billData = { 'bill': this.billForm };
    this.firebaseService.updateItemFromCollection('users', user.id, billData).then(() => {
      this.firebaseService.getUserFromCollection(user.email, 'users').subscribe(response => {
        window.sessionStorage.setItem('user', JSON.stringify(response[0]));
      });
      this.translationService.get('_INVOICE_DATA').subscribe(translate => {
        this.snackBar.open(translate, null, {
          duration: 2000,
        });
      });
    });
  }

  submitDisabled() {
    if (this.billForm.title === '' || this.billForm.first_name === '' || this.billForm.last_name === ''
      || this.billForm.university_company === '' || this.billForm.CIF === '' || this.billForm.address === '') {
      return true;
    }
  }

}
