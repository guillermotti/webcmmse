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
  displayedColumns = ['first_name', 'email', 'country', 'paymentFile', 'tax', 'checkPayment', 'invoice'];
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

    const obser = dialogRef.afterClosed().subscribe(result => {
      const obser2 = this.firebaseService.getCollection('users').subscribe(users => {
        this.payments = new MatTableDataSource(users);
        this.payments.paginator = this.paginator;
        this.payments.sort = this.sort;
        obser2.unsubscribe();
      });
      obser.unsubscribe();
    });
  }

  changeTax(user) {
    this.firebaseService.updateItemFromCollection('users', user.id, user).then(() => {
      this.translationService.get('_USER_PAYMENT_UPDATED_SUCCESFULLY').subscribe(resp => {
        this.snackBar.open(resp, null, {
          duration: 2000,
        });
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
    const htmlImages =
      `<div><img src="../../../assets/img/CMMSE.jpg" style="position:absolute;
        margin-left:85px; margin-top:10px; width:70; height:45;"></div>
      <div><img src="../../../assets/img/ave.jpg" style="position:absolute;
        margin-left:180px; margin-top:20px; width:120; height:170;"></div>
      <div><img src="../../../assets/img/FirmaJesus.jpg" style="position:absolute;
        margin-left:325px; margin-top:-20px; width:50; height:30"></div>`;
    doc.fromHTML(htmlImages, 0, 0, {}, function () {
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
      doc.setFontType('normal');
      doc.text(25, 100, 'Bill To');
      doc.setFontType('bold');
      doc.text(25, 105, user.bill ? user.bill.university_company : user.university_company);
      doc.setFontType('normal');
      doc.text(25, 110, 'VAT Number: ' + (user.bill ? user.bill.CIF : ''));
      doc.text(25, 115, user.bill ? user.bill.address : user.address);
      // doc.text(25, 100, userTitle + ' ' + user.bill ? user.bill.first_name : user.first_name + ' ' +
      // user.bill ? user.bill.last_name : user.last_name);
      doc.setFontType('bold');
      doc.setFontSize(10);
      doc.text(25, 135, 'Description');
      doc.text(180, 135, 'Amount', null, null, 'right');
      doc.setFontType('normal');
      doc.rect(25, 136, 155, 0);
      doc.text(25, 140, 'Registration Fee of ' + userTitle + ' ' + (user.bill ? user.bill.first_name : user.first_name) + ' ' +
        (user.bill ? user.bill.last_name : user.last_name));
      doc.text(180, 140, user.tax + ' €', null, null, 'right');
      doc.setFontSize(9);
      doc.text(180, 160, 'Exempt of TAX by Resolution of the Spanish Tax Agency dated 16 March 2001', null, null, 'right');
      doc.setFontSize(12);
      doc.text(180, 180, monthNames[today.getMonth()] + ' ' + today.getDate() + ', ' + today.getFullYear(), null, null, 'right');
      doc.setFontSize(9);
      doc.text(25, 185, 'Payable by Bank Transfer to:');
      doc.text(25, 188, 'Account owner: CMMSE');
      doc.text(25, 191, 'Concept: Name of Participant');
      doc.text(25, 194, 'Bank Name: OPEN BANK');
      doc.text(25, 197, 'SWIFT CODE: OPENESMM');
      doc.text(25, 200, 'IBAN: ES 84 0073 0100 51 0452638051');
      doc.text(25, 203, 'Address of the bank: Ciudad Grupo Santander. Av. Cantabria s/n, 28660. Boadilla del Monte – Madrid');
      doc.setFontType('bold');
      doc.setFontSize(12);
      doc.text(105, 250, 'Jesús Vigo Aguiar', null, null, 'center');
      doc.text(105, 255, 'President of the Organizing Committee', null, null, 'center');
      doc.text(105, 260, 'CMMSE ' + config.conference_year, null, null, 'center');
      doc.setFontSize(9);
      doc.setFontType('normal');
      doc.text(105, 280, 'CMMSE C/ Cordel Merinas 163 Bajo 37008 Salamanca Spain', null, null, 'center');
      doc.save(user.first_name.replace(/\s/g, '') + user.last_name.replace(/\s/g, '') + 'Invoice.pdf');
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
        user.bill.invoice_number = response[0].bill_number;
        response[0].bill_number = response[0].bill_number + 1;
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
