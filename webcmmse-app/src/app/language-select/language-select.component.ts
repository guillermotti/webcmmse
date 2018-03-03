import { Component, Input, ViewEncapsulation } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

/**
 Represents a HTML select component.
 @class
 */
@Component({
    selector: 'app-language-select',
    templateUrl: './language-select.component.html',
    styleUrls: ['./language-select.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class LanguageSelectComponent {
    /**
     items for select component
     @member
     @type {Array<String>}
     */
    @Input()
    items: Array<String>;

    /**
     Defines a behaviour when select component is selected. In this case, it calls to onChangeFunction
     @public
     @param {any} selectedValue
     @method
     */
    public selected(selectedValue: any): void {

    }
    /**
     calls to onchangeFunction defined in parent class when a select element is removed.
     @public
     @param {any} removedValue
     @method
     */
    public removed(removedValue: any): void {

    }

     /**
      Contructor of languageSelect component.
      @class DefaultComponent
      @classdesc Represents a dropdown component to allow the user to choose among the available languages. .
      @param {TranslateService} translate service providing internationalization.

  */

    constructor(public translate: TranslateService) {
        translate.addLangs(['en', 'es']);
        translate.setDefaultLang('en');
    }

}
