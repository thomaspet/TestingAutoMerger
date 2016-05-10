import {Component, provide, Input, ViewChild, Output, EventEmitter, SimpleChange} from "@angular/core";
import {Observable} from "rxjs/Observable";
import "rxjs/add/observable/forkjoin";


import {UNI_CONTROL_DIRECTIVES} from "../../../../../framework/controls";
import {FieldType} from "../../../../unientities";
import {UniForm, UniFormBuilder, UniFieldsetBuilder, UniFieldBuilder} from "../../../../../framework/forms";
import {UniComboFieldBuilder} from "../../../../../framework/forms/builders/uniComboFieldBuilder";

import {DimensionList} from "../dimensionList/dimensionList";
import {AccountGroupList} from "../accountGroupList/accountGroupList";

import {Account} from "../../../../unientities";
import {VatTypeService, CurrencyService, AccountService} from "../../../../services/services";

@Component({
    selector: "account-details",
    templateUrl: "app/components/settings/accountSettings/accountDetails/accountDetails.html",
    directives: [DimensionList, AccountGroupList, UniForm],
    providers: [AccountService, CurrencyService, VatTypeService]
})
export class AccountDetails {
    @Input() account;
    @Output() uniSaved = new EventEmitter<Account>();
    @ViewChild(UniForm) form: UniForm;
    config: any;
    model: Account = null;
    currencies: Array<any> = [];
    vattypes: Array<any> = [];

    constructor(private accountService: AccountService, private currencyService: CurrencyService, private vatTypeService: VatTypeService) {
    }
   
    ngOnInit() {

        //if (this.account != null && this.account > 0) {            
        //}

        Observable.forkJoin(
                this.currencyService.GetAll(null),
                this.vatTypeService.GetAll(null)   
            ).subscribe(
                    (dataset) => {
                        this.currencies = dataset[0];
                        this.vattypes = dataset[1];                        
                        this.buildForm();                        
                    },
                    (error) => console.log(error)
                );
    }


    ngOnChanges(changes: {[propName: string]: SimpleChange}) {
        if (changes['account'].currentValue == '0')
            return;
        
        this.update();        
    }
    
    update() {        
        var self = this;        
        this.accountService
            .Get(this.account, ['Alias','Currency','AccountGroup','Dimensions','Dimensions.Project','Dimensions.Region','Dimensions.Responsible','Dimensions.Departement'])            
            .subscribe(
                (dataset) => {
                    self.model = dataset;
                    
                    setTimeout(() => {
                        if (self.form != null)
                            self.form.Model = self.model;
                    });                    
                },
                (error) => console.log(error)
            )
    }
    
    buildForm() {
        var fb = new UniFormBuilder();

        //
        // main fields
        //

        var accountNumber = new UniFieldBuilder();
        accountNumber.setLabel("Kontonr./navn")
            .setModel(this.model)
            .setModelField("AccountNumber")
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.TEXT]);

        var accountName = new UniFieldBuilder();        
        accountName.setModel(this.model)
            .setModelField("AccountName")
            .addClass('small-combo-field')
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.TEXT]);

        var accountCombo = new UniComboFieldBuilder();
        accountCombo.addClass("combo");
        accountCombo.addUniElements(accountNumber, accountName);

        var accountAlias = new UniFieldBuilder();
        accountAlias.setLabel("Alias")
            .setModel(this.model)
            .setModelField("alias")
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.TEXT]);

        var currency = new UniFieldBuilder();
        currency.setLabel("Valuta")
            .setModel(this.model)
            .setModelField("CurrencyID")
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.DROPDOWN])
            .setKendoOptions({dataSource: this.currencies, dataValueField: "ID", dataTextField: "Code"});

        var vatType = new UniFieldBuilder();
        vatType.setLabel("Moms")
            .setModel(this.model)
            .setModelField("vattype")
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.DROPDOWN])
            .setKendoOptions({dataSource: this.vattypes, dataValueField: "ID", dataTextField: "Name"});

        var numSerie = new UniFieldBuilder();
        numSerie.setLabel("Nummerserie")
            .setModelField("SubAccountNumberSeriesID")
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.HYPERLINK])
            .setDescription("kunder")
            .setUrl("http://localhost/customer");

        fb.addUniElements(accountCombo, accountAlias, currency, vatType, numSerie);

        //
        // checkbox settings
        //

        var checkSystemAccount = new UniFieldBuilder();
        checkSystemAccount.setLabel("Systemkonto")
            .setModel(this.model)
            .setModelField("SystemAccount")
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.CHECKBOX]);

        var checkPostPost = new UniFieldBuilder();
        checkPostPost.setLabel("PostPost")
            .setModel(this.model)
            .setModelField("UsePostPost")
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.CHECKBOX]);

        var checkDeductionPercent = new UniFieldBuilder();
        checkDeductionPercent.setLabel("Forholdsvismoms")
            .setModel(this.model)
            .setModelField("UseDeductionPercent")
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.CHECKBOX]);

        var checkLockManualPosts = new UniFieldBuilder();
        checkLockManualPosts.setLabel("Sperre manuelle poster") 
            .setModel(this.model)
            .setModelField("LockManualPosts")
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.CHECKBOX]);

        var checkLocked = new UniFieldBuilder();
        checkLocked.setLabel("Sperret")
            .setModel(this.model)
            .setModelField("Locked")
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.CHECKBOX]);

        var checkVisible = new UniFieldBuilder();
        checkVisible.setLabel("Synlig")
            .setModel(this.model)
            .setModelField("Visible")
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.CHECKBOX]);

        var systemSet = new UniFieldsetBuilder();
        systemSet.addUniElements(checkSystemAccount, checkPostPost, checkDeductionPercent, checkLockManualPosts, checkLocked, checkVisible);

        fb.addUniElement(systemSet);

        this.config = fb;
    }

    onSubmit(value) {
        var self = this;
        if (this.model.ID > 0) {            
            this.accountService
                .Put(self.model.ID, self.model)
                .subscribe(
                    (response) => {
                        this.uniSaved.emit(this.model);
                    },
                    (err) => {
                        console.log('Save failed: ', err);                        
                    }
                );
        } else {
            this.accountService
                .Post(self.model)
                .subscribe(
                    (response) => {
                        this.uniSaved.emit(this.model);
                    },
                    (err) => {
                        console.log('Save failed: ', err);                        
                    }
                );
        }
    }
}