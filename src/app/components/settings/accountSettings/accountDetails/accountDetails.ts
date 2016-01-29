import {Component, provide, Input} from 'angular2/core';
import {Validators, Control, FormBuilder} from 'angular2/common';
import {UniForm,FIELD_TYPES} from '../../../../../framework/forms/uniForm';
import {UNI_CONTROL_TYPES} from '../../../../../framework/controls/types';
import {Observable} from 'rxjs/Observable';

import {UniFormBuilder} from '../../../../../framework/forms/uniFormBuilder';
import {UniFieldsetBuilder} from '../../../../../framework/forms/uniFieldsetBuilder';
import {UniFieldBuilder} from '../../../../../framework/forms/uniFieldBuilder';
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
            .setType(UNI_CONTROL_TYPES.TEXT)
            .addClass("accountRow");
                                  
        var accountName = new UniFieldBuilder();
        accountName.setLabel('Kontonavn')
            .setModel(this.model)
            .setModelField('AccountName')
            .setType(UNI_CONTROL_TYPES.TEXT)
            .addClass("accountRow");
            
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

        //
        // Checkbox settings
        //
        
        var checkSystemAccount = new UniFieldBuilder();
        checkSystemAccount.setLabel('Systemkonto')
            .setModel(this.model)
            .setModelField('SystemAccount')
            .setType(UNI_CONTROL_TYPES.CHECKBOX);
            
        var checkPostPost = new UniFieldBuilder();
        checkPostPost.setLabel('PostPost')
            .setModel(this.model)
            .setModelField('UsePostPost')
            .setType(UNI_CONTROL_TYPES.CHECKBOX);    
        
        var checkDeductionPercent = new UniFieldBuilder();
        checkDeductionPercent.setLabel('Forholdsvismoms')
            .setModel(this.model)
            .setModelField('UseDeductionPercent')
            .setType(UNI_CONTROL_TYPES.CHECKBOX);  
            
        var checkLockManualPosts = new UniFieldBuilder();
        checkLockManualPosts.setLabel('Sperre manuelle poster')
            .setModel(this.model)
            .setModelField('LockManualPosts')
            .setType(UNI_CONTROL_TYPES.CHECKBOX);      
        
        var checkLocked = new UniFieldBuilder();
        checkLocked.setLabel('Sperret')
            .setModel(this.model)
            .setModelField('Locked')
            .setType(UNI_CONTROL_TYPES.CHECKBOX);  
            
        var checkVisible = new UniFieldBuilder();
        checkVisible.setLabel('Synlig')
            .setModel(this.model)
            .setModelField('Visible')
            .setType(UNI_CONTROL_TYPES.CHECKBOX);      
        
        var systemSet = new UniFieldsetBuilder();
        systemSet.addFields(checkSystemAccount, checkPostPost, checkDeductionPercent, checkLockManualPosts, checkLocked, checkVisible);
   
        formBuilder.addField(systemSet);
        
        //
        // Dimensions
        //
        
        var dimensionsGroup = new UniGroupBuilder("Dimensjoner");  
        formBuilder.addField(dimensionsGroup);
          
        //               
        // Compatible Account Groups
        //
        
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
        /*
        Observable.forkJoin(
            this.currencyDS.getAll(),
            this.accountingDS.getVatTypes(),
            this.accountingDS.getAccount(11) 
        ).subscribe(results => {
            this.currencies = results[0];
            this.vattypes = results[1];
            this.accountReady(results[2]);             
        });*/
        
        // Test without backend
        this.currencies = [];
        this.vattypes = [];
        this.accountReady({ AccountNumber: "4000", AccountName: "Develop"});            
    }
             
    onSubmit(value) {
        console.log("Form");
        console.log(value);
        console.log(this.model);
    }
}