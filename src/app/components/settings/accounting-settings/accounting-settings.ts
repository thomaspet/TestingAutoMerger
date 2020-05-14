import {Component, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {
    CompanySettingsService,
    PeriodSeriesService,
    VatReportFormService,
    ErrorService,
    CurrencyCodeService,
    PageStateService,
    ElsaPurchaseService,
    EHFService
} from '@app/services/services';
import {TabService, UniModules} from '@app/components/layout/navbar/tabstrip/tabService';
import {UniSearchAccountConfig} from '@app/services/common/uniSearchConfig/uniSearchAccountConfig';
import {CompanySettings, CurrencyCode} from '@app/unientities';
import { Observable, BehaviorSubject } from 'rxjs';
import {IUniTab} from '@uni-framework/uni-tabs';
import {FieldType} from '@uni-framework/ui/uniform/index';
import {
    UniModalService,
    ConfirmActions,
    ActivateOCRModal,
    UniActivateAPModal,
} from '@uni-framework/uni-modal';
import {VatTypeSettingsList} from './vattype-settings-list/vattype-settings-list';
import {VatDeductionSettings} from './vat-deductions/vat-deduction-settings';
import { UniFieldLayout } from '../../../../framework/ui/uniform';

@Component({
    selector: 'uni-company-accounting-view',
    templateUrl: './accounting-settings.html',
    styleUrls: ['../sales-settings/sales-settings.sass']
})

export class UniCompanyAccountingView {

    @ViewChild(VatTypeSettingsList)
    private vattypeList: VatTypeSettingsList;

    @ViewChild(VatDeductionSettings)
    private vatDeducationView: VatDeductionSettings;

    expands = [
        'BaseCurrencyCode',
        'AgioGainAccount',
        'AgioLossAccount',
        'SupplierAccount',
        'CustomerAccount',
        'AcceptableDelta4CustomerPaymentAccount'
    ];
    isDirty: boolean = false;
    periods: any[] = [];

    vatPeriods: any[] = [];
    accountingPeriods: any[] = [];
    vatReportForms: any[] = [];
    currencyCodes: Array<CurrencyCode> = [];
    activeIndex: number = 0;
    tabs: IUniTab[] = [
        {name: 'Regnskapsinnstillinger'},
        {name: 'Mvakoder'},
        {name: 'Forholdsmessig MVA / fradrag'}
    ];

    eInvoiceItems: any[] = [
        { name: 'EHF', isActivated: false, value: 1 },
        { name: 'OCR-tolkning', isActivated: false, value: 2 }
    ];

    companySettings$ = new BehaviorSubject<CompanySettings>(null);
    fields$ = new BehaviorSubject<UniFieldLayout[]>([]);
    fieldsVat$ = new BehaviorSubject<UniFieldLayout[]>([]);
    fieldsCurrency$ = new BehaviorSubject<UniFieldLayout[]>([]);

    vatMandatoryOptions = [
        { ID: 1, Name: 'Avgiftsfri'},
        { ID: 2, Name: 'Avgiftsfri, men planlegger mva-registrering når omsetningsgrensen passeres'},
        { ID: 3, Name: 'Avgiftspliktig'}
    ];

    saveActions: any[] = [
        {
            label: 'Lagre innstillinger',
            action: done => this.saveCompanySettings(done),
            main: true,
            disabled: false
        },
    ];

    constructor (
        private companySettingsService: CompanySettingsService,
        private periodeSeriesService: PeriodSeriesService,
        private tabService: TabService,
        private vatReportFormService: VatReportFormService,
        private uniSearchAccountConfig: UniSearchAccountConfig,
        private currencyCodeService: CurrencyCodeService,
        private errorService: ErrorService,
        private modalService: UniModalService,
        private pageStateService: PageStateService,
        private route: ActivatedRoute,
        private router: Router,
        private elsaPurchasesService: ElsaPurchaseService,
        private ehfService: EHFService,
    ) { }

    ngOnInit() {

        this.route.queryParams.subscribe(params => {
            const index = +params['index'];
            if (!isNaN(index) && index >= 0 && index < this.tabs.length) {
                this.activeIndex = index;
            }
            this.fields$.next(this.getFormFields(0));
            this.fieldsVat$.next(this.getFormFields(1));
            this.fieldsCurrency$.next(this.getFormFields(2));
            this.updateTabAndUrl();
            this.reloadCompanySettingsData();
        });
    }

    ngOnDestroy() {
        this.companySettings$.complete();
        this.fields$.complete();
        this.fieldsVat$.complete();
        this.fieldsCurrency$.complete();
    }

    reloadCompanySettingsData() {
        Observable.forkJoin(
            this.companySettingsService.Get(1, this.expands),
            this.periodeSeriesService.GetAll(null),
            this.vatReportFormService.GetAll(null),
            this.currencyCodeService.GetAll(null),
        ).subscribe((response) => {
            this.companySettings$.next(response[0]);
            this.periods = response[1];

            this.accountingPeriods = this.periods.filter((value) => value.SeriesType.toString() === '1');
            this.vatPeriods = this.periods.filter((value) => value.SeriesType.toString() === '0');

            this.vatReportForms = response[2];
            this.currencyCodes = response[3];
            this.reinitFormFields();
            this.updateTabAndUrl();

            this.eInvoiceItems[0].isActivated = this.ehfService.isEHFActivated(response[0]);
            this.eInvoiceItems[1].isActivated = response[0].UseOcrInterpretation;

        }, err => {
            this.errorService.handle(err);
        });
    }

    reloadOnlyCompanySettings() {
        this.companySettingsService.Get(1, this.expands).subscribe(response => {
            this.companySettings$.next(response);
        });
    }

    reinitFormFields() {
        this.fields$.next(this.getFormFields(0));
        this.fieldsVat$.next(this.getFormFields(1));
        this.fieldsCurrency$.next(this.getFormFields(2));
    }

    updateTabAndUrl() {
        this.pageStateService.setPageState('index', this.activeIndex + '');
        this.tabService.addTab({
            name: 'Innstillinger - Regnskap',
            url: '/settings/accounting?index=' + this.activeIndex,
            moduleID: UniModules.SubSettings,
            active: true
       });
    }

    onEInvoiceItemClick(item) {
        switch (item.value) {
            // EHF
            case 1:
                this.activateProduct('EHF', this.openActivateAPModal.bind(this));
                break;
            // OCR
            case 2:
                if (item.isActivated) {
                    this.companySettingsService.PostAction(1, 'reject-ocr-agreement').subscribe(() => {
                        const settings = this.companySettings$.getValue();
                        settings.UseOcrInterpretation = false;
                        this.companySettings$.next(settings);
                    }, err => this.errorService.handle(err));
                } else {
                    this.activateProduct('OCR-SCAN', this.openActivateOCRModal.bind(this));
                }
            break;
        }
    }

    private activateProduct(productName: string, activationModal: () => void) {
        this.elsaPurchasesService.getPurchaseByProductName(productName).subscribe(purchase => {
            if (purchase) {
                activationModal();
            } else {
                this.router.navigateByUrl(`/marketplace/modules?productName=${productName}`);
            }
        });
    }

    private openActivateAPModal() {
        this.modalService.open(UniActivateAPModal).onClose.subscribe((status) => {
            if (status !== 0) {
                this.companySettingsService.Get(1).subscribe(settings => {
                    const company = this.companySettings$.getValue();
                    company.BankAccounts = settings.BankAccounts;
                    company.CompanyBankAccount = settings.CompanyBankAccount;
                    this.companySettings$.next(company);
                });
            }
        }, err => this.errorService.handle(err) );
    }

    private openActivateOCRModal() {
        this.modalService.open(ActivateOCRModal).onClose.subscribe(activated => {
            if (activated) {
                const settings = this.companySettings$.getValue();
                settings.UseOcrInterpretation = true;
                this.companySettings$.next(settings);
            }
        });
    }

    saveCompanySettings(done?) {
        return new Promise((res) => {
            const companySettings = this.companySettings$.getValue();
            if (!this.isDirty && !this.vattypeList.hasChanges && !this.vatDeducationView.isDirty) {
                done('Ingen endringer');
                return;
            }

            // Remove accounts from query
            companySettings.CustomerAccount = null;
            companySettings.SupplierAccount = null;
            companySettings.AgioGainAccount = null;
            companySettings.AgioLossAccount = null;
            companySettings.BaseCurrencyCode = null;
            companySettings.AcceptableDelta4CustomerPaymentAccount = null;

            Observable.forkJoin(
                this.companySettingsService.Put(companySettings.ID, companySettings),
                this.vattypeList.saveVatType(),
                this.vatDeducationView.saveVatDeductions()
            ).subscribe((response) => {
                this.isDirty = false;
                if (done) {
                    done('Innstillinger lagret');
                    this.reloadOnlyCompanySettings();
                    this.vattypeList.vatTypeSaved();
                    this.vatDeducationView.loadData();
                }
                res(true);
            }, err => {
                if (done) {
                    done('Lagring feilet. Sjekk at info stemmer, eller last inn siden på nytt og prøv igjen.');
                }
                res(false);
                this.errorService.handle(err);
            });
        });
    }

    canDeactivate(): boolean | Observable<boolean> {
        if (!this.isDirty && !this.vattypeList.hasChanges && !this.vatDeducationView.isDirty) {
            return true;
        }

        const modalOptions = {
            header: 'Ulagrede endringer',
            message: 'Du har endringer i innstillingene som ikke er lagret. Ønsker du å lagre disse før du fortsetter?',
            buttonLabels: {
                accept: 'Lagre',
                reject: 'Forkast',
                cancel: 'Avbryt'
            }
        };

        return this.modalService.confirm(modalOptions).onClose.switchMap(confirm => {
            if (confirm === ConfirmActions.ACCEPT) {
                return this.saveCompanySettings().then(res => true).catch(res => false);
            }
            return Observable.of(confirm !== ConfirmActions.CANCEL);
        });
    }

    private getFormFields(index: number) {
        let fields = [];
        switch (index) {
            case 0:
                fields = [
                    {
                        EntityType: 'CompanySettings',
                        Property: 'CustomerAccountID',
                        FieldType: FieldType.UNI_SEARCH,
                        Label: 'Kundereskontro samlekonto',
                        Options: {
                            uniSearchConfig: this.uniSearchAccountConfig.generateOnlyMainAccountsConfig(),
                            valueProperty: 'ID'
                        }
                    },
                    {
                        EntityType: 'CompanySettings',
                        Property: 'SupplierAccountID',
                        FieldType: FieldType.UNI_SEARCH,
                        Label: 'Leverandørreskontro samlekonto',
                        Options: {
                            uniSearchConfig: this.uniSearchAccountConfig.generateOnlyMainAccountsConfig(),
                            valueProperty: 'ID'
                        }
                    }
                ];
                break;
            case 1:
                fields = [
                    {
                        EntityType: 'CompanySettings',
                        Property: 'PeriodSeriesAccountID',
                        FieldType: FieldType.DROPDOWN,
                        Label: 'Regnskapsperioder',
                        Options: {
                            source: this.accountingPeriods,
                            valueProperty: 'ID',
                            displayProperty: 'Name',
                            debounceTime: 200
                        }
                    },
                    {
                        EntityType: 'CompanySettings',
                        Property: 'AccountingLockedDate',
                        FieldType: FieldType.LOCAL_DATE_PICKER,
                        Label: 'Regnskap låst til',
                    },
                    {
                        EntityType: 'CompanySettings',
                        Property: 'TaxMandatoryType',
                        FieldType: FieldType.DROPDOWN,
                        Label: 'Mva-pliktig',
                        Options: {
                            source: this.vatMandatoryOptions,
                            valueProperty: 'ID',
                            displayProperty: 'Name',
                            debounceTime: 200
                        }
                    },
                    {
                        EntityType: 'CompanySettings',
                        Property: 'VatReportFormID',
                        FieldType: FieldType.DROPDOWN,
                        Label: 'Mva skjema',
                        Options: {
                            source: this.vatReportForms,
                            valueProperty: 'ID',
                            debounceTime: 200,
                            template: vatReportForm => `${vatReportForm.Name} ${vatReportForm.Description}`
                        }
                    },
                    {
                        EntityType: 'CompanySettings',
                        Property: 'PeriodSeriesVatID',
                        FieldType: FieldType.DROPDOWN,
                        Label: 'Mva perioder',
                        Options: {
                            source: this.vatPeriods,
                            valueProperty: 'ID',
                            displayProperty: 'Name',
                            debounceTime: 200,
                            ReadOnly: true

                        }
                    },
                    {
                        EntityType: 'CompanySettings',
                        Property: 'VatLockedDate',
                        FieldType: FieldType.LOCAL_DATE_PICKER,
                        Label: 'MVA låst til',
                    },
                ];
                break;
            case 2:
                fields = [
                    {
                        EntityType: 'CompanySettings',
                        Property: 'BaseCurrencyCodeID',
                        FieldType: FieldType.DROPDOWN,
                        Label: 'Valuta',
                        Options: {
                            source: this.currencyCodes,
                            valueProperty: 'ID',
                            displayProperty: 'Code',
                            template: (obj: CurrencyCode) => obj ? `${obj.Code} - ${obj.Name}` : '',
                            debounceTime: 200
                        }
                    },
                    {
                        EntityType: 'CompanySettings',
                        Property: 'AgioGainAccountID',
                        FieldType: FieldType.UNI_SEARCH,
                        Label: 'Konto for valutagevinst',
                        Options: {
                            uniSearchConfig: this.uniSearchAccountConfig.generateOnlyMainAccountsConfig(),
                            valueProperty: 'ID'
                        }
                    },
                    {
                        EntityType: 'CompanySettings',
                        Property: 'AgioLossAccountID',
                        FieldType: FieldType.UNI_SEARCH,
                        Label: 'Konto for valutatap',
                        Options: {
                            uniSearchConfig: this.uniSearchAccountConfig.generateOnlyMainAccountsConfig(),
                            valueProperty: 'ID'
                        }
                    }
                ];
                break;
        }
        return fields;
    }
}
