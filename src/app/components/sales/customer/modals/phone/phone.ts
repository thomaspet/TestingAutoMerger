import {Component, ViewChildren, Type, Input, QueryList, ViewChild, ComponentRef} from "angular2/core";
import {NgIf, NgModel, NgFor} from "angular2/common";
import {UniModal} from "../../../../../../framework/modals/modal";
import {UniComponentLoader} from "../../../../../../framework/core/componentLoader";
import {UniFormBuilder} from "../../../../../../framework/forms/builders/uniFormBuilder";
import {UniForm} from "../../../../../../framework/forms/uniForm";
import {UNI_CONTROL_DIRECTIVES} from "../../../../../../framework/controls";
import {UniFieldBuilder} from "../../../../../../framework/forms/builders/uniFieldBuilder";
import {FieldType, ComponentLayout, Phone, PhoneTypeEnum} from "../../../../../unientities";
import {UniFormLayoutBuilder} from "../../../../../../framework/forms/builders/uniFormLayoutBuilder";

// Reusable address form
@Component({
    selector: 'phone-form',
    directives: [UniForm,NgIf],
    template: `
        <uni-form *ngIf="config" [config]="config">
        </uni-form>
    `
})
export class PhoneForm {
    config: UniFormBuilder;

    @ViewChild(UniForm)
    form: UniForm;

    Phone: Phone;

    constructor() {
        this.Phone = new Phone();
        this.Phone.Number = "91334697";
        this.Phone.Description = "privat mobil";
        this.Phone.Type = PhoneTypeEnum.PtMobile;
    }
    
    ngOnInit()
    {
        this.createFormConfig();      
        this.extendFormConfig();
    }
       
    createFormConfig() {   
        // TODO get it from the API and move these to backend migrations   
        var view: ComponentLayout = {
            Name: "Phone",
            BaseEntity: "Phone",
            StatusCode: 0,
            Deleted: false,
            ID: 1,
            CustomFields: null,
            Fields: [
                {
                    ComponentLayoutID: 1,
                    EntityType: "Phone",
                    Property: "Number",
                    Placement: 1,
                    Hidden: false,
                    FieldType: 10,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Telefonnr",
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
                    EntityType: "Phone",
                    Property: "Description",
                    Placement: 1,
                    Hidden: false,
                    FieldType: 10,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Beskrivelse",
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
                    EntityType: "Phone",
                    Property: "Type",
                    Placement: 1,
                    Hidden: false,
                    FieldType: 1,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Type",
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
        
        this.config = new UniFormLayoutBuilder().build(view, this.Phone);
        this.config.hideSubmitButton();
    }

    extendFormConfig() {
        var project: UniFieldBuilder = this.config.find('Type');
        project.setKendoOptions({
            dataTextField: 'Name',
            dataValueField: 'ID',
            dataSource: [
                {ID: 150101, Name: "Telefon"},
                {ID: 150102, Name: "Mobil" },
                {ID: 150103, Name: "Fax"}
            ]
        });      
        project.addClass('large-field');            
    }   
}

// phone modal type
@Component({
    selector: "phone-modal-type",
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
export class PhoneModalType {
    @Input('config')
    config;
    @ViewChild(UniComponentLoader)
    ucl: UniComponentLoader;
    instance: Promise<PhoneForm>;
            
    ngAfterViewInit() {
        var self = this;
        this.ucl.load(PhoneForm).then((cmp: ComponentRef)=> {
            self.instance = new Promise((resolve)=> {
                resolve(cmp.instance);
            });
        });
    }
}

// phone modal
@Component({
    selector: "phone-modal",
    template: `
        <uni-modal [type]="type" [config]="modalConfig"></uni-modal>
    `,
    directives: [UniModal]
})
export class PhoneModal {
    @ViewChild(UniModal)
    modal: UniModal;
    modalConfig: any = {};

    type: Type = PhoneModalType;

    constructor() {
        var self = this;
        this.modalConfig = {
            title: "Telefonnummer",
            value: "Initial value",
            actions: [
                {
                    text: "Accept",
                    method: () => {
                        self.modal.getContent().then((content: PhoneModalType)=> {
                            content.instance.then((rc: PhoneForm)=> {
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