import {Component, Input, Output, EventEmitter} from '@angular/core';
import {UniFieldLayout, FieldType} from '../../ui/uniform/index';
import {ToastService, ToastType} from '../../uniToast/toastService';
import {CompanySettings, User, BankAccount} from '../../../../src/app/unientities';
import {ActivateAP} from '../../../../src/app/models/activateAP';
import {ActivationEnum} from '../../../../src/app/models/activationEnum';
import {UniModalService} from '../modalService';
import {
    EHFService,
    UserService,
    CompanySettingsService,
    AgreementService,
    ErrorService,
    BankAccountService
} from '../../../../src/app/services/services';
import {Observable} from 'rxjs';
import {BehaviorSubject} from 'rxjs';
import {ConfirmActions, IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';
import {UniBankAccountModal} from '@uni-framework/uni-modal/modals/bankAccountModal';

@Component({
    selector: 'uni-activate-invoiceprint-modal',
    template: `
        <section role="dialog" class="uni-modal">
            <header>
                <h1>{{options.header || 'Aktiver Fakturaprint'}}</h1>
            </header>
            <article>
                <uni-form
                    [config]="formConfig$"
                    [fields]="formFields$"
                    [model]="formModel$">
                </uni-form>
            </article>

            <footer>
                <button class="warning" (click)="viewTerms()">
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
export class UniActivateInvoicePrintModal implements IUniModal {
    @Input()
    public options: IModalOptions = {};

    @Input()
    public modalService: UniModalService;

    @Output()
    public onClose: EventEmitter<any> = new EventEmitter();

    public formConfig$: BehaviorSubject<any> = new BehaviorSubject({autofocus: true});
    public formModel$: BehaviorSubject<ActivateAP> = new BehaviorSubject(null);
    public formFields$: BehaviorSubject<UniFieldLayout[]> = new BehaviorSubject([]);

    public termsAgreed: boolean;

    constructor(
        private ehfService: EHFService,
        private agreementService: AgreementService,
        private companySettingsService: CompanySettingsService,
        private userService: UserService,
        private errorService: ErrorService,
        private toastService: ToastService,
        private bankaccountService: BankAccountService
    ) {}

    public ngOnInit() {
        this.formFields$.next(this.getFormFields());
        this.extendFormConfig();
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
                'BankAccounts',
                'CompanyBankAccount'
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

                model.outgoingInvoicePrint = true;

                model.settings = settings;

                this.formModel$.next(model);
            },
            err => {
                this.errorService.handle(err);
            }
        );
    }

    public viewTerms() {
        this.agreementService.Current('INVOICEPRINT').subscribe(message => {
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
        const model = this.formModel$.getValue();
        // Save Bankaccount settings
        this.companySettingsService.Put(model.settings.ID, model.settings).subscribe(() => {
            // Activate InvoicePrint
            this.ehfService.activate('invoiceprint', model).subscribe(
                status => {
                    if (status === ActivationEnum.ACTIVATED) {
                        this.toastService.addToast('Aktivering', ToastType.good, 3, 'Fakturaprint aktivert');
                        this.ehfService.updateActivated();
                    } else if (status === ActivationEnum.EXISTING) {
                        this.toastService.addToast(
                            'Aktivering på vent',
                            ToastType.good, 10,
                            'Org.nr. er allerede aktivert, deaktiver nåværende løsning eller kontakt support.'
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
        },
        err => this.errorService.handle(err));
    }

    public close(activationCode = ActivationEnum.NOT_ACTIVATED) {
        this.onClose.emit(activationCode);
    }

    private extendFormConfig() {
        let fields = this.formFields$.getValue();

        let companyBankAccount: UniFieldLayout = fields.find(x => x.Property === 'settings.CompanyBankAccount');
        companyBankAccount.Options = this.getBankAccountOptions('settings.CompanyBankAccount', 'company');
    }

    private getBankAccountOptions(storeResultInProperty, bankAccountType) {
        return {
            entity: BankAccount,
            listProperty: 'settings.BankAccounts',
            displayValue: 'AccountNumber',
            linkProperty: 'ID',
            storeResultInProperty: storeResultInProperty,
            storeIdInProperty: storeResultInProperty + 'ID',
            editor: (bankaccount: BankAccount) => {
                if (!bankaccount || !bankaccount.ID) {
                    bankaccount = bankaccount || new BankAccount();
                    bankaccount['_createguid'] = this.bankaccountService.getNewGuid();
                    bankaccount.BankAccountType = bankAccountType;
                    bankaccount.CompanySettingsID = this.formModel$.getValue().settings.ID;
                    bankaccount.ID = 0;
                }

                const modal = this.modalService.open(UniBankAccountModal, {
                    data: bankaccount,
                    modalConfig: {
                        ledgerAccountVisible: true
                    },
                    closeOnClickOutside: false
                });

                return modal.onClose.take(1).toPromise();
            }
        };
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
                Property: 'contactemail',
                FieldType: FieldType.EMAIL,
                Label: 'Kontakt-e-post',
            },
            <any> {
                Property: 'settings.CompanyBankAccount',
                FieldType: FieldType.MULTIVALUE,
                Label: 'Driftskonto'
            },
        ];
    }
}
