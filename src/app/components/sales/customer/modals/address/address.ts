import {Component, ViewChildren, Type, Input, QueryList, ViewChild, ComponentRef} from "angular2/core";
import {NgIf, NgModel, NgFor} from "angular2/common";
import {UniModal} from "../../../../../../framework/modals/modal";
import {UniComponentLoader} from "../../../../../../framework/core/componentLoader";
import {UniFormBuilder} from "../../../../../../framework/forms/builders/uniFormBuilder";
import {UniForm} from "../../../../../../framework/forms/uniForm";
import {UNI_CONTROL_DIRECTIVES} from "../../../../../../framework/controls";
import {UniFieldBuilder} from "../../../../../../framework/forms/builders/uniFieldBuilder";
import {FieldType, ComponentLayout, Address} from "../../../../../unientities";
import {UniFormLayoutBuilder} from "../../../../../../framework/forms/builders/uniFormLayoutBuilder";

// Reusable address form
@Component({
    selector: 'address-form',
    directives: [UniForm,NgIf],
    template: `
        <uni-form *ngIf="config" [config]="config">
        </uni-form>
    `
})
export class AddressForm {
    config: UniFormBuilder;

    @ViewChild(UniForm)
    form: UniForm;

    Address: Address;

    constructor() {
        this.Address = new Address();
        this.Address.AddressLine1 = "Oterstadneset 14";
        this.Address.PostalCode = "5727";
        this.Address.City = "Stamnes";
        this.Address.CountryCode = "NO";
        this.Address.Country = "NORGE";
    }
   
    ngOnInit()
    {
        this.createFormConfig();      
    }
 
    createFormConfig() {   
        // TODO get it from the API and move these to backend migrations   
        var view: ComponentLayout = {
            Name: "Address",
            BaseEntity: "Address",
            StatusCode: 0,
            Deleted: false,
            ID: 1,
            CustomFields: null,
            Fields: [
                {
                    ComponentLayoutID: 1,
                    EntityType: "Address",
                    Property: "AddressLine1",
                    Placement: 1,
                    Hidden: false,
                    FieldType: 10,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Adresse",
                    Description: "",
                    HelpText: "",
                    FieldSet: 0,
                    Section: 0,
                    Legend: "",
                    StatusCode: 0,
                    ID: 1,
                    Deleted: false,
                    CustomFields: null 
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: "Address",
                    Property: "AddressLine2",
                    Placement: 1,
                    Hidden: false,
                    FieldType: 10,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Adresse2",
                    Description: "",
                    HelpText: "",
                    FieldSet: 0,
                    Section: 0,
                    Legend: "",
                    StatusCode: 0,
                    ID: 1,
                    Deleted: false,
                    CustomFields: null 
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: "Address",
                    Property: "AddressLine3",
                    Placement: 1,
                    Hidden: false,
                    FieldType: 10,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Adresse3",
                    Description: "",
                    HelpText: "",
                    FieldSet: 0,
                    Section: 0,
                    Legend: "",
                    StatusCode: 0,
                    ID: 1,
                    Deleted: false,
                    CustomFields: null 
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: "Address",
                    Property: "PostalCode",
                    Placement: 1,
                    Hidden: false,
                    FieldType: 10,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Postnr",
                    Description: "",
                    HelpText: "",
                    FieldSet: 0,
                    Section: 0,
                    Legend: "",
                    StatusCode: 0,
                    ID: 1,
                    Deleted: false,
                    CustomFields: null 
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: "Address",
                    Property: "City",
                    Placement: 1,
                    Hidden: false,
                    FieldType: 10,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Poststed",
                    Description: "",
                    HelpText: "",
                    FieldSet: 0,
                    Section: 0,
                    Legend: "",
                    StatusCode: 0,
                    ID: 1,
                    Deleted: false,
                    CustomFields: null 
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: "Address",
                    Property: "CountryCode",
                    Placement: 1,
                    Hidden: false,
                    FieldType: 10,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Landkode",
                    Description: "",
                    HelpText: "",
                    FieldSet: 0,
                    Section: 0,
                    Legend: "",
                    StatusCode: 0,
                    ID: 1,
                    Deleted: false,
                    CustomFields: null 
                },
                {
                    ComponentLayoutID: 1,
                    EntityType: "Address",
                    Property: "Country",
                    Placement: 1,
                    Hidden: false,
                    FieldType: 10,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Land",
                    Description: "",
                    HelpText: "",
                    FieldSet: 0,
                    Section: 0,
                    Legend: "",
                    StatusCode: 0,
                    ID: 1,
                    Deleted: false,
                    CustomFields: null 
                }
            ]               
        };   
        
        this.config = new UniFormLayoutBuilder().build(view, this.Address);
        this.config.hideSubmitButton();
    }

}

// address modal type
@Component({
    selector: "address-modal-type",
    directives: [NgIf, NgModel, NgFor, UniComponentLoader],
    template: `
        <article class="modal-content">
            <h1 *ngIf="config.title">{{config.title}}</h1>
            <uni-component-loader></uni-component-loader>
            <footer>
                <button *ngFor="#action of config.actions; #i=index" (click)="action.method()">
                    {{action.text}}
                </button>
            </footer>
        </article>
    `
})
export class AddressModalType {
    @Input('config')
    config;
    @ViewChild(UniComponentLoader)
    ucl: UniComponentLoader;
    instance: Promise<AddressForm>;
            
    ngAfterViewInit() {
        var self = this;
        this.ucl.load(AddressForm).then((cmp: ComponentRef)=> {
            self.instance = new Promise((resolve)=> {
                resolve(cmp.instance);
            });
        });
    }
}

// address modal
@Component({
    selector: "address-modal",
    template: `
        <button (click)="openModal()">Adresse modal</button>
        <uni-modal [type]="type" [config]="modalConfig"></uni-modal>
    `,
    directives: [UniModal]
})
export class AddressModal {
    @ViewChild(UniModal)
    modal: UniModal;
    modalConfig: any = {};

    type: Type = AddressModalType;

    constructor() {
        var self = this;
        this.modalConfig = {
            title: "Adresse",
            value: "Initial value",
            actions: [
                {
                    text: "Accept",
                    method: () => {
                        self.modal.getContent().then((content: AddressModalType)=> {
                            content.instance.then((rc: AddressForm)=> {
                                console.log(rc.form.form);
                            });
                        });
                    }
                },
                {
                    text: "Cancel",
                    method: () => {
                        self.modal.getContent().then(() => {
                            self.modal.close();
                        });
                    }
                }
            ]
        };
    }

    openModal() {
        this.modal.open();
    }
}