import {Component, provide, Input} from 'angular2/core';
import {Validators, Control, FormBuilder} from 'angular2/common';
import {UniForm,FIELD_TYPES} from '../../../../../framework/forms/uniForm';
import {UNI_CONTROL_TYPES} from '../../../../../framework/controls/types';
import {Observable} from 'rxjs/Observable';

import {UniFormBuilder} from "../../../../../framework/forms/uniFormBuilder";
import {UniFieldsetBuilder} from "../../../../../framework/forms/uniFieldsetBuilder";
import {UniFieldBuilder} from "../../../../../framework/forms/uniFieldBuilder";
import {UniGroupBuilder} from '../../../../../framework/forms/uniGroupBuilder';
import {UniTable, UniTableConfig} from '../../../../../framework/uniTable';
import {AccountingDS} from '../../../../../framework/data/accounting';
import {CurrencyDS} from '../../../../../framework/data/currency';

@Component({
    selector: 'account-details',
    templateUrl: 'app/components/settings/accountSettings/accountDetails/accountDetails.html',
    directives: [UniForm, UniTable],
    providers: [provide(AccountingDS,{useClass: AccountingDS}), provide(CurrencyDS,{useClass: CurrencyDS})]
})
export class AccountDetails {
    form;
    model;
    currencies;
    vattypes;
    dimensionsTableConfig;
    
    constructor(fb:FormBuilder, private accountingDS:AccountingDS, private currencyDS:CurrencyDS) {
    }

    accountReady(data) {
        if (data === null) {
            return;
        }

        console.log(data);
        
        this.model = data;
               
        var formBuilder = new UniFormBuilder();
             
        // Acount details   
                    
        var accountNumber = new UniFieldBuilder();
        accountNumber.setLabel('Kontonr.')
            .setModel(this.model)
            .setModelField('AccountNumber')
            .setType(UNI_CONTROL_TYPES.TEXT);
            
        var accountName = new UniFieldBuilder();
        accountName.setLabel('Kontonavn')
            .setModel(this.model)
            .setModelField('AccountName')
            .setType(UNI_CONTROL_TYPES.TEXT);

        var accountAlias = new UniFieldBuilder();
        accountAlias.setLabel('Alias')
            .setModel(this.model)
            .setModelField('alias')
            .setType(UNI_CONTROL_TYPES.TEXT);
            
        var currency = new UniFieldBuilder();
        currency.setLabel('Valuta')
            .setModel(this.model)
            .setModelField('currencycode')
            .setType(UNI_CONTROL_TYPES.DROPDOWN)
            .setKendoOptions({ dataSource: this.currencies, dataTextField: 'Code'})

        var vatType = new UniFieldBuilder();
        vatType.setLabel('Moms')
            .setModel(this.model)
            .setModelField('vattype')
            .setType(UNI_CONTROL_TYPES.DROPDOWN)
            .setKendoOptions({ dataSource: this.vattypes, dataTextField: 'Name'})
                    
        formBuilder.addFields(accountNumber, accountName, accountAlias, currency, vatType);

        // Checkboxes
        
        var systemAccount = new UniFieldBuilder();
        systemAccount.setLabel('Systemkonto')
            .setModel(this.model)
            .setModelField('SystemAccount')
            .setType(UNI_CONTROL_TYPES.CHECKBOX);
        
        var systemSet = new UniFieldsetBuilder();
        systemSet.addFields(systemAccount);
   
        formBuilder.addField(systemSet);
        
        // Dimensions
        
        var dimensionsGroup = new UniGroupBuilder("Dimensjoner");  
        formBuilder.addField(dimensionsGroup);
                       
        // Compatible Account Groups
        
        var compatibleGroup = new UniGroupBuilder("Kompatible kontogr.");  
        formBuilder.addField(compatibleGroup);

        this.form = formBuilder;
                        
        // TEST Tabell

        this.dimensionsTableConfig = new UniTableConfig('http://localhost:27831/api/biz/companysettings')
        .setOdata({
            expand: 'Address,Emails,Phones'
        })
        .setDsModel({
            id: 'ID',
            fields: {
                ID: {type: 'number'},
                CompanyName: {type: 'text'},
                Address: {
                    AddressLine1: {type: 'text'}
                },
                Emails: {
                    EmailAddress: {type: 'text'}
                },
                Phones: {
                    Number: {type: 'text'}
                }
            }
        })
        .setColumns([
            {field: 'ID', title: 'ID'},
            {field: 'CompanyName', title: 'Navn'},
            {field: 'Address.AddressLine1', title: 'Adresse'},
            {field: 'Emails.EmailAddress', title: 'Epost'},
            {field: 'Phones.Number', title: 'Telefon'},
        ]);  
    }
         
    ngOnInit() {
        Observable.forkJoin(
            this.currencyDS.getAll(),
            this.accountingDS.getVatTypes(),
            this.accountingDS.getAccount(11) 
        ).subscribe(results => {
            this.currencies = results[0];
            this.vattypes = results[1];
            this.accountReady(results[2]);             
        });
               
        /*
        this.currencyDS.getAll().subscribe (response => {
           this.currencies = response
           this.accountingDS.getVatTypes().subscribe (response => {
               this.vattypes = response 
               this.accountingDS.getAccount(1).subscribe (response => {
                    this.accountReady(response)
                    console.log(response);
               }, error => console.error(error));
            }, error => console.error(error));        
        }, error => console.error(error));   
        */     
    }
             
    onSubmit(value) {
        console.log("Form");
        console.log(value);
        console.log(this.model);
    }
}