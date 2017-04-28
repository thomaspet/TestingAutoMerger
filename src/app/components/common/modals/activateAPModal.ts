import {Component, Type, Input, Output, ViewChild, EventEmitter} from '@angular/core';
import {UniModal} from '../../../../framework/modals/modal';
import {UniForm} from 'uniform-ng2/main';
import {FieldType} from 'uniform-ng2/main';
import {ActivateAP} from '../../../models/activateAP';
import {ToastService} from '../../../../framework/uniToast/toastService';
import {ConfirmActions, IModalAction} from '../../../../framework/modals/confirm';
import {CompanySettings} from '../../../../unientities';
import {Observable} from 'rxjs/Observable';
import {
    ErrorService,
    CustomerService,
    UserService,
    CompanySettingsService
} from '../../../services/services';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

// Reusable email form
@Component({
    selector: 'activate-ap-form',
    template: `
        <article class="modal-content activate-ap-modal">
           <h1 *ngIf="config.title">{{config.title}}</h1>
           <uni-form [config]="formConfig$" [fields]="fields$" [model]="model$"></uni-form>
           <footer>
                <button *ngIf="config?.actions?.accept" (click)="config?.actions?.accept?.method()" class="good">
                    {{config?.actions?.accept?.text}}
                </button>
                <button *ngIf="config?.actions?.cancel" (click)="config?.actions?.cancel?.method()">
                    {{config?.actions?.cancel?.text}}
                </button>
            </footer>
        </article>
    `
})
export class ActivateAPForm {
    @Input() public model: ActivateAP;
    @ViewChild(UniForm) public form: UniForm;
    private config: any = {};
    private model$: BehaviorSubject<any>= new BehaviorSubject(null);
    private fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    private formConfig$: BehaviorSubject<any> = new BehaviorSubject({});

    public ngOnInit() {
        this.setupForm();
        this.model$.next(this.config.model);
    }

    private setupForm() {
        // TODO get it from the API and move these to backend migrations
        // TODO: turn to 'ComponentLayout when the object respects the interface
        this.fields$.next([
            {
                Property: 'contactname',
                FieldType: FieldType.TEXT,
                Label: 'Kontaktnavn',
                LineBreak: true
            },
            {
                Property: 'contactphone',
                FieldType: FieldType.TEXT,
                Label: 'Kontakttelefon',
                LineBreak: true
            },
            {
                Property: 'contactemail',
                FieldType: FieldType.EMAIL,
                Label: 'Kontaktepost',
                LineBreak: true
            },
            {
                Property: 'incommingInvoice',
                FieldType: FieldType.CHECKBOX,
                Label: 'Inngående faktura'
            },
            {
                Property: 'outgoingInvoice',
                FieldType: FieldType.CHECKBOX,
                Label: 'Utgående faktura'
            }
        ]);
    }
}

// email modal
@Component({
    selector: 'activate-ap-modal',
    template: `
        <uni-modal [type]="type" [config]="modalConfig"></uni-modal>
    `
})
export class ActivateAPModal {
    @Input() public email: ActivateAP;
    @ViewChild(UniModal) public modal: UniModal;

    @Output() public Changed = new EventEmitter<ActivateAP>();
    @Output() public Canceled = new EventEmitter<boolean>();

    private modalConfig: any = {};

    private type: Type<any> = ActivateAPForm;

    constructor(
        private toastService: ToastService,
        private customerService: CustomerService,
        private userService: UserService,
        private companySettingsService: CompanySettingsService,
        private errorService: ErrorService
    ) {
    }

    public ngOnInit() {
        this.modalConfig = {
            model: this.email,
            title: 'Aksesspunkt aktivering',
            actions: {
                accept: {
                    text: 'Aktiver',
                    method: () => { this.modal.close(); }
                },
                cancel: {
                    text: 'Avbryt',
                    method: () => { this.modal.close(); }
                }
            }
        };
    }

    public confirm(): Promise<any> {
        return new Promise((resolve, reject) => {
            var activate = new ActivateAP();

            Observable.forkJoin(
                this.userService.getCurrentUser(),
                this.companySettingsService.Get(1)
            ).subscribe((res) => {
                let user = res[0];
                let settings: CompanySettings = res[1];

                activate.contactname = user.DisplayName;
                activate.contactemail = user.Email;
                activate.contactphone = user.PhoneNumber;
                activate.incommingInvoice = true;
                activate.outgoingInvoice = true;

                this.modalConfig.model = activate;

                this.modalConfig.actions.accept = {
                    text: settings.APActivated ? 'Reaktiver' : 'Aktiver',
                    class: 'good',
                    method: () => {
                        resolve({model: this.modalConfig.model, status: ConfirmActions.ACCEPT});
                        this.modal.close();
                    }
                }

                this.modalConfig.actions.cancel = {
                    text: 'Avbryt',
                    method: () => {
                        resolve({status: ConfirmActions.CANCEL});
                        this.modal.close();
                    }
                }

                this.modal.open();
            });

            this.userService.getCurrentUser()
                .subscribe(user => {

                },
                err => this.errorService.handle(err)
            );
        });
    }
}
