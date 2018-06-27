import { Component, OnInit } from '@angular/core';
import { FirebaseCallerService } from '../../services/firebase-caller.service';
import { TranslateService } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { CryptoService } from '../../services/crypto.service';
import * as _ from 'lodash';
import * as jsPDF from 'jspdf';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import { AppConfig } from '../../config/app.config';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-documents-admin',
  templateUrl: './documents-admin.component.html',
  styleUrls: ['./documents-admin.component.scss']
})
export class DocumentsAdminComponent implements OnInit {

  year; urlCMMSE; user; sizeSelected; size; text; R; G; B;
  sizes = AppConfig.badgeSizes;
  formControl = new FormControl('', [Validators.required]);

  constructor(private firebaseService: FirebaseCallerService, private translationService: TranslateService,
    public snackBar: MatSnackBar, private router: Router, private cryptoService: CryptoService) {

  }

  ngOnInit() {
    const user = JSON.parse(window.sessionStorage.getItem('user'));
    if (_.isNil(user)) {
      this.router.navigate(['login']);
    } else {
      this.firebaseService.getCollection('config').subscribe(response => {
        window.sessionStorage.setItem('config', JSON.stringify(response[0]));
        this.year = response[0].conference_year;
        this.urlCMMSE = response[0].conference_url;
      });
      this.user = user.user;
      this.sizeSelected = false;
      this.R = 255;
      this.G = 255;
      this.B = 255;
      this.text = '';
    }
  }

  logOut() {
    window.sessionStorage.clear();
  }

