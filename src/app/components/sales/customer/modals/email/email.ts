import {Component, ViewChildren, Type, Input, QueryList, ViewChild, ComponentRef} from "angular2/core";
import {NgIf, NgModel, NgFor} from "angular2/common";
import {UniModal} from "../../../../../../framework/modals/modal";
import {UniComponentLoader} from "../../../../../../framework/core/componentLoader";
import {UniFormBuilder} from "../../../../../../framework/forms/builders/uniFormBuilder";
import {UniForm} from "../../../../../../framework/forms/uniForm";
import {UNI_CONTROL_DIRECTIVES} from "../../../../../../framework/controls";
import {UniFieldBuilder} from "../../../../../../framework/forms/builders/uniFieldBuilder";
import {FieldType, ComponentLayout, Email} from "../../../../../unientities";
import {UniFormLayoutBuilder} from "../../../../../../framework/forms/builders/uniFormLayoutBuilder";

// Reusable email form
@Component({
    selector: 'email-form',
    directives: [UniForm,NgIf],
    template: `
        <uni-form *ngIf="config" [config]="config">
        </uni-form>
    `
})
export class EmailForm {
    config: UniFormBuilder;

    @ViewChild(UniForm)
    form: UniForm;

    Email: Email;

    constructor() {
        this.Email = new Email();
        this.Email.EmailAddress = "terje@senikk.com";
        this.Email.Description = "privat adresse";
    }
       
    ngOnInit()
    {
        this.createFormConfig();      
    }
 
    createFormConfig() {   
        // TODO get it from the API and move these to backend migrations   
        var view: ComponentLayout = {
            Name: "Email",
            BaseEntity: "Email",
            StatusCode: 0,
            Deleted: false,
            ID: 1,
            CustomFields: null,
            Fields: [
                {
                    ComponentLayoutID: 1,
                    EntityType: "Email",
                    Property: "EmailAddress",
                    Placement: 1,
                    Hidden: false,
                    FieldType: 11,
                    ReadOnly: false,
                    LookupField: false,
                    Label: "Epostadresse",
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
                    EntityType: "Email",
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
                } 
            ]               
        };   
        
        this.config = new UniFormLayoutBuilder().build(view, this.Email);
        this.config.hideSubmitButton();
    }

}

// email modal type
@Component({
    selector: "email-modal-type",
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
export class EmailModalType {
    @Input('config')
    config;
    @ViewChild(UniComponentLoader)
    ucl: UniComponentLoader;
    instance: Promise<EmailForm>;
            
    ngAfterViewInit() {
        var self = this;
        this.ucl.load(EmailForm).then((cmp: ComponentRef)=> {
            self.instance = new Promise((resolve)=> {
                resolve(cmp.instance);
            });
        });
    }
}

// email modal
@Component({
    selector: "email-modal",
    template: `
        <button (click)="openModal()">Epost modal</button>
        <uni-modal [type]="type" [config]="modalConfig"></uni-modal>
    `,
    directives: [UniModal]
})
export class EmailModal {
    @ViewChild(UniModal)
    modal: UniModal;
    modalConfig: any = {};

    type: Type = EmailModalType;

    constructor() {
        var self = this;
        this.modalConfig = {
            title: "Epost",
            value: "Initial value",
            actions: [
                {
                    text: "Accept",
                    method: () => {
                        self.modal.getContent().then((content: EmailModalType)=> {
                            content.instance.then((rc: EmailForm)=> {
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