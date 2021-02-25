import {Component, Input, Output, EventEmitter} from '@angular/core';
import {UniFieldLayout, FieldType} from '../../ui/uniform/index';
import {ToastService, ToastType, ToastTime} from '../../uniToast/toastService';
import {CompanySettings, User} from '../../../../src/app/unientities';
import {ActivationEnum} from '../../../../src/app/models/activationEnum';
import {UniModalService} from '../modalService';
import {
    UserService,
    CompanySettingsService,
    ErrorService,
    PaymentInfoTypeService,
    ElsaProductService,
    NumberFormat
} from '../../../../src/app/services/services';
import {Observable} from 'rxjs';
import {BehaviorSubject} from 'rxjs';
import {ConfirmActions, IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';
import {ElsaAgreement, ElsaAgreementStatus} from '@app/models';

@Component({
    selector: 'uni-activate-einvoice-modal',
    template: `
        <section role="dialog" class="uni-modal">
            <header>{{options.header || 'Aktiver Efaktura'}}</header>
            <article>

                <section *ngIf="busy" class="modal-spinner">
                    <mat-spinner class="c2a"></mat-spinner>
                </section>

                <p *ngIf="!isMissingData">
                   Opplysningene under vil oversendes Nets for aktivering av Efaktura. Vennligst se over at
                   disse opplysningene er riktige før du fortsetter. Eventuelle endringer gjøres under
                   firmainnstillinger/KID-innstillinger.
                </p>
                <p *ngIf="isMissingData" class="bad">
                    <strong>
                        Du kan ikke aktivere Efaktura på grunn av at noen av feltene under mangler informasjon.
                        Vennligst registrer disse opplysningene under firmainnstillinger/KID-innstillinger og prøv igjen.
                    </strong>
                </p>
                <uni-form
                    [config]="formConfig$"
                    [fields]="formFields$"
                    [model]="formModel$">
                </uni-form>

                <section *ngIf="terms" class="termsCheckbox">
                    <mat-checkbox [(ngModel)]="termsAgreed">
                        <span class="checkboxLabel" (click)="$event.preventDefault()">
                            Jeg har lest og forstått <a (click)="$event.preventDefault(); confirmTerms()">avtalen</a>
                        </span>
                    </mat-checkbox>
                </section>

                <p>
                   <strong>NB!</strong> Aktivering av Efaktura vil erstatte Efakturaavtaler du har etablert i andre systemer.
                   Ta kontakt med kundesenter hvis du har en eksisterende Efakturaavtale fra før!
                </p>
                <p>
                   For at Efaktura skal fungere må det være inngått en KID-avtale med banken for kontoen
                   som er oppgitt.
                </p>
            </article>

            <footer>
                <button class="secondary pull-left" (click)="close()">
                    Avbryt
                </button>

                <button class="c2a" (click)="activate()"
                    title="Betingelser må aksepteres før du kan aktivere Efaktura"
                    [disabled]="(!termsAgreed && terms) || isMissingData">
                    Aktiver Efaktura
                </button>
            </footer>
        </section>
    `,
    styles: [`
        .termsCheckbox {
            margin-top: 1rem;
            margin-left: 0.5rem;
        }
        .checkboxLabel {
            cursor: default;
        }
    `]
})
export class UniActivateEInvoiceModal implements IUniModal {
    @Input()
    public options: IModalOptions = {};

    @Input()
    public modalService: UniModalService;

    @Output()
    public onClose: EventEmitter<any> = new EventEmitter();

    public formConfig$: BehaviorSubject<any> = new BehaviorSubject({autofocus: true});
    public formModel$: BehaviorSubject<any> = new BehaviorSubject(null);
    public formFields$: BehaviorSubject<UniFieldLayout[]> = new BehaviorSubject([]);

    terms: ElsaAgreement;
    termsAgreed: boolean;
    isMissingData: boolean;
    busy: boolean = false;

    constructor(
        private companySettingsService: CompanySettingsService,
        private paymentInfoTypeService: PaymentInfoTypeService,
        private userService: UserService,
        private errorService: ErrorService,
        private toastService: ToastService,
        private elsaProductService: ElsaProductService,
        private numberFormat: NumberFormat,
    ) {}

    public ngOnInit() {
        this.busy = true;
        const filter = `name eq 'efakturab2c'`;
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
        this.initActivationModel();

        this.options.cancelValue = ActivationEnum.NOT_ACTIVATED;
    }

    public initActivationModel() {
        Observable.forkJoin([
            this.userService.getCurrentUser(),
            this.companySettingsService.Get(1, [
                'DefaultEmail',
                'CompanyBankAccount',
                'DefaultAddress'
            ]),
            this.paymentInfoTypeService.GetAll(
                'paymentinfotype?filter=Type eq 1 and StatusCode eq 42400&orderby=ID,Type,PaymentInfoTypeParts.SortIndex asc',
                ['PaymentInfoTypeParts'])
            ]).subscribe(res => {
                const model = <any>{};

                const user: User = res[0];
                const settings: CompanySettings = res[1];
                const kidSettings = res[2].length > 0 ? res[2][0] : null;

                model.orgnumber = settings.OrganizationNumber;
                model.orgname = settings.CompanyName;
                if (settings.DefaultEmail) {
                    model.orgemail = settings.DefaultEmail && settings.DefaultEmail.EmailAddress;
                }
                if (settings.DefaultAddress) {
                    model.postalCity = settings.DefaultAddress.City;
                    model.postalCode = settings.DefaultAddress.PostalCode;
                    model.countryCode = settings.DefaultAddress.CountryCode || 'NO';
                }
                if (settings.CompanyBankAccount) {
                    model.accountNumber = settings.CompanyBankAccount.AccountNumber;
                }

                // get the position that will be used to retrieve the customer number
                if (kidSettings && kidSettings.PaymentInfoTypeParts) {
                    let currStart = 1;
                    let customerReferencePosition = null;
                    for (let i = 0; i < kidSettings.PaymentInfoTypeParts.length; i++) {
                        const part = kidSettings.PaymentInfoTypeParts[i];

                        if (part.Part === '<customer_number>') {
                            customerReferencePosition = currStart + '-' + (currStart - 1 + part.Length);
                            break;
                        }

                        currStart += part.Length;
                    }

                    model.customerReferencePosition = customerReferencePosition;
                }

                this.isMissingData =
                    !model.orgname
                    || !model.orgnumber
                    || model.orgnumber.length !== 9
                    || !model.orgemail
                    || !model.postalCity
                    || !model.postalCode
                    || !model.countryCode
                    || !model.accountNumber
                    || !model.customerReferencePosition;

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
            isMarkdown: true,
            class: 'medium',
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
        this.busy = true;
        const model = this.formModel$.getValue();

        // activate einvoice using action - this will update companysettings and trigger jobserver activation job
        this.companySettingsService.Action(1, 'activate-einvoice').subscribe(
            status => {

                this.toastService.addToast(
                    'Aktivering er startet',
                    ToastType.good,
                    ToastTime.medium,
                    'Du vil få en bekreftelse på epost når aktiveringen er ferdig, eller hvis noe går galt');

                this.close(<any> status);
            },
            err => {
                this.busy = false;
                this.errorService.handle(err);
            }
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
                ReadOnly: true
            },
            <any> {
                Property: 'orgname',
                FieldType: FieldType.TEXT,
                Label: 'Firmanavn',
                ReadOnly: true
            },
            <any> {
                Property: 'orgemail',
                FieldType: FieldType.TEXT,
                Label: 'E-post',
                ReadOnly: true
            },
            <any> {
                Property: 'postalCode',
                FieldType: FieldType.TEXT,
                Label: 'Postnr',
                ReadOnly: true
            },
            <any> {
                Property: 'postalCity',
                FieldType: FieldType.TEXT,
                Label: 'Poststed',
                ReadOnly: true
            },
            <any> {
                Property: 'countryCode',
                FieldType: FieldType.TEXT,
                Label: 'Landkode',
                ReadOnly: true
            },
            <any> {
                Property: 'accountNumber',
                FieldType: FieldType.BANKACCOUNT,
                Label: 'Bankkontonr',
                ReadOnly: true
            },
            <any> {
                Property: 'customerReferencePosition',
                FieldType: FieldType.TEXT,
                Label: 'Posisjon kundenr i KID',
                ReadOnly: true
            }
        ];
    }
}
