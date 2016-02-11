import {Component, provide, Input, ViewChild, ContentChild} from 'angular2/core';
import {Validators, Control, FormBuilder} from 'angular2/common';
import {Observable} from 'rxjs/Observable';
import {UniForm} from '../../../../../framework/forms/uniForm';
import {UNI_CONTROL_DIRECTIVES} from '../../../../../framework/controls';
import {UNI_CONTROL_TYPES} from '../../../../../framework/controls/types';
import {UniFormBuilder} from '../../../../../framework/forms/builders/uniFormBuilder';
import {UniFieldsetBuilder} from '../../../../../framework/forms/builders/uniFieldsetBuilder';
import {UniComboGroupBuilder} from '../../../../../framework/forms/builders/uniComboGroupBuilder';
import {UniFieldBuilder} from '../../../../../framework/forms/builders/uniFieldBuilder';
import {UniGroupBuilder} from '../../../../../framework/forms/builders/uniGroupBuilder';
import {AccountingDS} from '../../../../../framework/data/accounting';
import {CurrencyDS} from '../../../../../framework/data/currency';
import {DimensionList} from '../dimensionList/dimensionList';
import {AccountGroupList} from '../accountGroupList/accountGroupList';
import {UniComponentLoader} from '../../../../../framework/core/componentLoader';
import {UniHttpService} from '../../../../../framework/data/uniHttpService';

@Component({
    selector: 'account-details',
    templateUrl: 'app/components/settings/accountSettings/accountDetails/accountDetails.html',
    directives: [UniForm, DimensionList, AccountGroupList],
    providers: [provide(AccountingDS,{useClass: AccountingDS}), provide(CurrencyDS,{useClass: CurrencyDS})]
})
export class AccountDetails {
    @Input() account;    
    @ViewChild(UniForm) form: UniForm;
    config = new UniFormBuilder();
    model;
    currencies;
    vattypes;
    
    constructor(fb:FormBuilder, private accountingDS:AccountingDS, private currencyDS:CurrencyDS, private http:UniHttpService) {
        this.accountReady();       
    }

    accountReady() {                             
        // Acount details                       
        var accountNumber = new UniFieldBuilder();
        accountNumber.setLabel('Kontonr.')
            .setModel(this.model)
            .setModelField('AccountNumber')
            .setType(UNI_CONTROL_DIRECTIVES[UNI_CONTROL_TYPES.TEXT])
                                  
        var accountName = new UniFieldBuilder();
        accountName.setLabel('Kontonavn')
            .setModel(this.model)
            .setModelField('AccountName')
            .setType(UNI_CONTROL_DIRECTIVES[UNI_CONTROL_TYPES.TEXT])
            
        var accountCombo = new UniComboGroupBuilder()
        accountCombo.addClass('combo');
        accountCombo.addFields(accountNumber, accountName);
            
        var accountAlias = new UniFieldBuilder();
        accountAlias.setLabel('Alias')
            .setModel(this.model)
            .setModelField('alias')
            .setType(UNI_CONTROL_DIRECTIVES[UNI_CONTROL_TYPES.TEXT]);
                        
        var currency = new UniFieldBuilder();
        currency.setLabel('Valuta')
            .setModel(this.model)
            .setModelField('CurrencyID')
            .setType(UNI_CONTROL_DIRECTIVES[UNI_CONTROL_TYPES.DROPDOWN])
            .setKendoOptions({ dataSource: this.currencies, dataTextField: 'Code' })

        var vatType = new UniFieldBuilder();
        vatType.setLabel('Moms')
            .setModel(this.model)
            .setModelField('vattype')
            .setType(UNI_CONTROL_DIRECTIVES[UNI_CONTROL_TYPES.DROPDOWN])
            .setKendoOptions({ dataSource: this.vattypes, dataTextField: 'Name'})
                    
        this.config.addFields(accountCombo, accountAlias, currency, vatType);

        //
        // Checkbox settings
        //
        
        var checkSystemAccount = new UniFieldBuilder();
        checkSystemAccount.setLabel('Systemkonto')
            .setModel(this.model)
            .setModelField('SystemAccount')
            .setType(UNI_CONTROL_DIRECTIVES[UNI_CONTROL_TYPES.CHECKBOX]);
            
        var checkPostPost = new UniFieldBuilder();
        checkPostPost.setLabel('PostPost')
            .setModel(this.model)
            .setModelField('UsePostPost')
            .setType(UNI_CONTROL_DIRECTIVES[UNI_CONTROL_TYPES.CHECKBOX]);    
        
        var checkDeductionPercent = new UniFieldBuilder();
        checkDeductionPercent.setLabel('Forholdsvismoms')
            .setModel(this.model)
            .setModelField('UseDeductionPercent')
            .setType(UNI_CONTROL_DIRECTIVES[UNI_CONTROL_TYPES.CHECKBOX]);  
            
        var checkLockManualPosts = new UniFieldBuilder();
        checkLockManualPosts.setLabel('Sperre manuelle poster')
            .setModel(this.model)
            .setModelField('LockManualPosts')
            .setType(UNI_CONTROL_DIRECTIVES[UNI_CONTROL_TYPES.CHECKBOX]);      
        
        var checkLocked = new UniFieldBuilder();
        checkLocked.setLabel('Sperret')
            .setModel(this.model)
            .setModelField('Locked')
            .setType(UNI_CONTROL_DIRECTIVES[UNI_CONTROL_TYPES.CHECKBOX]);  
            
        var checkVisible = new UniFieldBuilder();
        checkVisible.setLabel('Synlig')
            .setModel(this.model)
            .setModelField('Visible')
            .setType(UNI_CONTROL_DIRECTIVES[UNI_CONTROL_TYPES.CHECKBOX]);      
        
        var systemSet = new UniFieldsetBuilder();
        systemSet.addFields(checkSystemAccount, checkPostPost, checkDeductionPercent, checkLockManualPosts, checkLocked, checkVisible);
   
        this.config.addField(systemSet);
    }
    
    update() {      
        this.http.multipleRequests('GET', [
            { resource: "currencies" },
            { resource: "vattypes"},
            { resource: "accounts/" + this.account, expand: "Alias,Currency,AccountGroup" }
        ]).subscribe(
            (dataset) => {
                console.log("NYTT DATASETT");
                this.currencies = dataset[0];
                this.vattypes = dataset[1];
                this.model = dataset[2];  
                this.form.updateModel();
            },
            (error) => console.log(error)
        )  
   }
              
    ngOnInit() {
    }      
                    
    ngOnChanges() {
        console.log("NGCHANGE")
        console.log(this.form);
        //if (this.form != null)
        //    this.form.updateModel();
        
        this.update();    
    }
             
    onSubmit(value) {
        console.log("Form");
        console.log(JSON.stringify(this.model.CurrencyID));
    }
}