  downloadAuthors() {
    const header: String[] = ['First Name', 'Last Name', 'Email', 'University/College/Company', 'Country',
      'Number of papers', 'Number of posters'];

    const wopts: XLSX.WritingOptions = { bookType: 'xlsx', type: 'array' };
    const fileName = 'AllAuthors.xlsx';

    const data = [];
    data.push(header);
    const obser = this.firebaseService.getCollection('users').subscribe(users => {
      users.forEach(user => {
        if (!_.isEmpty(user.papers)) {
          user.numberPapers = 0;
          user.numberPosters = 0;
          user.papers.forEach(paper => {
            user.numberPapers += 1;
            if (paper.poster) {
              user.numberPosters += 1;
            }
          });
          const userToExport = [user.first_name, user.last_name, user.email, user.university_company,
          user.country, user.numberPapers, user.numberPosters];
          data.push(userToExport);
        }
      });
      /* generate worksheet */
      const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(data);

      /* generate workbook and add the worksheet */
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'AllAuthors');

      /* save to file */
      const wbout: ArrayBuffer = XLSX.write(wb, wopts);
      FileSaver.saveAs(new Blob([wbout], { type: 'application/octet-stream' }), fileName);

      obser.unsubscribe();
    });
  }

  downloadPapers() {
    const header: String[] = ['First Name', 'Last Name', 'Email', 'University/College/Company', 'Conference', 'Title', 'Accepted',
      'Poster', 'File', 'Corresponding Author', 'Author2', 'Author3', 'Author4', 'Author5', 'Author6', 'Author7', 'Author8',
      'Author9', 'Author10'];

    const wopts: XLSX.WritingOptions = { bookType: 'xlsx', type: 'array' };
    const fileName = 'AllPapers.xlsx';

    const data = [];
    data.push(header);
    const obser = this.firebaseService.getCollection('users').subscribe(users => {
      users.forEach(user => {
        if (!_.isEmpty(user.papers)) {
          user.papers.forEach(paper => {
            const authors = [];
            paper.authors.forEach(author => {
              authors.push('Name: ' + author.first_name + ' /Last name: ' + author.last_name + ' /Email: ' + author.email);
            });
            const userToExport = [user.first_name, user.last_name, user.email, user.university_company, paper.minisymposium, paper.title,
            paper.state === '_ACCEPTED' ? 'Yes' : 'No', paper.poster ? 'Yes' : 'No', paper.url_file, authors[0], authors[1], authors[2],
            authors[3], authors[4], authors[5], authors[6], authors[7], authors[8], authors[9]];
            data.push(userToExport);
          });
        }
      });
      /* generate worksheet */
      const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(data);

      /* generate workbook and add the worksheet */
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'AllPapers');

      /* save to file */
      const wbout: ArrayBuffer = XLSX.write(wb, wopts);
      FileSaver.saveAs(new Blob([wbout], { type: 'application/octet-stream' }), fileName);

      obser.unsubscribe();
    });
  }

  downloadUsers() {
    const header: String[] = ['First Name', 'Last Name', 'Email', 'University/College/Company', 'Country', 'State', 'City',
      'Postal Code', 'Address', 'Telephone', 'Paid', 'Proof of payment', 'Bill Number', 'CIF for Bill'];

    const wopts: XLSX.WritingOptions = { bookType: 'xlsx', type: 'array' };
    const fileName = 'AllUsers.xlsx';

    const data = [];
    data.push(header);
    const obser = this.firebaseService.getCollection('users').subscribe(users => {
      users.forEach(user => {
        const userToExport = [user.first_name, user.last_name, user.email, user.university_company, user.country, user.state,
        user.city, user.postal_code, user.address, user.phone, user.check_payment ? 'Yes' : 'No',
        user.payment_file ? user.payment_file.url_file : '', user.bill ? user.bill.invoice_number : '', user.bill ? user.bill.CIF : ''];
        data.push(userToExport);
      });
      /* generate worksheet */
      const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(data);

      /* generate workbook and add the worksheet */
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'AllUsers');

      /* save to file */
      const wbout: ArrayBuffer = XLSX.write(wb, wopts);
      FileSaver.saveAs(new Blob([wbout], { type: 'application/octet-stream' }), fileName);

      obser.unsubscribe();
    });
  }

  downloadInvoiceFiles() {
    const config = JSON.parse(window.sessionStorage.getItem('config'));
    const initialDate = new Date(config.conference_initial_day);
    const endDate = new Date(config.conference_end_day);
    const today = new Date();
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
    const obser = this.firebaseService.getCollection('users').subscribe(users => {
      users.forEach((user, index) => {
        let userTitle = user.bill ? user.bill.title : user.title;
        this.translationService.get(userTitle).subscribe(response => {
          userTitle = response;
        });
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
          if (index < users.length - 1) {
            doc.addPage();
          } else {
            doc.save('InvoicesAll.pdf');
          }
        });
      });
      obser.unsubscribe();
    });
  }

  downloadPresentationFiles() {
    const config = JSON.parse(window.sessionStorage.getItem('config'));
    const initialDate = new Date(config.conference_initial_day);
    const endDate = new Date(config.conference_end_day);
    const certificateDate = new Date(config.certificate_signature);
    const today = new Date();
    const papers = []; const usersOfPapers = [];
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
    const obser = this.firebaseService.getCollection('users').subscribe(users => {
      users.forEach(user => {
        if (user && user.papers) {
          this.translationService.get(user.title).subscribe(response => {
            user.title = response;
            user.papers.forEach(paper => {
              papers.push(paper);
              usersOfPapers.push(user);
            });
          });
        }
      });
      papers.forEach((paper, index) => {
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
          doc.text(20, 100, usersOfPapers[index].title + ' ' + usersOfPapers[index].first_name + ' ' + usersOfPapers[index].last_name);
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
          if (index < papers.length - 1) {
            doc.addPage();
          } else {
            doc.save('PresentationCertificatesAll.pdf');
          }
        });
      });
      obser.unsubscribe();
    });
  }

  downloadAttendanceFiles() {
    const config = JSON.parse(window.sessionStorage.getItem('config'));
    const initialDate = new Date(config.conference_initial_day);
    const certificateDate = new Date(config.certificate_signature);
    const endDate = new Date(config.conference_end_day);
    const today = new Date();
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
    const obser = this.firebaseService.getCollection('users').subscribe(users => {
      users.forEach((user, index) => {
        let userTitle = user.bill ? user.bill.title : user.title;
        this.translationService.get(userTitle).subscribe(response => {
          userTitle = response;
        });
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
            doc.text(180, 180, monthNames[today.getMonth()] + ' ' +
              today.getDate() + ', ' + today.getFullYear(), null, null, 'right');
          }
          doc.text(20, 220, 'Sincerely,');
          doc.text(55, 270, 'Bruce A. Wade');
          doc.text(120, 270, 'J. Vigo-Aguiar');
          if (index < users.length - 1) {
            doc.addPage();
          } else {
            doc.save('AttendanceCertificatesAll.pdf');
          }
        });
      });
      obser.unsubscribe();
    });
  }

  downloadIdBadge() {
    let width; let height; let infoWidth;
    const _this = this;
    let text = true;
    switch (this.size) {
      case '15x7.5':
        width = 150;
        height = 75;
        infoWidth = 95;
        break;
      case '10.8x7.5':
        width = 108;
        height = 75;
        infoWidth = 75;
        break;
      case '9.2x6.25':
        width = 92;
        height = 62.5;
        infoWidth = 65;
        break;
    }

    const config = JSON.parse(window.sessionStorage.getItem('config'));
    const initialDate = new Date(config.conference_initial_day);
    const endDate = new Date(config.conference_end_day);
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    const obser = this.firebaseService.getCollection('users').subscribe(users => {
      let users3 = [];
      const usersTotal = [];
      users.forEach((user, index) => {
        users3.push(user);
        if ((index + 1) % 3 === 0 || users.length - 2 < index) {
          usersTotal.push(users3);
          users3 = [];
        }
      });
      usersTotal.forEach((user, index) => {
        const htmlImages =
          `<div><img src="../../../assets/img/CMMSE_VertIzq.jpg" style="position:absolute;
          margin-left:15px; margin-top:-330px; width:25; height:25;"></div>
          <div><img src="../../../assets/img/CMMSE_VertIzq.jpg" style="position:absolute;
          margin-left:15px; margin-top:245px; width:25; height:25;"></div>
          <div><img src="../../../assets/img/CMMSE_VertIzq.jpg" style="position:absolute;
          margin-left:15px; margin-top:245px; width:25; height:25;"></div>`;
        doc.fromHTML(htmlImages, 20, 110, {}, function () {
          // First badge
          doc.rect(20.2, 20.2, width, height);
          doc.rect(20.4, 20.4, width, height);
          doc.rect(20.6, 20.6, width, height);
          doc.rect(20.8, 20.8, width, height);
          // Color for the badge
          doc.setFillColor(_this.R, _this.G, _this.B);
          doc.rect(20.2, 50.2, width, height / 2, 'F');
          doc.rect(20.4, 50.4, width, height / 2);
          doc.rect(20.6, 50.6, width, height / 2);
          doc.rect(20.8, 50.8, width, height / 2);
          doc.setFontSize(14);
          doc.text(infoWidth, 30, 'CMMSE ' + config.conference_year, null, null, 'center');
          doc.setFontSize(9);
          doc.text(infoWidth, 34, 'International Conference on Computational and', null, null, 'center');
          doc.text(infoWidth, 38, 'Mathematical Methods in Science and Engineering', null, null, 'center');
          doc.text(infoWidth, 42, monthNames[initialDate.getMonth()] + ' ' + initialDate.getDate()
            + ' - ' + endDate.getDate() + ', ' + config.conference_year + '. ' + config.conference_place, null, null, 'center');
          if (_this.text) {
            doc.setFontSize(18);
            doc.text(infoWidth, 65, _this.text, null, null, 'center');
          } else {
            doc.setFontSize(16);
            doc.text(infoWidth, 60, user[0].last_name + ', ' + user[0].first_name, null, null, 'center');
            doc.setFontSize(9);
            doc.text(infoWidth, 65, user[0].university_company, null, null, 'center');
            doc.setFontSize(12);
            doc.text(infoWidth, 69, user[0].country, null, null, 'center');
          }

          // Second badge
          if (user[1]) {
            doc.rect(20.2, 110.2, width, height);
            doc.rect(20.4, 110.4, width, height);
            doc.rect(20.6, 110.6, width, height);
            doc.rect(20.8, 110.8, width, height);
            // Color for the badge
            doc.setFillColor(_this.R, _this.G, _this.B);
            doc.rect(20.2, 140.2, width, height / 2, 'F');
            doc.rect(20.4, 140.4, width, height / 2);
            doc.rect(20.6, 140.6, width, height / 2);
            doc.rect(20.8, 140.8, width, height / 2);
            doc.setFontSize(14);
            doc.text(infoWidth, 120, 'CMMSE ' + config.conference_year, null, null, 'center');
            doc.setFontSize(9);
            doc.text(infoWidth, 124, 'International Conference on Computational and', null, null, 'center');
            doc.text(infoWidth, 128, 'Mathematical Methods in Science and Engineering', null, null, 'center');
            doc.text(infoWidth, 132, monthNames[initialDate.getMonth()] + ' ' + initialDate.getDate()
              + ' - ' + endDate.getDate() + ', ' + config.conference_year + '. ' + config.conference_place, null, null, 'center');
            if (_this.text) {
              doc.setFontSize(18);
              doc.text(infoWidth, 155, _this.text, null, null, 'center');
            } else {
              doc.setFontSize(16);
              doc.text(infoWidth, 150, user[1].last_name + ', ' + user[1].first_name, null, null, 'center');
              doc.setFontSize(9);
              doc.text(infoWidth, 155, user[1].university_company, null, null, 'center');
              doc.setFontSize(12);
              doc.text(infoWidth, 159, user[1].country, null, null, 'center');
            }
          }

          // Third badge
          if (user[2]) {
            doc.rect(20.2, 200.2, width, height);
            doc.rect(20.4, 200.4, width, height);
            doc.rect(20.6, 200.6, width, height);
            doc.rect(20.8, 200.8, width, height);
            // Color for the badge
            doc.setFillColor(_this.R, _this.G, _this.B);
            doc.rect(20.2, 230.2, width, height / 2, 'F');
            doc.rect(20.4, 230.4, width, height / 2);
            doc.rect(20.6, 230.6, width, height / 2);
            doc.rect(20.8, 230.8, width, height / 2);
            doc.setFontSize(14);
            doc.text(infoWidth, 210, 'CMMSE ' + config.conference_year, null, null, 'center');
            doc.setFontSize(9);
            doc.text(infoWidth, 214, 'International Conference on Computational and', null, null, 'center');
            doc.text(infoWidth, 218, 'Mathematical Methods in Science and Engineering', null, null, 'center');
            doc.text(infoWidth, 222, monthNames[initialDate.getMonth()] + ' ' + initialDate.getDate()
              + ' - ' + endDate.getDate() + ', ' + config.conference_year + '. ' + config.conference_place, null, null, 'center');
            if (_this.text) {
              doc.setFontSize(18);
              doc.text(infoWidth, 245, _this.text, null, null, 'center');
            } else {
              doc.setFontSize(16);
              doc.text(infoWidth, 240, user[2].last_name + ', ' + user[2].first_name, null, null, 'center');
              doc.setFontSize(9);
              doc.text(infoWidth, 245, user[2].university_company, null, null, 'center');
              doc.setFontSize(12);
              doc.text(infoWidth, 249, user[2].country, null, null, 'center');
            }
          }
          if (_this.text && text) {
            doc.save('IdBadges' + _this.text + '.pdf');
            text = false;
          } else {
            if (index < usersTotal.length - 1) {
              doc.addPage();
            } else {
              if (text) {
                doc.save('IdBadgesAll.pdf');
              }
            }
          }
        });
      });
      obser.unsubscribe();
    });
  }

  sizeSelect() {
    this.sizeSelected = true;
  }

}
