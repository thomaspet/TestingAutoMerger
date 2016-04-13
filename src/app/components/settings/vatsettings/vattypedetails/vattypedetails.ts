import {Component, Input, ViewChild, SimpleChange} from "angular2/core";

import {Observable} from "rxjs/Observable";
import "rxjs/add/observable/forkjoin";

import {UNI_CONTROL_DIRECTIVES} from "../../../../../framework/controls";
import {FieldType} from "../../../../unientities";
import {UniForm, UniFormBuilder, UniFieldsetBuilder, UniFieldBuilder} from "../../../../../framework/forms";

import {VatType, VatCodeGroup, Account} from "../../../../unientities";
import {VatTypeService, VatCodeGroupService, AccountService} from "../../../../services/services";


@Component({
    selector: "vattype-details",
    templateUrl: "app/components/settings/vatSettings/vattypedetails/vattypedetails.html",
    directives: [UniForm],
    providers: [VatTypeService, AccountService, VatCodeGroupService]
})
export class VatTypeDetails {
    @Input()
    VatType: VatType;

    @ViewChild(UniForm)
    form: UniForm;

    config = new UniFormBuilder();
    model: VatType;
    accounts: Account[];
    vatcodegroups: VatCodeGroup[];

    constructor(private vatTypeService: VatTypeService,
                private accountService: AccountService,
                private vatCodeGroupService: VatCodeGroupService) {

    }

    ngOnInit() {

        if (this.VatType != null) {
            this.model = this.VatType;
        }

        Observable.forkJoin(
            this.accountService.GetAll(null),
            this.vatCodeGroupService.GetAll(null)
            )
            .subscribe(response => {
                this.accounts = response[0];
                this.vatcodegroups = response[1];

                this.buildForm();
            });


        /*

         //KJETIL EK: Koden under fungerer kun hvis this.accounts har verdi før this.model.
         //Noe med angular lifecycles som er problemet sannsynligvis. Bør vurdere å endre i uniform

         this.vatTypeService.Get(2)
         .subscribe(
         data => {
         this.model = data;
         console.log("modell hentet");
         this.refreshForm();
         },
         error => console.log("error in vatdetails.ngOnInit.vatTypeService.Get: " + error)
         );

         this.accountService.GetAll(null)    //.delay(1000)
         .subscribe(
         data => {
         this.accounts = data;
         console.log("accounts hentet");
         this.refreshForm();
         },
         error => console.log("error in vatdetails.ngOnInit.accountService.GetAll: " + error)
         )
         */
    }

    ngOnChanges(changes: {[propName: string]: SimpleChange}) {
        if (this.VatType != null) {
            this.model = this.VatType;            
            var self = this;

            //TODO: Remove timeout, needed for now to give angular time to set up form after this.model has been set
            setTimeout(() => {
                if (self.form != null)
                    self.form.Model = self.model;
            }, 500);
        }
    }

    onSubmit(value) {
        if (this.model.ID > 0) {
            this.vatTypeService.Put(this.model.ID, this.model)
                .subscribe(
                    data => this.model = data,
                    error => console.log("error in vatdetails.onSubmit: ", error)
                );
        } else {
            this.vatTypeService.Post(this.model)
                .subscribe(
                    data => this.model = data,
                    error => console.log("error in vatdetails.onSubmit: ", error)
                );
        }
    }

    buildForm() {

        var vatCodeGroup = new UniFieldBuilder();
        vatCodeGroup.setLabel("Gruppe")
            .setModel(this.model)
            .setModelField("VatCodeGroupID")
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.DROPDOWN])
            .setKendoOptions({
                dataSource: this.vatcodegroups,
                dataValueField: "ID",
                dataTextField: "Name",
                filter: "Contains"
            });

        var vatCode = new UniFieldBuilder();
        vatCode.setLabel("MVA kode.")
            .setModel(this.model)
            .setModelField("VatCode")
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.TEXT]);

        var vatAlias = new UniFieldBuilder();
        vatAlias.setLabel("Alias")
            .setModel(this.model)
            .setModelField("Alias")
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.TEXT]);

        var vatName = new UniFieldBuilder();
        vatName.setLabel("Navn")
            .setModel(this.model)
            .setModelField("Name")
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.TEXT]);

        var vatPercentage = new UniFieldBuilder();
        vatPercentage.setLabel("Sats (prosent)")
            .setModel(this.model)
            .setModelField("VatPercent")
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.NUMERIC]);

        var vatDateFrom = new UniFieldBuilder();
        vatDateFrom.setLabel("Dato fra")
            .setModel(this.model)
            .setModelField("ValidFrom")
            .setKendoOptions({
                autocomplete:false
            })
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.DATEPICKER]);

        var vatDateTo = new UniFieldBuilder();
        vatDateTo.setLabel("Dato til")
            .setModel(this.model)
            .setModelField("ValidTo")
            .setKendoOptions({
                autocomplete:false
            })
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.DATEPICKER]);

        var vatAccountOut = new UniFieldBuilder();
        vatAccountOut.setLabel("Utg. konto")
            .setModel(this.model)
            .setModelField("OutgoingAccountID")
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.DROPDOWN])
            .setKendoOptions({
                dataSource: this.accounts,
                dataValueField: "ID",
                dataTextField: "AccountName",
                filter: "Contains",
                template: "<span>#:AccountNumber# - #:AccountName#</span>",
                valueTemplate: "<span>#: data.ID > 0 ? data.AccountNumber : \"\"# - #:AccountName#</span>"
            });

        var vatAccountIn = new UniFieldBuilder();
        vatAccountIn.setLabel("Inng. konto")
            .setModel(this.model)
            .setModelField("IncomingAccountID")
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.DROPDOWN])
            .setKendoOptions({
                dataSource: this.accounts,
                dataValueField: "ID",
                dataTextField: "AccountName",
                filter: "Contains",
                template: "<span>#:AccountNumber# - #:AccountName#</span>",
                valueTemplate: "<span>#: data.ID > 0 ? data.AccountNumber : \"\"# - #:AccountName#</span>"
            });

        var outputVat = new UniFieldBuilder();
        outputVat.setLabel("Utgående MVA")
            .setModel(this.model)
            .setModelField("OutputVat")
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.CHECKBOX]);

        var vatAvailable = new UniFieldBuilder();
        vatAvailable.setLabel("Tilgjengelig i moduler")
            .setModel(this.model)
            .setModelField("AvailableInModules")
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.CHECKBOX]);

        var vatLocked = new UniFieldBuilder();
        vatLocked.setLabel("Sperret")
            .setModel(this.model)
            .setModelField("Locked")
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.CHECKBOX]);

        var vatVisible = new UniFieldBuilder();
        vatVisible.setLabel("Synlig")
            .setModel(this.model)
            .setModelField("Visible")
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.CHECKBOX]);

        var systemSet = new UniFieldsetBuilder();
        systemSet.addUniElements(outputVat, vatAvailable, vatLocked, vatVisible);

        this.config.addUniElements(
            vatCodeGroup,
            vatCode,
            vatAlias,
            vatName,
            vatPercentage,
            vatDateFrom,
            vatDateTo,
            vatAccountOut,
            vatAccountIn,
            systemSet
        );

    }
}
