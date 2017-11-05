import {Component, Input, Output, EventEmitter} from '@angular/core';
import {IModalOptions, IUniModal} from '../modalService';
import {UniFieldLayout, FieldType} from '../../ui/uniform/index';
import {ToastService, ToastType} from '../../uniToast/toastService';
import {CompanySettings, User} from '../../../../src/app/unientities';
import {ActivateAP} from '../../../../src/app/models/activateAP';
import {ActivationEnum} from '../../../../src/app/models/activationEnum';
import {UniModalService, ConfirmActions} from '../modalService';
import {
    EHFService,
    UserService,
    CompanySettingsService,
    AgreementService,
    ErrorService,
} from '../../../../src/app/services/services';

import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

@Component({
    selector: 'uni-activate-ap-modal',
    template: `
        <section role="dialog" class="uni-modal">
            <header>
                <h1>{{options.header || 'Aktiver aksesspunkt'}}</h1>
            </header>
            <article>
                <uni-form
                    [config]="formConfig$"
                    [fields]="formFields$"
                    [model]="formModel$">
                </uni-form>
            </article>

            <footer>
                <button class="warning" (click)="confirmTerms()">
                    Betingelser
                </button>

                <button class="good" (click)="activate()" [disabled]="!termsAgreed">
                    Aktiver
                </button>

                <button class="bad" (click)="close()">
                    Avbryt
                </button>
            </footer>
        </section>
    `
})
export class UniActivateAPModal implements IUniModal {
    @Input()
    public options: IModalOptions = {};

    @Input()
    public modalService: UniModalService;

    @Output()
    public onClose: EventEmitter<any> = new EventEmitter();

    public formConfig$: BehaviorSubject<any> = new BehaviorSubject({autofocus: true});
    private formModel$: BehaviorSubject<ActivateAP> = new BehaviorSubject(null);
    private formFields$: BehaviorSubject<UniFieldLayout[]> = new BehaviorSubject([]);

    private termsAgreed: boolean;

    constructor(
        private ehfService: EHFService,
        private agreementService: AgreementService,
        private companySettingsService: CompanySettingsService,
        private userService: UserService,
        private errorService: ErrorService,
        private toastService: ToastService
    ) {}

    public ngOnInit() {
        this.formFields$.next(this.getFormFields());
        this.initActivationModel();

        this.options.cancelValue = ActivationEnum.NOT_ACTIVATED;
    }

    public initActivationModel() {
        Observable.forkJoin(
            this.userService.getCurrentUser(),
            this.companySettingsService.Get(1, [
                'DefaultPhone',
                'DefaultEmail',
                'APContact.Info.DefaultPhone',
                'APContact.Info.DefaultEmail',
                'APIncomming',
                'APOutgoing'
        ])).subscribe(
            res => {
                let model = new ActivateAP();

                let user: User = res[0];
                let settings: CompanySettings = res[1];
                let apContactInfo = settings && settings.APContact && settings.APContact.Info;

                model.orgnumber = settings.OrganizationNumber;
                model.orgname = settings.CompanyName;
                model.orgphone = settings.DefaultPhone && settings.DefaultPhone.Number;
                model.orgemail = settings.DefaultEmail && settings.DefaultEmail.EmailAddress;
                model.contactname = apContactInfo ? apContactInfo.Name : user.DisplayName;

                model.contactemail = (apContactInfo && apContactInfo.DefaultEmail)
                    ? apContactInfo.DefaultEmail.EmailAddress
                    : user.Email;

                model.contactphone = (apContactInfo && apContactInfo.DefaultPhone && apContactInfo.DefaultPhone.Number )
                    ? settings.APContact.Info.DefaultPhone.Number
                    : user.PhoneNumber;

                model.incommingInvoice = false;
                model.outgoingInvoice = true;

                this.formModel$.next(model);
            },
            err => {
                this.errorService.handle(err);
            }
        );
    }

    public confirmTerms() {
        this.agreementService.Current('EHF').subscribe(message => {
            this.modalService.confirm({
                header: 'Betingelser',
                message: message,
                class: 'medium',
                buttonLabels: {
                    accept: 'Aksepter',
                    cancel: 'Avbryt'
                }
            }).onClose.subscribe(response => {
                if (response === ConfirmActions.ACCEPT) {
                    this.termsAgreed = true;
                }
            });
        });
    }

    public activate() {
        this.ehfService.activate(this.formModel$.getValue()).subscribe(
            status => {
                if (status === ActivationEnum.ACTIVATED) {
                    this.toastService.addToast('Aktivering', ToastType.good, 3, 'EHF aktivert');
                } else if (status === ActivationEnum.CONFIRMATION) {
                    this.toastService.addToast(
                        'Aktivering på vent',
                        ToastType.good, 10,
                        'EHF er tidligere aktivert for org.nr. Venter på godkjenning sendt på epost til kontaktepostadresse registerert på Uni Micro sitt aksesspunkt.'
                    );
                } else {
                    this.toastService.addToast(
                        'Aktivering feilet!',
                        ToastType.bad, 5,
                        'Noe gikk galt ved aktivering'
                    );
                }

                this.close(<any> status);
            },
            err => this.errorService.handle(err)
        );
    }

    public close(activationCode = ActivationEnum.NOT_ACTIVATED) {
        this.onClose.emit(activationCode);
    }

    private getFormFields(): UniFieldLayout[] {
        return [
           <any> {
                Property: 'orgnumber',
                FieldType: FieldType.TEXT,
                Label: 'Organisasjonsnummer',
            },
            <any> {
                Property: 'orgname',
                FieldType: FieldType.TEXT,
                Label: 'Firmanavn',
            },
            <any> {
                Property: 'orgphone',
                FieldType: FieldType.TEXT,
                Label: 'Telefon'
            },
            <any> {
                Property: 'orgemail',
                FieldType: FieldType.EMAIL,
                Label: 'Epost'
            },
            <any> {
                Property: 'contactname',
                FieldType: FieldType.TEXT,
                Label: 'Kontaktnavn',
            },
            <any> {
                Property: 'contactphone',
                FieldType: FieldType.TEXT,
                Label: 'Kontakttelefon',
            },
            <any> {
                Property: 'contactemail',
                FieldType: FieldType.EMAIL,
                Label: 'Kontaktepost',
            },
            <any> {
                Property: 'incommingInvoice',
                FieldType: FieldType.CHECKBOX,
                Label: 'Inngående faktura'
            },
            <any> {
                Property: 'outgoingInvoice',
                FieldType: FieldType.CHECKBOX,
                Label: 'Utgående faktura'
            }
        ];
    }
}
