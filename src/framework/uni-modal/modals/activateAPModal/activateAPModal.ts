import {Component, Input, Output, EventEmitter} from '@angular/core';
import {UniFieldLayout, FieldType} from '../../../ui/uniform/index';
import {ToastService, ToastType, ToastTime} from '../../../uniToast/toastService';
import {CompanySettings, User, BankAccount} from '../../../../app/unientities';
import {ActivateAP} from '../../../../app/models/activateAP';
import {ActivationEnum} from '../../../../app/models/activationEnum';
import {
    EHFService,
    UserService,
    CompanySettingsService,
    ErrorService,
    BankAccountService,
    ElsaProductService
} from '../../../../app/services/services';
import {Observable} from 'rxjs';
import {BehaviorSubject} from 'rxjs';
import {ConfirmActions, IModalOptions, IUniModal} from '../../interfaces';
import {UniModalService} from '../../modalService';
import {UniBankAccountModal} from '../bankAccountModal';
import {ElsaAgreement, ElsaAgreementStatus} from '@app/models';
import {theme, THEMES} from 'src/themes/theme';

@Component({
    selector: 'uni-activate-ap-modal',
    templateUrl: './activateAPModal.html',
    styleUrls: ['./activateAPModal.sass']
})
export class UniActivateAPModal implements IUniModal {
    @Input()
    public options: IModalOptions = {};

    @Input()
    public modalService: UniModalService;

    @Output()
    public onClose: EventEmitter<any> = new EventEmitter();

    public formConfig$: BehaviorSubject<any> = new BehaviorSubject({autofocus: true});
    public formModel$: BehaviorSubject<ActivateAP> = new BehaviorSubject(null);
    public formFields$: BehaviorSubject<UniFieldLayout[]> = new BehaviorSubject([]);

    terms: ElsaAgreement;
    termsAgreed: boolean;
    // if false it's incoming
    isOutgoing: boolean;
    busy: boolean = false;

    constructor(
        private ehfService: EHFService,
        private companySettingsService: CompanySettingsService,
        private userService: UserService,
        private errorService: ErrorService,
        private toastService: ToastService,
        private bankaccountService: BankAccountService,
        private elsaProductService: ElsaProductService,
    ) {}

    public ngOnInit() {
        this.isOutgoing = this.options.data.isOutgoing;
        this.busy = true;
        const filter = `name eq ${this.isOutgoing ? `'EHF_OUT'` : `'EHF'`}`;
        this.elsaProductService.GetAll(filter)
            .finally(() => {
                this.busy = false;
                this.initialize();
            })
            .subscribe(product => {
                if (product[0]?.ProductAgreement?.AgreementStatus === ElsaAgreementStatus.Active) {
                    this.terms = product[0].ProductAgreement;
                }
            });
    }

    initialize() {
        this.formFields$.next(this.getFormFields());
        this.extendFormConfig();
        this.initActivationModel();

        this.options.cancelValue = ActivationEnum.NOT_ACTIVATED;
    }

    public initActivationModel() {
        Observable.forkJoin([
            this.userService.getCurrentUser(),
            this.companySettingsService.Get(1, [
                'DefaultPhone',
                'DefaultEmail',
                'APContact.Info.DefaultPhone',
                'APContact.Info.DefaultEmail',
                'BankAccounts',
                'CompanyBankAccount'
            ])
        ]).subscribe(
            res => {
                const model = new ActivateAP();

                const user: User = res[0];
                const settings: CompanySettings = res[1];
                const apContactInfo = settings && settings.APContact && settings.APContact.Info;

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

                model.settings = settings;

                this.formModel$.next(model);
            },
            err => {
                this.errorService.handle(err);
            }
        );
    }

    public confirmTerms() {
        this.modalService.confirm({
            header: this.terms.Name,
            message: this.terms.AgreementText,
            class: 'medium',
            isMarkdown: true,
            buttonLabels: {
                accept: 'Aksepter',
                cancel: 'Tilbake'
            }
        }).onClose.subscribe(response => {
            if (response === ConfirmActions.ACCEPT) {
                this.termsAgreed = true;
            }
        });
    }

    public activate() {
        const model = this.formModel$.getValue();
        this.busy = true;
        const direction = this.isOutgoing ? 'out' : 'in';

        // Save Bankaccount settings
        this.companySettingsService.Put(model.settings.ID, model.settings).subscribe(() => {
            // Activate EHF
            this.ehfService.activate('billing', model, direction).subscribe(
                status => {
                    if (status === ActivationEnum.ACTIVATED) {
                        this.toastService.addToast(
                            'Aktivering',
                            ToastType.good,
                            3,
                            this.isOutgoing ? 'EHF sending aktivert' : 'EHF mottak aktivert'
                        );
                        this.ehfService.updateActivated();
                    } else if (status === ActivationEnum.EXISTING) {
                        this.ehfService.serviceMetadata(`0192:${model.orgnumber}`, 'CustomerInvoice').subscribe(serviceMetadata => {
                                this.toastService.addToast(
                                    'Aktivering på vent',
                                    ToastType.warn, 15,
                                    `Org.nr. ${model.orgnumber} er allerede aktivert for mottak av faktura hos ${serviceMetadata.ServiceName} og dermed kan kun sending aktiveres. For å kunne aktivere mottak må dere først få deaktivert mottak i ELMA hos tjenesten som bruker aksesspunktet ${serviceMetadata.ServiceName}. Deretter forsøk igjen eller ta kontakt med support.`
                                );
                            },
                            err => this.errorService.handle(err)
                        );
                    } else {
                        this.toastService.addToast(
                            'Aktivering feilet!',
                            ToastType.bad, 5,
                            'Noe gikk galt ved aktivering'
                        );
                    }

                    this.busy = false;
                    this.close(<any> status);
                },
                err => {
                    this.busy = false;
                    this.errorService.handle(err);
                }
            );
        },
        err => {
            this.busy = false;
            this.errorService.handle(err);
        });
    }

    public close(activationCode = ActivationEnum.NOT_ACTIVATED) {
        this.onClose.emit(activationCode);
    }

    private extendFormConfig() {
        const fields = this.formFields$.getValue();

        const companyBankAccount: UniFieldLayout = fields.find(x => x.Property === 'settings.CompanyBankAccount');
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
                Property: 'contactname',
                FieldType: FieldType.TEXT,
                Label: 'Kontaktnavn'
            },
            <any> {
                Property: 'contactphone',
                FieldType: FieldType.TEXT,
                Label: 'Kontakttelefon',
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
            <any> {
                Property: 'incommingInvoice',
                FieldType: FieldType.CHECKBOX,
                Label: 'Inngående faktura',
                Hidden: theme.theme !== THEMES.UE
            },
            <any> {
                Property: 'outgoingInvoice',
                FieldType: FieldType.CHECKBOX,
                Label: 'Utgående faktura',
                Hidden: theme.theme !== THEMES.UE
            }
        ];
    }
}
