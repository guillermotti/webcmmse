import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar, MatChipInputEvent } from '@angular/material';
import { ENTER, COMMA, SPACE } from '@angular/cdk/keycodes';
import { FormControl, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import { FirebaseCallerService } from '../../services/firebase-caller.service';
import { CryptoService } from '../../services/crypto.service';
import { AngularFireStorage } from 'angularfire2/storage';

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.scss']
})
export class ConfigurationComponent implements OnInit {

  year; urlCMMSE; user;
  config = {
    cmmse_opened: '',
    send_term_opened: '',
    conference_year: '',
    conference_initial_day: '',
    conference_end_day: '',
    conference_place: '',
    conference_url: '',
    CIF: '',
    ISBN: '',
    fee_to_pay: '',
    root_user: '',
    root_password: '',
    certificate_signature: '',
    bill_number: '',
    email_opened: '',
    email_sender: '',
    email_password: '',
    emails: [],
    invoice_opened: '',
    certificates_opened: ''
  };
  fieldsDisabled = true; opened; termOpened; openedEmail; invoiceOpened; certificatesOpened;
  formControl = new FormControl('', [Validators.required]);
  minDate = new Date(); hide = true; rootPassword; emailPassword; restartDatabase;
  change = '_CHANGE_DATA'; colorChange = 'primary';
  // Enter, comma
  separatorKeysCodes = [ENTER, COMMA, SPACE];

  constructor(private firebaseService: FirebaseCallerService, private translationService: TranslateService,
    public snackBar: MatSnackBar, private router: Router, private cryptoService: CryptoService, private storage: AngularFireStorage) {

  }

  ngOnInit() {
    const user = JSON.parse(window.sessionStorage.getItem('user'));
    if (_.isNil(user)) {
      this.router.navigate(['login']);
    } else {
      this.firebaseService.getCollection('config').subscribe(response => {
        this.config = response[0];
        window.sessionStorage.setItem('config', JSON.stringify(this.config));
        this.rootPassword = this.cryptoService.decrypt(response[0].root_password);
        this.emailPassword = response[0].email_password ? this.cryptoService.decrypt(response[0].email_password) : '';
        this.year = response[0].conference_year;
        this.urlCMMSE = response[0].conference_url;
        const open = response[0].cmmse_opened ? '_OPENED' : '_CLOSED';
        const termOpen = response[0].send_term_opened ? '_OPENED' : '_CLOSED';
        const emailOpen = response[0].email_opened ? '_OPENED' : '_CLOSED';
        const invoiceOpen = response[0].invoice_opened ? '_OPENED' : '_CLOSED';
        const certificatesOpen = response[0].certificates_opened ? '_OPENED' : '_CLOSED';
        this.translationService.get(open).subscribe(resp => {
          this.opened = resp;
        });
        this.translationService.get(termOpen).subscribe(resp => {
          this.termOpened = resp;
        });
        this.translationService.get(emailOpen).subscribe(resp => {
          this.openedEmail = resp;
        });
        this.translationService.get(invoiceOpen).subscribe(resp => {
          this.invoiceOpened = resp;
        });
        this.translationService.get(certificatesOpen).subscribe(resp => {
          this.certificatesOpened = resp;
        });
      });
      this.user = user.user;
      this.restartDatabase = false;
    }
  }

  logOut() {
    window.sessionStorage.clear();
  }

  areFieldsEmpty() {
    if (this.config.conference_url === '' || this.config.conference_year === '' ||
      this.config.root_user === '' || this.rootPassword === '') {
      return true;
    } else {
      return false;
    }
  }

  changeData() {
    if (this.change === '_CHANGE_DATA') {
      this.colorChange = 'accent';
      this.change = '_SAVE_CHANGES';
      this.fieldsDisabled = false;
    } else {
      this.colorChange = 'primary';
      this.change = '_CHANGE_DATA';
      this.fieldsDisabled = true;
      const config = JSON.parse(window.sessionStorage.getItem('config'));
      this.config.root_password = this.cryptoService.encrypt(this.rootPassword);
      this.config.email_password = this.cryptoService.encrypt(this.emailPassword);
      this.firebaseService.updateItemFromCollection('config', config.id, this.config).then(() => {
        const obser = this.firebaseService.getItemFromCollection(config.id, 'config').subscribe(response => {
          window.sessionStorage.setItem('config', JSON.stringify(response[0]));
          this.rootPassword = this.cryptoService.decrypt(response[0].root_password);
          this.emailPassword = this.cryptoService.decrypt(response[0].email_password);
          this.ngOnInit();
          obser.unsubscribe();
        });
        this.translationService.get('_CONFIG_UPDATED_SUCCESFULLY').subscribe(resp => {
          this.snackBar.open(resp, null, {
            duration: 2000,
          });
        });
      });
    }

  }

  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    // Add our fruit
    if ((value || '').trim()) {
      this.config.emails.push(value.trim());
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  remove(email: any): void {
    const index = this.config.emails.indexOf(email);

    if (index >= 0) {
      this.config.emails.splice(index, 1);
    }
  }

  restartUsers() {
    const obser = this.firebaseService.getCollection('users').subscribe(users => {
      users.forEach(user => {
        this.storage.ref('/payments/' + user.payment_file.id_file).delete();
        user.papers.forEach(paper => {
          this.storage.ref('/papers/' + paper.id_file).delete();
        });
        this.firebaseService.deleteItemFromCollection('users', user.id);
      });
      this.translationService.get('_USERS_REMOVED_SUCCESFULLY').subscribe(resp => {
        this.snackBar.open(resp, null, {
          duration: 2000,
        });
      });
      obser.unsubscribe();
    });
  }

  restartConferences() {
    const obser = this.firebaseService.getCollection('conferences').subscribe(conferences => {
      conferences.forEach(conf => {
        this.firebaseService.deleteItemFromCollection('conferences', conf.id);
      });
      this.translationService.get('_CONFERENCES_REMOVED_SUCCESFULLY').subscribe(resp => {
        this.snackBar.open(resp, null, {
          duration: 2000,
        });
      });
      obser.unsubscribe();
    });
  }

}
