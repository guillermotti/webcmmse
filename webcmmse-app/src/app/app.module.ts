import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { HttpModule } from '@angular/http';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CdkTableModule } from '@angular/cdk/table';
import { RouterModule, Routes } from '@angular/router';

import {
  MatAutocompleteModule,
  MatButtonModule,
  MatButtonToggleModule,
  MatCardModule,
  MatCheckboxModule,
  MatChipsModule,
  MatDatepickerModule,
  MatDialogModule,
  MatDividerModule,
  MatExpansionModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatNativeDateModule,
  MatPaginatorModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatRadioModule,
  MatRippleModule,
  MatSelectModule,
  MatSidenavModule,
  MatSliderModule,
  MatSlideToggleModule,
  MatSnackBarModule,
  MatSortModule,
  MatStepperModule,
  MatTableModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule,
} from '@angular/material';

import { AngularFireModule } from 'angularfire2';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { AngularFireStorageModule } from 'angularfire2/storage';
import { AngularFireAuthModule } from 'angularfire2/auth';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { AngularFontAwesomeModule } from 'angular-font-awesome';

import { LanguageSelectComponent } from './components/language-select/language-select.component';
import { AppComponent } from './components/app.component';
import { RegistrationComponent, AccordanceTermsDialogComponent } from './components/registration/registration.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LoginComponent } from './components/login/login.component';
import { LostPasswordComponent } from './components/lost-password/lost-password.component';
import { UserHomeComponent, ChangePasswordDialogComponent } from './components/user-home/user-home.component';
import { PaymentsInvoicesComponent } from './components/payments-invoices/payments-invoices.component';
import { PaperComponent, EditPaperDialogComponent, ConfirmDeleteDialogComponent } from './components/paper/paper.component';
import {
  UsersAdminComponent,
  EditUserDialogComponent,
  ConfirmDeleteUserDialogComponent
} from './components/users-admin/users-admin.component';

import { environment } from '../environments/environment';

import { FirebaseCallerService } from './services/firebase-caller.service';
import { CryptoService } from './services/crypto.service';
import { ConfigurationComponent } from './components/configuration/configuration.component';
import {
  ConferencesAdminComponent,
  EditConferenceDialogComponent,
  ConfirmDeleteConferenceDialogComponent
} from './components/conferences-admin/conferences-admin.component';
import {
  PapersAdminComponent,
  EditPaperAdminDialogComponent,
  ConfirmDeletePaperAdminDialogComponent
} from './components/papers-admin/papers-admin.component';
import { PaymentsAdminComponent, ConfirmPaymentDialogComponent } from './components/payments-admin/payments-admin.component';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

const appRoutes: Routes = [

  // { path: 'hero/:id',      component: HeroDetailComponent },
  /** {
    path: 'heroes',
    component: HeroListComponent,
    data: { title: 'Heroes List' }
  }, **/
  // { path: '**', component: PageNotFoundComponent }
  { path: 'index', component: DashboardComponent },
  { path: 'register', component: RegistrationComponent },
  { path: 'login', component: LoginComponent },
  { path: 'recover', component: LostPasswordComponent },
  { path: 'user', component: UserHomeComponent },
  { path: 'payments-invoices', component: PaymentsInvoicesComponent },
  { path: 'paper', component: PaperComponent },
  { path: 'users-admin', component: UsersAdminComponent },
  { path: 'configuration-admin', component: ConfigurationComponent },
  { path: 'conferences-admin', component: ConferencesAdminComponent },
  { path: 'papers-admin', component: PapersAdminComponent },
  { path: 'payments-admin', component: PaymentsAdminComponent },
  { path: '', redirectTo: 'index', pathMatch: 'full' },
  { path: '**', redirectTo: 'index', pathMatch: 'full' }
];

@NgModule({
  exports: [
    CdkTableModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatStepperModule,
    MatDatepickerModule,
    MatDialogModule,
    MatDividerModule,
    MatExpansionModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
  ]
})
export class MaterialModule { }

@NgModule({
  declarations: [
    AppComponent,
    LanguageSelectComponent,
    DashboardComponent,
    RegistrationComponent,
    LoginComponent,
    LostPasswordComponent,
    AccordanceTermsDialogComponent,
    ChangePasswordDialogComponent,
    EditPaperDialogComponent,
    ConfirmDeleteDialogComponent,
    UserHomeComponent,
    PaymentsInvoicesComponent,
    PaperComponent,
    UsersAdminComponent,
    EditUserDialogComponent,
    ConfirmDeleteUserDialogComponent,
    ConfigurationComponent,
    ConferencesAdminComponent,
    EditConferenceDialogComponent,
    ConfirmDeleteConferenceDialogComponent,
    PapersAdminComponent,
    EditPaperAdminDialogComponent,
    ConfirmDeletePaperAdminDialogComponent,
    PaymentsAdminComponent,
    ConfirmPaymentDialogComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AngularFireModule.initializeApp(environment.firebase), // imports firebase/app needed for everything
    AngularFirestoreModule, // imports firebase/firestore, only needed for database features
    AngularFireAuthModule, // imports firebase/auth, only needed for auth features,
    AngularFireStorageModule, // imports firebase/storage only needed for storage features
    FormsModule,
    HttpModule,
    HttpClientModule,
    MaterialModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    AngularFontAwesomeModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: true } // <-- debugging purposes only
    )
  ],
  entryComponents: [
    AppComponent,
    LanguageSelectComponent,
    DashboardComponent,
    RegistrationComponent,
    LoginComponent,
    LostPasswordComponent,
    AccordanceTermsDialogComponent,
    ChangePasswordDialogComponent,
    EditPaperDialogComponent,
    ConfirmDeleteDialogComponent,
    UserHomeComponent,
    PaymentsInvoicesComponent,
    PaperComponent,
    UsersAdminComponent,
    EditUserDialogComponent,
    ConfirmDeleteUserDialogComponent,
    ConfigurationComponent,
    ConferencesAdminComponent,
    EditConferenceDialogComponent,
    ConfirmDeleteConferenceDialogComponent,
    PapersAdminComponent,
    EditPaperAdminDialogComponent,
    ConfirmDeletePaperAdminDialogComponent,
    PaymentsAdminComponent,
    ConfirmPaymentDialogComponent
  ],
  providers: [
    FirebaseCallerService,
    CryptoService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

platformBrowserDynamic().bootstrapModule(AppModule);
