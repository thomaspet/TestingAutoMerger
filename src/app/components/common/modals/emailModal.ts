import {Component, Type, Input, Output, ViewChild, EventEmitter} from '@angular/core';
import {UniModal} from '../../../../framework/modals/modal';
import {UniForm} from '../../../../framework/uniform';
import {Email} from '../../../unientities';
import {EmailService} from '../../../services/services';

// Reusable email form
@Component({
    selector: 'email-form',
    template: `
        <article class="modal-content email-modal">
           <h1 *ngIf="config.title">{{config.title}}</h1>
           <uni-form [config]="formConfig" [fields]="fields" [model]="config.model"></uni-form>
           <footer>
                <button *ngFor="let action of config.actions; let i=index" (click)="action.method()" [ngClass]="action.class" type="button">
                    {{action.text}}
                </button>                
            </footer>
        </article>
    `
})
export class EmailForm {    
    @Input() public model: Email;
    @ViewChild(UniForm) public form: UniForm;
    private config: any = {};
    private fields: any[] = [];
    private formConfig: any = {};
       
    public ngOnInit() {
        this.setupForm();      
    }
 
    private setupForm() {   
        // TODO get it from the API and move these to backend migrations
        // TODO: turn to 'ComponentLayout when the object respects the interface
        this.fields = [
            {
                ComponentLayoutID: 1,
                EntityType: 'Email',
                Property: 'EmailAddress',
                Placement: 1,
                Hidden: false,
                FieldType: 11,
                ReadOnly: false,
                LookupField: false,
                Label: 'Epostadresse',
                Description: '',
                HelpText: '',
                FieldSet: 0,
                Section: 0,
                Placeholder: null,
                Options: null,
                LineBreak: null,
                Combo: null,
                Legend: '',
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
                EntityType: 'Email',
                Property: 'Description',
                Placement: 1,
                Hidden: false,
                FieldType: 10,
                ReadOnly: false,
                LookupField: false,
                Label: 'Beskrivelse',
                Description: '',
                HelpText: '',
                FieldSet: 0,
                Section: 0,
                Placeholder: null,
                Options: null,
                LineBreak: null,
                Combo: null,
                Legend: '',
                StatusCode: 0,
                ID: 2,
                Deleted: false,
                CreatedAt: null,
                UpdatedAt: null,
                CreatedBy: null,
                UpdatedBy: null,
                CustomFields: null 
            } 
        ];
    }

}

// email modal
@Component({
    selector: 'email-modal',
    template: `
        <uni-modal [type]="type" [config]="modalConfig"></uni-modal>
    `
})
export class EmailModal {
    @Input() public email: Email;    
    @ViewChild(UniModal) public modal: UniModal;
    
    @Output() public Changed = new EventEmitter<Email>();
    @Output() public Canceled = new EventEmitter<boolean>();

    private modalConfig: any = {};    

    private type: Type = EmailForm;

    constructor(private emailService: EmailService) {
    }
    
    public ngOnInit() {    
        this.modalConfig = {
            model: this.email,            
            title: 'Epost',
            actions: [
                {
                    text: 'Lagre epost',
                    class: 'good',
                    method: () => {               
                        this.modal.close();
                        this.Changed.emit(this.modalConfig.model);
                        return false;
                    }
                },
                {
                    text: 'Avbryt',
                    method: () => {
                        this.modal.close();
                        this.Canceled.emit(true);
                        return false;
                    }
                }
            ]
        };
    }

    public openModal(email: Email) {  
        this.modalConfig.model = email;    
        this.modal.open();
    }
}
