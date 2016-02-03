import {Component, provide, Input, SimpleChange} from 'angular2/core';
import {Validators, Control, FormBuilder} from 'angular2/common';
import {UniForm,FIELD_TYPES} from '../../../../../framework/forms/uniForm';
import {UNI_CONTROL_TYPES} from '../../../../../framework/controls/types';
import {Observable} from 'rxjs/Observable';

import {UniFormBuilder} from '../../../../../framework/forms/uniFormBuilder';
import {UniFieldsetBuilder} from '../../../../../framework/forms/uniFieldsetBuilder';
import {UniComboBuilder} from '../../../../../framework/forms/uniComboBuilder';
import {UniFieldBuilder} from '../../../../../framework/forms/uniFieldBuilder';
import {UniGroupBuilder} from '../../../../../framework/forms/uniGroupBuilder';
import {AccountingDS} from '../../../../../framework/data/accounting';
import {CurrencyDS} from '../../../../../framework/data/currency';
import {DimensionList} from '../dimensionList/dimensionList';
import {AccountGroupList} from '../accountGroupList/accountGroupList';

@Component({
    selector: 'account-details',
    templateUrl: 'app/components/settings/accountSettings/accountDetails/accountDetails.html',
    directives: [UniForm, DimensionList, AccountGroupList],
    providers: [provide(AccountingDS,{useClass: AccountingDS}), provide(CurrencyDS,{useClass: CurrencyDS})]
})
export class AccountDetails {
    @Input() account;    
    form;
    model;
    currencies;
    vattypes;
    dimensionsTableConfig;
    
    constructor(fb:FormBuilder, private accountingDS:AccountingDS, private currencyDS:CurrencyDS) {
    }

    accountReady() {
        if (this.model === null) {
            return;
        }
             
        var formBuilder = new UniFormBuilder();
             
        // Acount details   
                    
        var accountNumber = new UniFieldBuilder();
        accountNumber.setLabel('Kontonr.')
            .setModel(this.model)
            .setModelField('AccountNumber')
            .setType(UNI_CONTROL_TYPES.TEXT)
                                  
        var accountName = new UniFieldBuilder();
        accountName.setLabel('Kontonavn')
            .setModel(this.model)
            .setModelField('AccountName')
            .setType(UNI_CONTROL_TYPES.TEXT)
            
        var accountCombo = new UniComboBuilder()
        accountCombo.addClass('combo');
        accountCombo.addFields(accountNumber, accountName);
            
        var accountAlias = new UniFieldBuilder();
        accountAlias.setLabel('Alias')
            .setModel(this.model)
            .setModelField('alias')
            .setType(UNI_CONTROL_TYPES.TEXT);
                        
        var currency = new UniFieldBuilder();
        currency.setLabel('Valuta')
            .setModel(this.model)
            .setModelField('CurrencyID')
            .setType(UNI_CONTROL_TYPES.DROPDOWN)
            .setKendoOptions({ dataSource: this.currencies, dataTextField: 'Code' })

        var vatType = new UniFieldBuilder();
        vatType.setLabel('Moms')
            .setModel(this.model)
            .setModelField('vattype')
            .setType(UNI_CONTROL_TYPES.DROPDOWN)
            .setKendoOptions({ dataSource: this.vattypes, dataTextField: 'Name'})
                    
        formBuilder.addFields(accountCombo, accountAlias, currency, vatType);

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
    }
    
    update() {
/*
        Observable.forkJoin(
            this.currencyDS.getAll(),
            this.accountingDS.getVatTypes(),
            this.accountingDS.getAccount(1) // getAccount(this.account) 
        ).subscribe(dataset => {
            this.currencies = dataset[0];
            this.vattypes = dataset[1];
            this.model = dataset[2];
            this.accountReady()             
        });  
*/           
        console.log("ACCOUNT " + this.account);
   
        if (this.account == undefined) {
            this.model = { ID: 1, AccountNumber: "4000", AccountName: "Test" }          
        } else {
            console.log("CHANGED MODEL");
            this.model = { ID: 7, AccountNumber: "4001", AccountName: "Test 2" }  
        } 
    }
         
    ngOnInit() {
        this.update(); 
        this.accountReady();       
    }
    
    ngOnChanges() {
        console.log("CHANGES");
        this.update();  
    }
             
    onSubmit(value) {
        console.log("Form");
        console.log(JSON.stringify(this.model.CurrencyID));
    }
}