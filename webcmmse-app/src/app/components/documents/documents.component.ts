import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatSnackBar, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { FirebaseCallerService } from '../../services/firebase-caller.service';
import * as _ from 'lodash';
import * as jsPDF from 'jspdf';

@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss']
})
export class DocumentsComponent implements OnInit {

  year; urlCMMSE; email; check_payment; invoice_downloaded; attendance_downloaded; presentation_downloaded; paper;

  constructor(public dialog: MatDialog, private translateService: TranslateService,
    private firebaseService: FirebaseCallerService, public snackBar: MatSnackBar) { }

  ngOnInit() {
    const user = JSON.parse(window.sessionStorage.getItem('user'));
    if (_.isNil(user)) {
      window.location.href = window.location.href.split('user')[0] + 'login';
    } else {
      this.firebaseService.getUserFromCollection(user.email).subscribe(response => {
        window.sessionStorage.setItem('user', JSON.stringify(response[0]));
        this.check_payment = response[0].check_payment;
        this.invoice_downloaded = response[0].invoice_downloaded;
        this.attendance_downloaded = response[0].attendance_downloaded;
        this.presentation_downloaded = response[0].presentation_downloaded;
      });
      this.firebaseService.getCollection('config').subscribe(response => {
        this.year = response[0].conference_year;
        this.urlCMMSE = response[0].conference_url;
        window.sessionStorage.setItem('config', JSON.stringify(response[0]));
      });
      this.email = user.email;
      this.paper = false;
      user.papers.forEach(paper => {
        if (paper.state === '_ACCEPTED') {
          this.paper = true;
        }
      });
    }
  }

  logOut() {
    window.sessionStorage.clear();
  }

  generateInvoice() {
    const user = JSON.parse(window.sessionStorage.getItem('user'));
    const config = JSON.parse(window.sessionStorage.getItem('config'));
    const initialDate = new Date(config.conference_initial_day);
    const endDate = new Date(config.conference_end_day);
    const today = new Date();
    let userTitle = user.bill ? user.bill.title : user.title;
    this.translateService.get(userTitle).subscribe(response => {
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
        if (user.address) {
          doc.text(25, 110, 'Address: ');
        }
        doc.text(25, 135, 'Description');
        doc.text(180, 135, 'Value', null, null, 'right');
        doc.setFontType('normal');
        doc.text(80, 105, user.university_company);
        doc.text(43, 110, user.address);
      }
      doc.rect(25, 136, 155, 0);
      doc.text(25, 140, 'CMMSE ' + config.conference_year + ' Registration Fee');
      doc.text(180, 140, user.tax + ' euros', null, null, 'right');
      doc.text(180, 180, monthNames[today.getMonth()] + ' ' + today.getDate() + ', ' + today.getFullYear(), null, null, 'right');
      doc.setFontType('bold');
      doc.text(105, 250, 'Jesús Vigo Aguiar', null, null, 'center');
      doc.text(105, 255, 'President of the Organizing Committee', null, null, 'center');
      doc.text(105, 260, 'CMMSE ' + config.conference_year, null, null, 'center');
      doc.save(user.first_name.replace(/\s/g, '') + user.last_name.replace(/\s/g, '') + 'Invoice.pdf');
    });

