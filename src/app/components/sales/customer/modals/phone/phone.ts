import {Component, ViewChildren, Type, Input, Output, QueryList, ViewChild, ComponentRef, EventEmitter} from "angular2/core";
import {NgIf, NgModel, NgFor} from "angular2/common";
import {UniModal} from "../../../../../../framework/modals/modal";
import {UniComponentLoader} from "../../../../../../framework/core/componentLoader";
import {UniFormBuilder} from "../../../../../../framework/forms/builders/uniFormBuilder";
import {UniForm} from "../../../../../../framework/forms/uniForm";
import {UNI_CONTROL_DIRECTIVES} from "../../../../../../framework/controls";
import {UniFieldBuilder} from "../../../../../../framework/forms/builders/uniFieldBuilder";
import {FieldType, ComponentLayout, Phone, PhoneTypeEnum} from "../../../../../unientities";
import {UniFormLayoutBuilder} from "../../../../../../framework/forms/builders/uniFormLayoutBuilder";
import {PhoneService} from "../../../../../services/services";

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

    model: Phone;
    
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
        
        this.config = new UniFormLayoutBuilder().build(view, this.model);
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
        <article class="modal-content phone-modal">
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
    directives: [UniModal],
    providers: [PhoneService]
})
export class PhoneModal {
    @ViewChild(UniModal)
    modal: UniModal;
    
    @Output() Changed = new EventEmitter<Phone>();
    
    modalConfig: any = {};

    type: Type = PhoneModalType;

    constructor(private phoneService: PhoneService) {
        var self = this;
        this.modalConfig = {
            title: "Telefonnummer",
            actions: [
                {
                    text: "Accept",
                    method: () => {
                        self.modal.getContent().then((content: PhoneModalType)=> {
                            content.instance.then((form: PhoneForm)=> {
                                form.form.updateModel();
                                self.modal.close();                               
                                
                                // store
                                if(form.model.ID) {
                                    phoneService.Put(form.model.ID, form.model).subscribe(null, (error: Error) => console.log('error in updating phone from modal - Put: ' + error));
                                } else {
                                    phoneService.Post(form.model).subscribe(null, (error: Error) => console.error('error in posting phone from modal - Post: ', error));
                                }
                                
                                self.Changed.emit(form.model);
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