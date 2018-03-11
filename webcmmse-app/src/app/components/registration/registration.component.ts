import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { FirebaseCallerService } from '../../services/firebase-caller.service';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent implements OnInit {

  // Esto debe ser configurable en un app.conf
  date = new Date();
  year = this.date.getFullYear();
  urlCMMSE = 'http://cmmse.usal.es/cmmse2018/';

  hide = true;
  hide2 = true;

  form = {
    'name': '',
    'lastName': '',
    'title': '',
    'country': '',
    'city': '',
    'state': '',
    'universityCompany': '',
    'postalCode': '',
    'address': '',
    'phone': '',
    'email': '',
    'emailCheck': '',
    'password': '',
    'passwordCheck': '',
    'check': false
  };

  formControl = new FormControl('', [Validators.required]);
  emailControl = new FormControl('', [Validators.required, Validators.email]);
  emailControl2 = new FormControl('', [Validators.required, Validators.email]);
  disableSubmit = new FormControl(false);

  titles = [
    { value: 'Dr.' },
    { value: 'Ms.' },
    { value: 'Mr.' },
    { value: 'Prof.' }
  ];

  countries = [
    { value: 'Afghanistan' },
    { value: 'Albania' },
    { value: 'Algeria' },
    { value: 'Andorra' },
    { value: 'Angola' },
    { value: 'Antigua and Barbuda' },
    { value: 'Argentina' },
    { value: 'Armenia' },
    { value: 'Australia' },
    { value: 'Austria' },
    { value: 'Azerbaijan' },
    { value: 'Bahamas' },
    { value: 'Bahrain' },
    { value: 'Bangladesh' },
    { value: 'Barbados' },
    { value: 'Belarus' },
    { value: 'Belgium' },
    { value: 'Belize' },
    { value: 'Benin' },
    { value: 'Bhutan' },
    { value: 'Bolivia' },
    { value: 'Bosnia and Herzegovina' },
    { value: 'Botswana' },
    { value: 'Brazil' },
    { value: 'Brunei' },
    { value: 'Bulgaria' },
    { value: 'Burkina Faso' },
    { value: 'Burundi' },
    { value: 'Cambodia' },
    { value: 'Cameroon' },
    { value: 'Canada' },
    { value: 'Cape Verde' },
    { value: 'Central African Republic' },
    { value: 'Chad' },
    { value: 'Chile' },
    { value: 'China' },
    { value: 'Colombia' },
    { value: 'Comoros' },
    { value: 'Congo (Brazzaville)' },
    { value: 'Congo' },
    { value: 'Costa Rica' },
    { value: 'Cote d´Ivoire' },
    { value: 'Croatia' },
    { value: 'Cuba' },
    { value: 'Cyprus' },
    { value: 'Czech Republic' },
    { value: 'Denmark' },
    { value: 'Djibouti' },
    { value: 'Dominica' },
    { value: 'Dominican Republic' },
    { value: 'East Timor (Timor Timur)' },
    { value: 'Ecuador' },
    { value: 'Egypt' },
    { value: 'El Salvador' },
    { value: 'Equatorial Guinea' },
    { value: 'Eritrea' },
    { value: 'Estonia' },
    { value: 'Ethiopia' },
    { value: 'Fiji' },
    { value: 'Finland' },
    { value: 'France' },
    { value: 'Gabon' },
    { value: 'Gambia, The' },
    { value: 'Georgia' },
    { value: 'Germany' },
    { value: 'Ghana' },
    { value: 'Greece' },
    { value: 'Grenada' },
    { value: 'Guatemala' },
    { value: 'Guinea' },
    { value: 'Guinea-Bissau' },
    { value: 'Guyana' },
    { value: 'Haiti' },
    { value: 'Honduras' },
    { value: 'Hungary' },
    { value: 'Iceland' },
    { value: 'India' },
    { value: 'Indonesia' },
    { value: 'Iran' },
    { value: 'Iraq' },
    { value: 'Ireland' },
    { value: 'Israel' },
    { value: 'Italy' },
    { value: 'Jamaica' },
    { value: 'Japan' },
    { value: 'Jordan' },
    { value: 'Kazakhstan' },
    { value: 'Kenya' },
    { value: 'Kiribati' },
    { value: 'Korea, North' },
    { value: 'Korea, South' },
    { value: 'Kuwait' },
    { value: 'Kyrgyzstan' },
    { value: 'Laos' },
    { value: 'Latvia' },
    { value: 'Lebanon' },
    { value: 'Lesotho' },
    { value: 'Liberia' },
    { value: 'Libya' },
    { value: 'Liechtenstein' },
    { value: 'Lithuania' },
    { value: 'Luxembourg' },
    { value: 'Macedonia' },
    { value: 'Madagascar' },
    { value: 'Malawi' },
    { value: 'Malaysia' },
    { value: 'Maldives' },
    { value: 'Mali' },
    { value: 'Malta' },
    { value: 'Marshall Islands' },
    { value: 'Mauritania' },
    { value: 'Mauritius' },
    { value: 'Mexico' },
    { value: 'Micronesia' },
    { value: 'Moldova' },
    { value: 'Monaco' },
    { value: 'Mongolia' },
    { value: 'Morocco' },
    { value: 'Mozambique' },
    { value: 'Myanmar' },
    { value: 'Namibia' },
    { value: 'Nauru' },
    { value: 'Nepa' },
    { value: 'Netherlands' },
    { value: 'New Zealand' },
    { value: 'Nicaragua' },
    { value: 'Niger' },
    { value: 'Nigeria' },
    { value: 'Norway' },
    { value: 'Oman' },
    { value: 'Pakistan' },
    { value: 'Palau' },
    { value: 'Panama' },
    { value: 'Papua New Guinea' },
    { value: 'Paraguay' },
    { value: 'Peru' },
    { value: 'Philippines' },
    { value: 'Poland' },
    { value: 'Portugal' },
    { value: 'Qatar' },
    { value: 'Romania' },
    { value: 'Russia' },
    { value: 'Rwanda' },
    { value: 'Saint Kitts and Nevis' },
    { value: 'Saint Lucia' },
    { value: 'Saint Vincent' },
    { value: 'Samoa' },
    { value: 'San Marino' },
    { value: 'Sao Tome and Principe' },
    { value: 'Saudi Arabia' },
    { value: 'Senegal' },
    { value: 'Serbia and Montenegro' },
    { value: 'Seychelles' },
    { value: 'Sierra Leone' },
    { value: 'Singapore' },
    { value: 'Slovakia' },
    { value: 'Slovenia' },
    { value: 'Solomon Islands' },
    { value: 'Somalia' },
    { value: 'South Africa' },
    { value: 'Spain' },
    { value: 'Sri Lanka' },
    { value: 'Sudan' },
    { value: 'Suriname' },
    { value: 'Swaziland' },
    { value: 'Sweden' },
    { value: 'Switzerland' },
    { value: 'Syria' },
    { value: 'Taiwan' },
    { value: 'Tajikistan' },
    { value: 'Tanzania' },
    { value: 'Thailand' },
    { value: 'Togo' },
    { value: 'Tonga' },
    { value: 'Trinidad and Tobago' },
    { value: 'Tunisia' },
    { value: 'Turkey' },
    { value: 'Turkmenistan' },
    { value: 'Tuvalu' },
    { value: 'Uganda' },
    { value: 'Ukraine' },
    { value: 'United Arab Emirates' },
    { value: 'United Kingdom' },
    { value: 'United States' },
    { value: 'Uruguay' },
    { value: 'Uzbekistan' },
    { value: 'Vanuatu' },
    { value: 'Vatican City' },
    { value: 'Venezuela' },
    { value: 'Vietnam' },
    { value: 'Yemen' },
    { value: 'Zambia' },
    { value: 'Zimbabwe' }
  ];

  constructor(private firebaseCaller: FirebaseCallerService) { }

  ngOnInit() {

  }

  isFormValid() {
    if (this.areFieldsEmpty() || this.form.check === false) {
      return true;
    } else if (this.form.email !== this.form.emailCheck || this.form.password !== this.form.passwordCheck) {
      return true;
    } else if (this.emailControl2.hasError('email') || this.emailControl.hasError('email')) {
      return true;
    } else {
      return false;
    }
  }

  areFieldsEmpty() {
    if (this.form.country === '' || this.form.email === '' || this.form.emailCheck === ''
      || this.form.lastName === '' || this.form.name === '' || this.form.password === '' || this.form.passwordCheck === ''
      || this.form.title === '' || this.form.universityCompany === '') {
      return true;
    }
  }

  submitRegister() {
    this.firebaseCaller.getCollection('users').subscribe(response => {
      console.log(response);
    });
    console.log(this.form);
  }

}