    user.invoice_downloaded = true;
    this.firebaseService.updateItemFromCollection('users', user.id, user).then(() => {
      const obser = this.firebaseService.getUserFromCollection(user.email).subscribe(response => {
        window.sessionStorage.setItem('user', JSON.stringify(response[0]));
        this.ngOnInit();
        obser.unsubscribe();
      });
    });
  }

  generateAttendance() {
    const user = JSON.parse(window.sessionStorage.getItem('user'));
    const config = JSON.parse(window.sessionStorage.getItem('config'));
    const initialDate = new Date(config.conference_initial_day);
    const endDate = new Date(config.conference_end_day);
    const certificateDate = new Date(config.certificate_signature);
    const today = new Date();
    let userTitle = '';
    this.translateService.get(user.title).subscribe(response => {
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
      <div><img src="../../../assets/img/FirmaBruce.jpg" style="position:absolute;
        margin-left:180px; margin-top:40px; width:50; height:30"></div>
      <div><img src="../../../assets/img/FirmaJesus.jpg" style="position:absolute;
        margin-left:430px; margin-top:-110px; width:50; height:30"></div>`;
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
      doc.text(20, 80, 'The Organizing Committee of the ');
      doc.setTextColor(0, 0, 255);
      doc.text(88, 80, 'International Conference on Computational and');
      doc.text(20, 85, 'Mathematical Methods in Science and Engineering CMMSE ' + today.getFullYear());
      doc.setTextColor(0, 0, 0);
      doc.setFontType('bold');
      doc.text(152, 85, ' CERTIFIES:');
      doc.text(20, 100, userTitle + ' ' + user.first_name + ' ' + user.last_name);
      doc.setFontType('normal');
      doc.text(20, 105, 'Has attended at the International Conference on Computational and Mathematical');
      doc.text(20, 110, 'Methods in Science and Engineering.');
      if (certificateDate) {
        doc.text(180, 180, monthNames[certificateDate.getMonth()] + ' ' +
          certificateDate.getDate() + ', ' + certificateDate.getFullYear(), null, null, 'right');
      } else {
        doc.text(180, 180, monthNames[today.getMonth()] + ' ' + today.getDate() + ', ' + today.getFullYear(), null, null, 'right');
      }
      doc.text(20, 220, 'Sincerely,');
      doc.text(55, 270, 'Bruce A. Wade');
      doc.text(120, 270, 'J. Vigo-Aguiar');
      doc.save(user.first_name + user.last_name + 'AttendanceCertificate.pdf');
    });

    user.attendance_downloaded = true;
    this.firebaseService.updateItemFromCollection('users', user.id, user).then(() => {
      const obser = this.firebaseService.getUserFromCollection(user.email).subscribe(response => {
        window.sessionStorage.setItem('user', JSON.stringify(response[0]));
        this.ngOnInit();
        obser.unsubscribe();
      });
    });
  }

  generatePresentation() {
    const user = JSON.parse(window.sessionStorage.getItem('user'));
    const config = JSON.parse(window.sessionStorage.getItem('config'));
    const initialDate = new Date(config.conference_initial_day);
    const endDate = new Date(config.conference_end_day);
    const certificateDate = new Date(config.certificate_signature);
    const today = new Date();
    let userTitle = '';
    this.translateService.get(user.title).subscribe(response => {
      userTitle = response;
    });
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const htmlImages =
      `<div><img src="../../../assets/img/CMMSE.jpg" style="position:absolute;
        margin-left:85px; margin-top:10px; width:70; height:45;"></div>
      <div><img src="../../../assets/img/ave.jpg" style="position:absolute;
        margin-left:180px; margin-top:20px; width:120; height:170;"></div>
      <div><img src="../../../assets/img/FirmaBruce.jpg" style="position:absolute;
        margin-left:180px; margin-top:40px; width:50; height:30"></div>
      <div><img src="../../../assets/img/FirmaJesus.jpg" style="position:absolute;
        margin-left:430px; margin-top:-110px; width:50; height:30"></div>`;
    user.papers.forEach((paper, index) => {
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
        doc.text(20, 80, 'The Organizing Committee of the ');
        doc.setTextColor(0, 0, 255);
        doc.text(88, 80, 'International Conference on Computational and');
        doc.text(20, 85, 'Mathematical Methods in Science and Engineering CMMSE ' + today.getFullYear());
        doc.setTextColor(0, 0, 0);
        doc.setFontType('bold');
        doc.text(152, 85, ' CERTIFIES:');
        doc.text(20, 100, userTitle + ' ' + user.first_name + ' ' + user.last_name);
        doc.setFontType('normal');
        doc.text(20, 105, 'Has presented a seminar at the International Conference on Computational and');
        doc.text(20, 110, 'Mathematical Methods in Science and Engineering entitled:');
        doc.setFontType('bold');
        doc.text(100, 118, paper.title, null, null, 'center');
        doc.setFontType('normal');
        if (certificateDate) {
          doc.text(180, 180, monthNames[certificateDate.getMonth()] + ' ' +
            certificateDate.getDate() + ', ' + certificateDate.getFullYear(), null, null, 'right');
        } else {
          doc.text(180, 180, monthNames[today.getMonth()] + ' ' + today.getDate() + ', ' + today.getFullYear(), null, null, 'right');
        }
        doc.text(20, 220, 'Sincerely,');
        doc.text(55, 270, 'Bruce A. Wade');
        doc.text(120, 270, 'J. Vigo-Aguiar');
        if (index < user.papers.length - 1) {
          doc.addPage();
        } else {
          doc.save('PresentationCertificate.pdf');
        }
      });
    });

    user.presentation_downloaded = true;
    this.firebaseService.updateItemFromCollection('users', user.id, user).then(() => {
      const obser = this.firebaseService.getUserFromCollection(user.email).subscribe(response => {
        window.sessionStorage.setItem('user', JSON.stringify(response[0]));
        this.ngOnInit();
        obser.unsubscribe();
      });
    });
  }

  downloadInvoice() {
    const dialogRef = this.dialog.open(ConfirmDownloadDocumentDialogComponent, {
      width: '400px',
      data: { document: 'invoice' }
    });

    const obser = dialogRef.afterClosed().subscribe(result => {
      if (result === 'invoice') {
        this.generateInvoice();
      }
      console.log('The dialog was closed', result);
      obser.unsubscribe();
    });
  }

  downloadAttendance() {
    const dialogRef = this.dialog.open(ConfirmDownloadDocumentDialogComponent, {
      width: '400px',
      data: { document: 'attendance' }
    });

    const obser = dialogRef.afterClosed().subscribe(result => {
      if (result === 'attendance') {
        this.generateAttendance();
      }
      console.log('The dialog was closed', result);
      obser.unsubscribe();
    });
  }

  downloadPresentation() {
    const dialogRef = this.dialog.open(ConfirmDownloadDocumentDialogComponent, {
      width: '400px',
      data: { document: 'presentation' }
    });

    const obser = dialogRef.afterClosed().subscribe(result => {
      if (result === 'presentation') {
        this.generatePresentation();
      }
      console.log('The dialog was closed', result);
      obser.unsubscribe();
    });
  }

}

@Component({
  selector: 'app-confirm-download-document-dialog',
  templateUrl: 'confirm-download-document-dialog.html',
})
export class ConfirmDownloadDocumentDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<ConfirmDownloadDocumentDialogComponent>, private translationService: TranslateService,
    public snackBar: MatSnackBar, private firebaseService: FirebaseCallerService, @Inject(MAT_DIALOG_DATA) public data: any) { }

  onCancelClick(): void {
    this.dialogRef.close();
  }

  downloadDocument() {
    this.dialogRef.close(this.data.document);
  }

}
