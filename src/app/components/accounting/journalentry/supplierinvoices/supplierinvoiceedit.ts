import {Component, ViewChild, SimpleChange, Input, Output, EventEmitter, ViewChildren, QueryList, ComponentRef, OnInit} from "angular2/core";
import {RouteParams, Router } from 'angular2/router';
import {CanDeactivate, ComponentInstruction} from 'angular2/router';
import {NgIf, NgModel, NgFor} from "angular2/common";

import {UniModal} from "../../../../../framework/modals/modal";
import {UniComponentLoader} from "../../../../../framework/core/componentLoader";

import {Observable} from "rxjs/Observable";
import "rxjs/add/observable/forkjoin";

import {SupplierInvoice} from "../../../../unientities";
import {SupplierInvoiceService, SupplierService} from "../../../../services/services";

import {UNI_CONTROL_DIRECTIVES} from "../../../../../framework/controls";
import {UniForm, UniFormBuilder, UniFieldsetBuilder, UniFieldBuilder} from "../../../../../framework/forms";
import {FieldType} from "../../../../unientities";


@Component({
    selector: "supplier-invoice-edit",
    templateUrl: "app/components/accounting/journalentry/supplierinvoices/supplierinvoiceedit.html",
    directives: [UniForm],
    providers: [SupplierInvoiceService]
})
export class SupplierInvoiceEdit implements OnInit {
    //@Input() SupplierInvoice: SupplierInvoice;

    @Output() Updated = new EventEmitter<SupplierInvoice>();

    @ViewChild(UniForm)
    form: UniForm;

    SupplierInvoice: SupplierInvoice;

    formConfig = new UniFormBuilder();

    model: SupplierInvoice;

    supplierInvoices: SupplierInvoice[];

    constructor(
        private supplierInvoiceService: SupplierInvoiceService,
        private _routeParams: RouteParams,
        private _router: Router) {

    }


    ngOnInit() {

        if (this.SupplierInvoice != null) {
            this.model = this.SupplierInvoice;
        }

        let id = +this._routeParams.get('id');

        //if (id === null) {

        //}
        //else {
        //Get the entity from service
        this.supplierInvoiceService.Get(1)
               .subscribe(response => {
                   this.SupplierInvoice = response;
            });

        //Get some of the lookup table information
        //Observable.forkJoin(
        //    //this.accountService.GetAll(null),
        //    this.supplierInvoiceService.GetAll(null)
        //)
        //    .subscribe(response => {
        //        //this.suppliers = response[0];
        //        this.supplierInvoices = response[0];

        //        this.buildForm();
        //    });
        this.buildForm();
    }

    //**********************************
//Confirm dialog??
    //TODO
    routerCanDeactivate(next: ComponentInstruction, prev: ComponentInstruction): any {
        return true;
        // Allow synchronous navigation (`true`) if no crisis or the crisis is unchanged.
        //if (!this.SupplierInvoice || this.crisis.name === this.editName) {
        //    return true;
        //}
        // Otherwise ask the user with the dialog service and return its
        // promise which resolves to true or false when the user decides
        //return this._dialog.confirm('Discard changes?');
    }

    cancel() {
        //this.editName = this.crisis.name;
        this.gotoCrises();
    }

    save() {
        //this.crisis.name = this.editName;
        //TODO..
        this.gotoCrises();
    }

    gotoCrises() {
        let supplierInvoiceId = this.SupplierInvoice ? this.SupplierInvoice.ID : null;
        // Pass along the hero id if available
        // so that the CrisisListComponent can select that hero.
        // Add a totally useless `foo` parameter for kicks.
        this._router.navigate(['Supplierinvoices', { id: supplierInvoiceId, foo: 'foo' }]);
    }


    //**********************************

    private _gotoSupplierInvoiceList() {
        let id = this.SupplierInvoice ? this.SupplierInvoice.ID : null;
        let route = ['Supplierinvoices', { id: id }];
        this._router.navigate(route);
    }

    private _getSupplierInvoice() {
        let id = +this._routeParams.get('id');
        if (id === 0) return;
        if (this.isAddMode()) {
            console.log("_getSupplierInvoice isAdd mode!!");
            //this. = <Vehicle>{ name: '', type: '' };
            //this.editVehicle = this._entityService.clone(this.vehicle);
            return;
        }
        //this._vehicleService.getVehicle(id)
        //    .subscribe((vehicle: Vehicle) => this._setEditVehicle(vehicle));
    }

    isAddMode() {
        let id = +this._routeParams.get('id');
        return isNaN(id);
    }

    //ngOnDestroy() {
    //    this._dbResetSubscription.unsubscribe();
    //}

    //ngOnChanges(changes: { [propName: string]: SimpleChange }) {
    //    if (this.SupplierInvoice != null) {
    //        this.model = this.SupplierInvoice;
    //        var self = this;

    //        //TODO: Remove timeout, needed for now to give angular time to set up form after this.model has been set
    //        setTimeout(() => {
    //            if (self.form != null)
    //                self.form.refresh(self.model);
    //        }, 1000);
    //    }
    //}

    onSubmit(value) {
        if (this.model.ID > 0) {
            this.supplierInvoiceService.Put(this.model.ID, this.model)
                .subscribe((response: any) => {
                    console.log("Response: ", response);
                    this.model = response;
                    this.Updated.emit(response);
                }, (error: any) => console.log(error));
        } else {
            this.supplierInvoiceService.Post(this.model)
                .subscribe(
                data => this.model = data,
                error => console.log("Error in vatdetails.onSubmit: ", error)
                );
        }
    }

    buildForm() {
        //this.formConfig.hideSubmitButton();
        var supplierInvoiceId = new UniFieldBuilder();
        supplierInvoiceId.setLabel("ID")
            .setModel(this.model)
            .setModelField("ID")
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.TEXT]);

        var invoiceDate = new UniFieldBuilder();
        invoiceDate.setLabel("Fakturadato")
            .setModel(this.model)
            .setModelField("InvoiceDate")
            .setKendoOptions({
                autocomplete: false
            })
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.DATEPICKER]);

        this.formConfig.addUniElements(
            supplierInvoiceId, invoiceDate
        );
    }
}

//@Component({
//    selector: "supplier-invoice-modal",
//    directives: [NgIf, NgModel, NgFor, UniComponentLoader],
//    template: `
//        <article class="modal-content">
//            <h1 *ngIf="config.title">{{config.title}}</h1>
//            <uni-component-loader></uni-component-loader>
//            <footer>
//                <button *ngFor="#action of config.actions; #i=index" (click)="action.method()">
//                    {{action.text}}
//                </button>
//            </footer>
//        </article>
//    `
//})
//export class SupplierInvoiceModal {
//    @Input('config')
//    config;
//    @ViewChild(UniComponentLoader)
//    ucl: UniComponentLoader;
//    instance: Promise<SupplierInvoiceEdit>;

//    ngAfterViewInit() {
//        var self = this;
//        this.ucl.load(SupplierInvoiceEdit).then((cmp: ComponentRef) => {
//            cmp.instance.SupplierInvoice = self.config.value;
//            self.instance = new Promise((resolve) => {
//                resolve(cmp.instance);
//            });
//        });
//    }
//}
