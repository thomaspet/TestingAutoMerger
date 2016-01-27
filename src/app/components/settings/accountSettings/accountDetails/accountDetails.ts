import {Component} from 'angular2/core';
import {Validators, Control, FormBuilder} from 'angular2/common';
import {UniForm,FIELD_TYPES} from '../../../../../framework/forms/uniForm';
import {UNI_CONTROL_TYPES} from '../../../../../framework/controls/types';

import {UniFormBuilder} from "../../../../../framework/forms/uniFormBuilder";
import {UniFieldsetBuilder} from "../../../../../framework/forms/uniFieldsetBuilder";
import {UniFieldBuilder} from "../../../../../framework/forms/uniFieldBuilder";
import {UniGroupBuilder} from '../../../../../framework/forms/uniGroupBuilder';

@Component({
    selector: 'account-details',
    templateUrl: 'app/components/settings/accountSettings/accountDetails/accountDetails.html',
    directives: [UniForm]
})
export class AccountDetails {
    form;
    model;
    
    constructor(fb:FormBuilder) {
        let self = this;

        this.model = {
            accountnumber: '4000',
            accountname: 'Verktøy',
            alias: '',
            currencycode: 'NOK',
            vattype: ''
        }
                
        var formBuilder = new UniFormBuilder();
             
        // Acount details   
                    
        var accountNumber = new UniFieldBuilder();
        accountNumber.setLabel('Kontonr.')
            .setModel(self.model)
            .setModelField('accountnumber')
            .setType(UNI_CONTROL_TYPES.TEXT);
            
        var accountName = new UniFieldBuilder();
        accountName.setLabel('Kontonavn')
            .setModel(self.model)
            .setModelField('accountname')
            .setType(UNI_CONTROL_TYPES.TEXT);

        var accountAlias = new UniFieldBuilder();
        accountAlias.setLabel('Alias')
            .setModel(self.model)
            .setModelField('alias')
            .setType(UNI_CONTROL_TYPES.TEXT);
            
        var currency = new UniFieldBuilder();
        currency.setLabel('Valuta')
            .setModel(self.model)
            .setModelField('currencycode')
            .setType(UNI_CONTROL_TYPES.DROPDOWN)
            .setKendoOptions({ dataSource: ['USD', 'NOK', 'EUR', 'GPD'] });

        var vatType = new UniFieldBuilder();
        vatType.setLabel('Moms')
            .setModel(self.model)
            .setModelField('vattype')
            .setType(UNI_CONTROL_TYPES.DROPDOWN)
            .setKendoOptions({ dataSource: ['25% Inngående'] });
                    
        var accountFieldSet = new UniFieldsetBuilder();
        //accountFieldSet.addFields(accountNumber, accountName, aliasName, currency, vatType);   
        formBuilder.addFields(accountNumber, accountName, accountAlias, currency, vatType);
                   
        //formBuilder.addFields(accountFieldSet);
        
        // Dimensions
        
        var dimensionsGroup = new UniGroupBuilder("Dimensjoner");  
        formBuilder.addField(dimensionsGroup);
        
        // Compatible Account Groups
        
        var compatibleGroup = new UniGroupBuilder("Kompatible kontogr.");  
        formBuilder.addField(compatibleGroup);
        
        this.form = formBuilder;
    }
     
    onSubmit(value) {
        console.log("Form:", value);
        console.log("Model:", this.model);
    }
}