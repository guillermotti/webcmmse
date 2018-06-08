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

@Component({
  selector: 'app-documents-admin',
  templateUrl: './documents-admin.component.html',
  styleUrls: ['./documents-admin.component.scss']
})
export class DocumentsAdminComponent implements OnInit {

  year; urlCMMSE; user; width; height;

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
    }
    this.width = 108;
    this.height = 75;
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
    this.firebaseService.getCollection('users').subscribe(users => {
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
    this.firebaseService.getCollection('users').subscribe(users => {
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
    });
  }

  downloadUsers() {
    const header: String[] = ['First Name', 'Last Name', 'Email', 'University/College/Company', 'Country', 'State', 'City',
      'Postal Code', 'Address', 'Telephone', 'Paid', 'Proof of payment', 'Bill Number', 'CIF for Bill'];

    const wopts: XLSX.WritingOptions = { bookType: 'xlsx', type: 'array' };
    const fileName = 'AllUsers.xlsx';

    const data = [];
    data.push(header);
    this.firebaseService.getCollection('users').subscribe(users => {
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
    this.firebaseService.getCollection('users').subscribe(users => {
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
            doc.text(25, 110, 'Address: ');
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
    this.firebaseService.getCollection('users').subscribe(users => {
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
    this.firebaseService.getCollection('users').subscribe(users => {
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
    });
  }

  downloadIdBadge() {
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
    let coef;
    if (this.width < this.height) {
      coef = this.height / this.width;
    } else {
      coef = this.width / this.height;
    }
    doc.rect(20, 20, this.width, this.height);
    doc.rect(20.2, 20.2, this.width, this.height);
    doc.rect(20.4, 20.4, this.width, this.height);
    doc.rect(20.6, 20.6, this.width, this.height);
    doc.rect(20.8, 20.8, this.width, this.height);
    doc.rect(20, 50, this.width, this.height / 2);
    doc.rect(20.2, 50.2, this.width, this.height / 2);
    doc.rect(20.4, 50.4, this.width, this.height / 2);
    doc.rect(20.6, 50.6, this.width, this.height / 2);
    doc.rect(20.8, 50.8, this.width, this.height / 2);

    const htmlImages =
      `<p>CMMSE ` + config.conference_year + `
    </p>`;
    doc.fromHTML(htmlImages, 20 + this.width * coef, 20 + this.height * coef, {}, function () {
      doc.save('IdBadgesAll.pdf');
    });
    /**this.firebaseService.getCollection('users').subscribe(users => {
      users.forEach((user, index) => {
        const htmlImages =
          `<div style="border:5px solid #000; padding:50px;">
          <div style="border:5px solid #000; padding:50px; margin-left:-19%; margin-right:-19%; margin-top:15%"></div>
        </div>`;
        doc.fromHTML(htmlImages, 0, 0, {}, function () {
          if (index < users.length - 1) {
            doc.addPage();
          } else {
            doc.save('IdBadgesAll.pdf');
          }
        });
      });
    });**/
  }

}
