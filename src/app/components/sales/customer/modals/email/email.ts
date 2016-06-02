import {Component, ViewChildren, Type, Input, Output, QueryList, ViewChild, ComponentRef, EventEmitter} from "@angular/core";
import {NgIf, NgModel, NgFor, NgClass} from "@angular/common";
import {UniModal} from "../../../../../../framework/modals/modal";
import {UniComponentLoader} from "../../../../../../framework/core/componentLoader";
import {UniFormBuilder} from "../../../../../../framework/forms/builders/uniFormBuilder";
import {UniForm} from "../../../../../../framework/forms/uniForm";
import {UNI_CONTROL_DIRECTIVES} from "../../../../../../framework/controls";
import {UniFieldBuilder} from "../../../../../../framework/forms/builders/uniFieldBuilder";
import {FieldType, ComponentLayout, Email} from "../../../../../unientities";
import {UniFormLayoutBuilder} from "../../../../../../framework/forms/builders/uniFormLayoutBuilder";
import {EmailService} from "../../../../../services/services";

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

    model: Email;
       
    ngOnInit()
    {
        this.createFormConfig();      
    }
 
    createFormConfig() {   
        // TODO get it from the API and move these to backend migrations
        // TODO: turn to 'ComponentLayout when the object respects the interface
        var view: any = {
            Name: "Email",
            BaseEntity: "Email",
            StatusCode: 0,
            Deleted: false,
            CreatedAt: null,
            UpdatedAt: null,
            CreatedBy: null,
            UpdatedBy: null,
            ID: 3,
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
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: "",
                    StatusCode: 0,
                    ID: 1,
                    Deleted: false,
                    CreatedAt: null,
                    UpdatedAt: null,
                    CreatedBy: null,
                    UpdatedBy: null,
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
                    Placeholder: null,
                    Options: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: "",
                    StatusCode: 0,
                    ID: 2,
                    Deleted: false,
                    CreatedAt: null,
                    UpdatedAt: null,
                    CreatedBy: null,
                    UpdatedBy: null,
                    CustomFields: null 
                } 
            ]               
        };   
        
        this.config = new UniFormLayoutBuilder().build(view, this.model);
        this.config.hideSubmitButton();
    }

}

// email modal type
@Component({
    selector: "email-modal-type",
    directives: [NgIf, NgModel, NgFor, NgClass, UniComponentLoader],
    template: `
        <article class="modal-content email-modal">
            <h1 *ngIf="config.title">{{config.title}}</h1>
            <uni-component-loader></uni-component-loader>
            <footer>
                <button *ngFor="let action of config.actions; let i=index" (click)="action.method()" [ngClass]="action.class">
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
        this.ucl.load(EmailForm).then((cmp: ComponentRef<any>)=> {
            cmp.instance.model = self.config.model;
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
        <uni-modal [type]="type" [config]="modalConfig"></uni-modal>
    `,
    directives: [UniModal],
    providers: [EmailService]
})
export class EmailModal {
    @ViewChild(UniModal)
    modal: UniModal;
    
    @Output() Changed = new EventEmitter<Email>();
    @Output() Canceled = new EventEmitter<boolean>();

    modalConfig: any = {};
    

    type: Type = EmailModalType;

    constructor(private emailService: EmailService) {
        var self = this;
        this.modalConfig = {
            title: "Epost",
            actions: [
                {
                    text: "Lagre epost",
                    class: "good",
                    method: () => {
                        self.modal.getContent().then((content: EmailModalType)=> {
                            content.instance.then((form: EmailForm)=> {
                                form.form.sync();
                                self.modal.close();       
                                
                                // store
                                //if(form.model.ID) {
                                //    emailService.Put(form.model.ID, form.model).subscribe(null, (error: Error) => console.log('error in updating phone from modal - Put: ' + error));
                                //} else {
                                //    emailService.Post(form.model).subscribe(null, (error: Error) => console.error('error in posting phone from modal - Post: ', error));
                                //}
                                                        
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
