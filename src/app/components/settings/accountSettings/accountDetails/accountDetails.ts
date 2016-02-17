import {Component, provide, Input, ViewChild, ContentChild, ComponentRef} from "angular2/core";
import {Validators, Control, FormBuilder} from "angular2/common";
import {Observable} from "rxjs/Observable";
import {UniForm} from "../../../../../framework/forms/uniForm";
import {UNI_CONTROL_DIRECTIVES} from "../../../../../framework/controls";
import {UNI_CONTROL_TYPES} from "../../../../../framework/controls/types";
import {UniFormBuilder} from "../../../../../framework/forms/builders/uniFormBuilder";
import {UniFieldsetBuilder} from "../../../../../framework/forms/builders/uniFieldsetBuilder";
import {UniComboInputBuilder} from "../../../../../framework/forms/builders/uniComboInputBuilder";
import {UniInputBuilder} from "../../../../../framework/forms/builders/uniInputBuilder";
import {UniSectionBuilder} from "../../../../../framework/forms/builders/uniSectionBuilder";
import {AccountingDS} from "../../../../../framework/data/accounting";
import {CurrencyDS} from "../../../../../framework/data/currency";
import {DimensionList} from "../dimensionList/dimensionList";
import {AccountGroupList} from "../accountGroupList/accountGroupList";
import {UniHttpService} from "../../../../../framework/data/uniHttpService";
import {AccountModel} from "../../../../../framework/models/account";

@Component({
    selector: "account-details",
    templateUrl: "app/components/settings/accountSettings/accountDetails/accountDetails.html",
    directives: [UniForm, DimensionList, AccountGroupList],
    providers: [provide(AccountingDS, {useClass: AccountingDS}), provide(CurrencyDS, {useClass: CurrencyDS})]
})
export class AccountDetails {
    @Input() account;
    @ViewChild(UniForm) form: UniForm;
    config = new UniFormBuilder();
    model: AccountModel = new AccountModel();
    currencies;
    vattypes;

    constructor(fb: FormBuilder, private accountingDS: AccountingDS, private currencyDS: CurrencyDS, private http: UniHttpService) {
        // TEST CODE WITHOUT BACKEND      
        this.currencies = [
            {ID: 1, Code: "NOK"},
            {ID: 2, Code: "EUR"},
            {ID: 3, Code: "DKK"}
        ];

        this.vattypes = [
            {ID: 1, Name: "Høg sats", Percent: 25},
            {ID: 2, Name: "Mellomsats", Percent: 10}
        ];
    }

    buildForm() {
        //
        // main fields
        //

        var accountNumber = new UniInputBuilder();
        accountNumber.setLabel("Kontonr.")
            .setModel(this.model)
            .setModelField("AccountNumber")
            .setType(UNI_CONTROL_DIRECTIVES[UNI_CONTROL_TYPES.TEXT])

        var accountName = new UniInputBuilder();
        accountName.setLabel("Kontonavn")
            .setModel(this.model)
            .setModelField("AccountName")
            .setType(UNI_CONTROL_DIRECTIVES[UNI_CONTROL_TYPES.TEXT])

        var accountCombo = new UniComboInputBuilder()
        accountCombo.addClass("combo");
        accountCombo.addUniElements(accountNumber, accountName);

        var accountAlias = new UniInputBuilder();
        accountAlias.setLabel("Alias")
            .setModel(this.model)
            .setModelField("alias")
            .setType(UNI_CONTROL_DIRECTIVES[UNI_CONTROL_TYPES.TEXT]);

        var currency = new UniInputBuilder();
        currency.setLabel("Valuta")
            .setModel(this.model)
            .setModelField("CurrencyID")
            .setType(UNI_CONTROL_DIRECTIVES[UNI_CONTROL_TYPES.DROPDOWN])
            .setKendoOptions({dataSource: this.currencies, dataValueField: "ID", dataTextField: "Code"})

        var vatType = new UniInputBuilder();
        vatType.setLabel("Moms")
            .setModel(this.model)
            .setModelField("vattype")
            .setType(UNI_CONTROL_DIRECTIVES[UNI_CONTROL_TYPES.DROPDOWN])
            .setKendoOptions({dataSource: this.vattypes, dataValueField: "ID", dataTextField: "Name"})

        var numSerie = new UniInputBuilder();
        numSerie.setLabel("Nummerserie")
            .setModelField("SubAccountNumberSeriesID")
            .setType(UNI_CONTROL_DIRECTIVES[UNI_CONTROL_TYPES.HYPERLINK])
            .setDescription("kunder")
            .setUrl("http://localhost/customer");

        this.config.addUniElements(accountCombo, accountAlias, currency, vatType, numSerie);

        //
        // Checkbox settings
        //

        var checkSystemAccount = new UniInputBuilder();
        checkSystemAccount.setDescription("Systemkonto")
            .setModel(this.model)
            .setModelField("SystemAccount")
            .setType(UNI_CONTROL_DIRECTIVES[UNI_CONTROL_TYPES.CHECKBOX]);

        var checkPostPost = new UniInputBuilder();
        checkPostPost.setDescription("PostPost")
            .setModel(this.model)
            .setModelField("UsePostPost")
            .setType(UNI_CONTROL_DIRECTIVES[UNI_CONTROL_TYPES.CHECKBOX]);

        var checkDeductionPercent = new UniInputBuilder();
        checkDeductionPercent.setDescription("Forholdsvismoms")
            .setModel(this.model)
            .setModelField("UseDeductionPercent")
            .setType(UNI_CONTROL_DIRECTIVES[UNI_CONTROL_TYPES.CHECKBOX]);

        var checkLockManualPosts = new UniInputBuilder();
        checkLockManualPosts.setDescription("Sperre manuelle poster")
            .setModel(this.model)
            .setModelField("LockManualPosts")
            .setType(UNI_CONTROL_DIRECTIVES[UNI_CONTROL_TYPES.CHECKBOX]);

        var checkLocked = new UniInputBuilder();
        checkLocked.setDescription("Sperret")
            .setModel(this.model)
            .setModelField("Locked")
            .setType(UNI_CONTROL_DIRECTIVES[UNI_CONTROL_TYPES.CHECKBOX]);

        var checkVisible = new UniInputBuilder();
        checkVisible.setDescription("Synlig")
            .setModel(this.model)
            .setModelField("Visible")
            .setType(UNI_CONTROL_DIRECTIVES[UNI_CONTROL_TYPES.CHECKBOX]);

        var systemSet = new UniFieldsetBuilder();
        systemSet.addUniElements(checkSystemAccount, checkPostPost, checkDeductionPercent, checkLockManualPosts, checkLocked, checkVisible);

        this.config.addUniElement(systemSet);
    }

