import {Component, ViewChildren, Type, Input, Output, QueryList, ViewChild, ComponentRef, EventEmitter} from "angular2/core";
import {NgIf, NgModel, NgFor, NgClass} from "angular2/common";
import {UniModal} from "../../../../../../framework/modals/modal";
import {UniComponentLoader} from "../../../../../../framework/core/componentLoader";
import {UniFormBuilder} from "../../../../../../framework/forms/builders/uniFormBuilder";
import {UniForm} from "../../../../../../framework/forms/uniForm";
import {UNI_CONTROL_DIRECTIVES} from "../../../../../../framework/controls";
import {UniFieldBuilder} from "../../../../../../framework/forms/builders/uniFieldBuilder";
import {FieldType, ComponentLayout, Address} from "../../../../../unientities";
import {UniFormLayoutBuilder} from "../../../../../../framework/forms/builders/uniFormLayoutBuilder";
import {AddressService} from "../../../../../services/services";

// Reusable address form
@Component({
    selector: 'address-form',
    directives: [UniForm,NgIf,NgModel],
    template: `
        <uni-form *ngIf="config" [config]="config">
        </uni-form>
    `
})
export class AddressForm {
    config: UniFormBuilder;
    checkboxconfig: UniFieldBuilder;

    @ViewChild(UniForm)
    form: UniForm;

    model: Address;
    saveenabled: boolean;
    
    ngOnInit()
    {
        this.createCheckboxConfig();
        this.createFormConfig();    
        this.config.addUniElement(this.checkboxconfig);  
    }
    
    createCheckboxConfig() {
        this.checkboxconfig = new UniFieldBuilder()
        this.checkboxconfig
            .setLabel("Lagre på kundekort")
            .setModel(this)
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.CHECKBOX])
            .setModelField("saveenabled");
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
                }
            ]               
        };   
        
        this.config = new UniFormLayoutBuilder().build(view, this.model);
        this.config.hideSubmitButton();
    }

}

// address modal type
@Component({
    selector: "address-modal-type",
    directives: [NgIf, NgModel, NgFor, NgClass, UniComponentLoader],
    template: `
        <article class="modal-content address-modal">
            <h1 *ngIf="config.title">{{config.title}}</h1>
            <uni-component-loader></uni-component-loader>
            <footer>
                <button *ngFor="#action of config.actions; #i=index" (click)="action.method()" [ngClass]="action.class">
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
        <uni-modal [type]="type" [config]="modalConfig"></uni-modal>
    `,
    directives: [UniModal],
    providers: [AddressService]
})
export class AddressModal {
    @ViewChild(UniModal)
    modal: UniModal;
    model: Address;
    
    @Output() Changed = new EventEmitter<Address>();
    @Output() Canceled = new EventEmitter<boolean>();

    modalConfig: any = {};

    type: Type = AddressModalType;

    constructor(private addressService: AddressService) {
        var self = this;
        this.modalConfig = {
            title: "Adresse",
            value: "Initial value",
            actions: [
                {
                    text: "Lagre adresse",
                    class: "good",
                    method: () => {
                        self.modal.getContent().then((content: AddressModalType)=> {
                            content.instance.then((form: AddressForm)=> {
                                form.form.sync();
                      
                                if (form.saveenabled) {
                                    console.log("=== LAGRER ===");
                                    // store
                                    if(form.model.ID) {
                                        addressService.Put(form.model.ID, form.model).subscribe(null, (error: Error) => console.log('error in updating phone from modal - Put: ' + error));
                                    } else {
                                        addressService.Post(form.model).subscribe(null, (error: Error) => console.error('error in posting phone from modal - Post: ', error));
                                    }                                    
                                }

                                self.modal.close();                       
                                self.Changed.emit(form.model);
                           });
                        });
                        
                        return false;
                    }
                },
                {
                    text: "Angre",
                    method: () => {
                        self.modal.getContent().then(() => {
                            self.modal.close();
                            self.Canceled.emit(true);
                        });
                        
                        return false;
                    }
                }
            ]
        };
    }

    openModal() {
        this.modal.open();
    }
}