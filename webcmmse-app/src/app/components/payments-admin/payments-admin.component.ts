import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort, MatDialog, MatSnackBar, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { AngularFireStorage } from 'angularfire2/storage';
import { FirebaseCallerService } from '../../services/firebase-caller.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import * as _ from 'lodash';
import * as jsPDF from 'jspdf';

@Component({
  selector: 'app-payments-admin',
  templateUrl: './payments-admin.component.html',
  styleUrls: ['./payments-admin.component.scss']
})
export class PaymentsAdminComponent implements OnInit {

  year; urlCMMSE; email; conference;
  isNew = true;

  // Table purposes
  displayedColumns = ['first_name', 'email', 'country', 'paymentFile', 'checkPayment', 'invoice'];
  payments: MatTableDataSource<any>;
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
        this.payments = new MatTableDataSource(users);
        this.payments.paginator = this.paginator;
        this.payments.sort = this.sort;
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
    this.payments.filter = filterValue;
  }

  logOut() {
    window.sessionStorage.clear();
  }

  checkPayment(user) {
    const dialogRef = this.dialog.open(ConfirmPaymentDialogComponent, {
      width: '400px',
      data: { user: user }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.firebaseService.getCollection('users').subscribe(users => {
        this.payments = new MatTableDataSource(users);
        this.payments.paginator = this.paginator;
        this.payments.sort = this.sort;
      });
    });
  }

  generateInvoice(user) {
    const config = JSON.parse(window.sessionStorage.getItem('config'));
    const initialDate = new Date(config.conference_initial_day);
    const endDate = new Date(config.conference_end_day);
    const today = new Date();
    let userTitle = user.bill ? user.bill.title : user.title;
    this.translationService.get(userTitle).subscribe(response => {
      userTitle = response;
    });
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    const waterMark = `<div style="position:absolute; width:100%; height:100%; opacity: 0.1">
      <img src="../../../assets/img/ave.jpg" style="width:120; height:170;"></div>`;
    const cmmseImage = `<div style="position:absolute; width:20%; height:20%; opacity: 0.1">
    <img src="../../../assets/img/CMMSE.jpg" style="width:70; height:45"></div>`;
    const sign = `<div style="position:absolute; width:100%; height:10%; opacity: 0.1">
    <img src="../../../assets/img/FirmaJesus.jpg" style="width:50; height:30"></div>`;
    doc.fromHTML(waterMark, 50, 50, {}, function () {
      doc.fromHTML(cmmseImage, 20, 0, {}, function () {
        doc.setFontSize(20);
        doc.setTextColor(0, 0, 255);
        doc.text(160, 18, 'CMMSE ' + config.conference_year, null, null, 'center');
        doc.setFontSize(8);
        doc.text(160, 22, 'International Conference on', null, null, 'center');
        doc.text(160, 25, 'Computational and Mathematical', null, null, 'center');
        doc.text(160, 28, 'Methods in Science and Engineering', null, null, 'center');
        doc.text(160, 31, monthNames[initialDate.getMonth()] + ' ' + initialDate.getDate()
          + ' - ' + endDate.getDate() + ', ' + config.conference_year, null, null, 'center');
        doc.text(160, 34, config.conference_place, null, null, 'center');
        doc.text(160, 37, config.conference_url, null, null, 'center');
        doc.text(160, 40, 'C.I.F. ' + config.CIF, null, null, 'center');
        doc.setFont('times');
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.setFontType('bolditalic');
        if (user.bill) {
          doc.text(105, 80, 'INVOICE Num. ' + user.bill.invoice_number, null, null, 'center');
        }
        doc.setFontSize(12);
        doc.setFontType('bold');
        if (user.bill) {
          doc.text(25, 100, userTitle + ' ' + user.bill.first_name + ' ' + user.bill.last_name);
          doc.text(25, 105, 'University/College/Company: ');
          doc.text(25, 110, 'Address: ');
          doc.text(25, 115, 'CIF/VAT Number/Tax ID: ');
          doc.text(25, 135, 'Description');
          doc.text(180, 135, 'Value', null, null, 'right');
          doc.setFontType('normal');
          doc.text(80, 105, user.bill.university_company);
          doc.text(43, 110, user.bill.address);
          doc.text(75, 115, user.bill.CIF);
        } else {
          doc.text(25, 100, userTitle + ' ' + user.first_name + ' ' + user.last_name);
          doc.text(25, 105, 'University/College/Company: ');
          doc.text(25, 110, 'Address: ');
          doc.text(25, 135, 'Description');
          doc.text(180, 135, 'Value', null, null, 'right');
          doc.setFontType('normal');
          doc.text(80, 105, user.university_company);
          doc.text(43, 110, user.address);
        }
        doc.rect(25, 136, 155, 0);
        doc.text(25, 140, 'CMMSE ' + config.conference_year + ' Registration Fee');
        doc.text(180, 140, config.fee_to_pay + ' euros', null, null, 'right');
        doc.text(180, 180, monthNames[today.getMonth()] + ' ' + today.getDate() + ', ' + today.getFullYear(), null, null, 'right');
        doc.setFontType('bold');
        doc.text(105, 250, 'Jesús Vigo Aguiar', null, null, 'center');
        doc.text(105, 255, 'President of the Organizing Committee', null, null, 'center');
        doc.text(105, 260, 'CMMSE ' + config.conference_year, null, null, 'center');
        doc.fromHTML(sign, 85, 215, {}, function () {
          doc.save(user.first_name.replace(/\s/g, '') + user.last_name.replace(/\s/g, '') + 'Invoice.pdf');
        });
      });
    });
  }

}

@Component({
  selector: 'app-confirm-payment-dialog',
  templateUrl: 'confirm-payment-dialog.html',
})
export class ConfirmPaymentDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<ConfirmPaymentDialogComponent>, private translationService: TranslateService,
    public snackBar: MatSnackBar, private storage: AngularFireStorage,
    private firebaseService: FirebaseCallerService, @Inject(MAT_DIALOG_DATA) public data: any) { }

  onCancelClick(): void {
    this.dialogRef.close();
  }

  changeStatusPayment(user) {
    const observable = this.firebaseService.getCollection('config').subscribe(response => {
      if (user.check_payment === true && user.bill && _.isNil(user.bill.invoice_number)) {
        if (user.country === 'Spain') {
          user.bill.invoice_number = response[0].bill_spain;
          response[0].bill_spain = response[0].bill_spain + 1;
        } else {
          user.bill.invoice_number = response[0].bill_other;
          response[0].bill_other = response[0].bill_other - 1;
        }
        this.firebaseService.updateItemFromCollection('config', response[0].id, response[0]);
      }
      this.firebaseService.updateItemFromCollection('users', user.id, user).then(() => {
        this.translationService.get('_USER_PAYMENT_UPDATED_SUCCESFULLY').subscribe(resp => {
          this.snackBar.open(resp, null, {
            duration: 2000,
          });
        });
        this.dialogRef.close();
      });
      observable.unsubscribe();
    });

  }

}