    update() {
        var self = this;
        this.http.multipleRequests("GET", [
            {resource: "currencies"},
            {resource: "vattypes"},
            {resource: "accounts/" + this.account, expand: "Alias,Currency,AccountGroup"}
        ]).subscribe(
            (dataset) => {
                self.currencies = dataset[0];
                self.vattypes = dataset[1];
                self.model = dataset[2];
                self.form.refresh(self.model);
            },
            (error) => console.log(error)
        )
    }

    ngOnInit() {
        this.buildForm();
    }

    ngOnChanges() {
        if (this.form == null) return;

        if (this.account == 0) {
            this.model = new AccountModel();
            this.form.refresh(this.model);
        }
        else if (this.account == 1000) { // TEST ONLY
            this.model = new AccountModel();
            this.model.ID = 1000;
            this.model.AccountName = "TEST";
            this.model.AccountNumber = 1000;
            this.model.CurrencyID = 1;
            this.model.Currency = {
                ID: 1,
                Code: "NOK",
                Date: null,
                Source: null,
                Name: "",
                ExchangeRate: 1,
                Factor: 1,
                StatusID: 0,
                Deleted: false,
                CustomFields: null
            };
            this.model.VatTypeID = 1;
            this.model.SystemAccount = true;
            this.model.VatType = {
                ID: 1,
                Name: "Høg moms",
                VatPercent: 25,
                VatCode: "1",
                VatCodeRelationID: 0,
                AvailableInModules: false,
                VatTypeSetupID: 0,
                ValidFrom: null,
                ValidTo: null,
                Visible: false,
                Locked: false,
                OutputVat: false,
                IncomingAccountID: 0,
                OutgoingAccountID: 0,
                InUse: false,
                StatusID: 0,
                Deleted: false,
                IncomingAccount: null,
                OutgoingAccount: null,
                CustomFields: null
            };
            this.model.DimensionsID = 1;
            this.form.refresh(this.model);
        }
        else {
            this.update();
        }
    }

    onSubmit(value) {
        var self = this;
        if (this.model.ID > 0) {
            console.log("LAGRE");
            console.log(this.model);
            this.http.put({
                resource: "accounts/" + self.model.ID,
                body: self.model
            }).subscribe(
                (response) => {
                    console.log("LAGRET KONTO " + self.model.ID)
                },
                (error) => {
                    console.log("OPPDATERING FEILET");
                    console.log(self.model);
                    console.log(error._body);
                }
            );
        } else {
            console.log("LAGRE");
            console.log(self.model);
            this.http.post({
                resource: "accounts",
                body: self.model
            }).subscribe(
                (response) => {
                    console.log("LAGRET NY KONTO ");
                    console.log(response);
                },
                (error) => {
                    console.log("LAGRING AV NY FEILET");
                    console.log(self.model);
                    console.log(error._body);
                }
            );
        }
    }
}