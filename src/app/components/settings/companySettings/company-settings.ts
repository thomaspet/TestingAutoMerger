import {Component, SimpleChanges} from '@angular/core';
import {
    CompanySettingsService,
    CompanyTypeService,
    CompanyService,
    ErrorService
} from '@app/services/services';
import {AuthService} from '../../../authService';
import {FieldType, UniFieldLayout} from '@uni-framework/ui/uniform/index';
import {TabService, UniModules} from '@app/components/layout/navbar/tabstrip/tabService';
import {BusinessRelationService} from '@app/services/sales/businessRelationService';
import {CompanySettings, CompanyType} from '@app/unientities';
import { Observable, BehaviorSubject } from 'rxjs';
import {
    UniModalService,
    UniBrRegModal,
    ConfirmActions
} from '@uni-framework/uni-modal';

@Component({
    selector: 'company-settings',
    templateUrl: './company-settings.html'
})

export class UniCompanySettingsView {

    companySettings$ = new BehaviorSubject<CompanySettings>(null);
    electronicInvoiceFields$ = new BehaviorSubject<UniFieldLayout[]>([]);
    fields$ = new BehaviorSubject<any[]>([]);
    expands = ['DefaultPhone', 'DefaultEmail', 'DefaultAddress'];
    companyTypes = [];
    isDirty = false;

    saveActions: any[] = [
        {
            label: 'Lagre innstillinger',
            action: done => this.saveCompanySettings(done),
            main: true,
            disabled: false
        },
    ];

    constructor(
        private companySettingsService: CompanySettingsService,
        private companyTypeService: CompanyTypeService,
        private businessRelationService: BusinessRelationService,
        private companyService: CompanyService,
        private modalService: UniModalService,
        private tabService: TabService,
        private authService: AuthService,
        private errorService: ErrorService,
    ) { }

    ngOnInit() {
        this.tabService.addTab({
            name: 'Innstillinger - Firma',
            url: '/settings',
            moduleID: UniModules.Settings,
            active: true
       });
        this.reloadCompanySettingsData();
    }

    ngOnDestroy() {
        this.companySettings$.complete();
        this.fields$.complete();
        this.electronicInvoiceFields$.complete();
    }

    reloadCompanySettingsData() {
        Observable.forkJoin(
            this.companyTypeService.GetAll(null),
            this.companySettingsService.Get(1, this.expands),
            this.companyService.Get(this.authService.activeCompany.ID)
        ).subscribe((response) => {
            this.companyTypes = response[0];

            const data = response[1];
            const company = response[2];

            data['_FileFlowEmail'] = company['FileFlowEmail'];
            data['_FileFlowOrgnrEmail'] = company['FileFlowOrgnrEmail'];
            data['_FileFlowOrgnrEmailCheckbox'] = !!data['_FileFlowOrgnrEmail'];

            this.companySettings$.next(data);
            this.createFormFields();
            this.setUpElectronicInvoiceFormFields();
        });
    }

    createFormFields() {
        const fields = [
            {
                EntityType: 'CompanySettings',
                Property: 'CompanyName',
                FieldType: FieldType.TEXT,
                Label: 'Navn'
            },
            {
                EntityType: 'CompanySettings',
                Property: 'OrganizationNumber',
                FieldType: FieldType.TEXT,
                Label: 'Orgnr'
            },
            {
                EntityType: 'CompanySettings',
                Property: 'CompanyRegistered',
                FieldType: FieldType.CHECKBOX,
                Label: 'Foretaksregistrert',
            },
            {
                EntityType: 'CompanySettings',
                Property: 'DefaultPhone.Number',
                FieldType: FieldType.TEXT,
                Label: 'Telefon'
            },
            {
                EntityType: 'CompanySettings',
                Property: 'DefaultEmail.EmailAddress',
                FieldType: FieldType.EMAIL,
                Classes: 'bill-small-field',
                Label: 'E-post'
            },
            {
                EntityType: 'CompanySettings',
                Property: 'WebAddress',
                FieldType: FieldType.EMAIL,
                Classes: 'bill-small-field',
                Label: 'Web'
            },
            {
                EntityType: 'CompanySettings',
                Property: 'DefaultAddress.AddressLine1',
                FieldType: FieldType.TEXT,
                Label: 'Addresse'
            },
            {
                EntityType: 'CompanySettings',
                Property: 'DefaultAddress.PostalCode',
                FieldType: FieldType.TEXT,
                Classes: 'bill-small-field',
                Label: 'Postnummer'
            },
            {
                EntityType: 'CompanySettings',
                Property: 'DefaultAddress.City',
                FieldType: FieldType.TEXT,
                Classes: 'bill-small-field',
                Label: 'Sted'
            },
            {
                EntityType: 'CompanySettings',
                Property: 'CompanyTypeID',
                FieldType: FieldType.DROPDOWN,
                Label: 'Firmatype',
                Options: {
                    source: this.companyTypes,
                    valueProperty: 'ID',
                    displayProperty: 'FullName',
                    debounceTime: 200
                }
            },
        ];

        this.fields$.next(fields);
    }

    private updateInvoiceEmail() {
        const data = this.companySettings$.getValue();
        const customEmail = data['_FileFlowEmail'];
        this.companyService.Action(this.authService.activeCompany.ID, 'create-update-email', 'customEmail=' + customEmail)
        .subscribe(company => {
            data['_FileFlowEmail'] = company['FileFlowEmail'];
            this.companySettings$.next(data);
            this.setUpElectronicInvoiceFormFields();
        }, err => this.errorService.handle(err));
    }

    private activateEmail() {
        const data = this.companySettings$.getValue();
        if (!data['_FileFlowEmail']) {
            this.generateInvoiceEmail();
        } else {
            this.disableInvoiceEmail();
        }
    }

    private generateInvoiceEmail() {
        this.companyService.Action(this.authService.activeCompany.ID, 'create-update-email').subscribe(company => {
            const data = this.companySettings$.getValue();
            data['_FileFlowEmail'] = company['FileFlowEmail'];
            this.companySettings$.next(data);
            this.setUpElectronicInvoiceFormFields();
        }, err => this.errorService.handle(err));
    }

    private disableInvoiceEmail() {
        this.companyService.Action(this.authService.activeCompany.ID, 'disable-email').subscribe(company => {
            const data = this.companySettings$.getValue();
            data['_FileFlowEmail'] = '';
            data['_FileFlowOrgnrEmail'] = '';
            data['_FileFlowOrgnrEmailCheckbox'] = false;
            this.companySettings$.next(data);
            this.setUpElectronicInvoiceFormFields();
        }, err => this.errorService.handle(err));
    }

    eifChange(changes: SimpleChanges) {
        if (changes['_FileFlowOrgnrEmailCheckbox']) {
            const data = this.companySettings$.getValue();
            if (data['_FileFlowOrgnrEmailCheckbox']) {
                this.generateOrgnrInvoiceEmail(data);
            } else {
                this.disableOrgnrInvoiceEmail(data);
            }
        }
    }

    private generateOrgnrInvoiceEmail(data) {
        this.companyService.Action(this.authService.activeCompany.ID, 'create-orgnr-email').subscribe(company => {
            data['_FileFlowOrgnrEmail'] = company['FileFlowOrgnrEmail'];
            this.companySettings$.next(data);
        }, err => {
            data['_FileFlowOrgnrEmailCheckbox'] = false;
            this.companySettings$.next(data);
            this.errorService.handle(err);
        });
    }

    private disableOrgnrInvoiceEmail(data) {
        this.companyService.Action(this.authService.activeCompany.ID, 'disable-orgnr-email').subscribe(company => {
            data['_FileFlowOrgnrEmail'] = '';
            this.companySettings$.next(data);
        }, err => {
            data['_FileFlowOrgnrEmailCheckbox'] = true;
            this.companySettings$.next(data);
            this.errorService.handle(err);
        });
    }

    setUpElectronicInvoiceFormFields() {
        const companySettings = this.companySettings$.getValue();
        this.electronicInvoiceFields$.next([
            <any>{
                Property: '_FileFlowEmailActivated',
                FieldType: FieldType.BUTTON,
                Label: companySettings['_FileFlowEmail'] ? 'Deaktiver e-postmottak' : 'Aktiver e-postmottak',
                Options: {
                    click: () => this.activateEmail()
                 }
            },
            {
                FieldType: FieldType.TEXT,
                Label: 'Faktura e-post med firmanavn',
                Property: '_FileFlowEmail',
                Placeholder: 'E-post',
                ReadOnly: false,
                Hidden: !companySettings['_FileFlowEmail']
            },
            {
                FieldType: FieldType.BUTTON,
                Label: 'Endre e-postadresse',
                Property: '_UpdateEmail',
                Options: {
                    click: () => this.updateInvoiceEmail()
                },
                ReadOnly: companySettings['_FileFlowEmail'],
                Hidden: !companySettings['_FileFlowEmail']
            },
            {
                FieldType: FieldType.CHECKBOX,
                Label: 'Bruk orgnr for faktura e-post',
                Property: '_FileFlowOrgnrEmailCheckbox',
                Hidden: !companySettings['_FileFlowEmail']
            },
            {
                FieldType: FieldType.TEXT,
                Label: 'Faktura e-post med orgnr',
                Property: '_FileFlowOrgnrEmail',
                Placeholder: 'Ikke i bruk',
                ReadOnly: true,
                Hidden: !companySettings['_FileFlowEmail']
            }
        ]);
    }

    logoFileChanged(files: Array<any>) {
        const companySettings = this.companySettings$.getValue();
        if (!companySettings) {
            return;
        }

        if (files && files.length > 0 && companySettings.LogoFileID !== files[files.length - 1].ID) {
            // update logourl in company object
            companySettings.LogoFileID = files[files.length - 1].ID;

            // run request to save it without the user clicking save, because otherwise
            // the LogoFileID and FileEntityLinks will be left in an inconsistent state
            this.companySettingsService.PostAction(1, 'update-logo', `logoFileId=${companySettings.LogoFileID}`).subscribe(
                () => {},
                err => {
                    console.error('Klarte ikke laste opp')
                }
            );
        }
    }

    canDeactivate(): boolean | Observable<boolean> {
        if (!this.isDirty) {
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

    saveCompanySettings(done?) {
        return new Promise(res => {
            const company = this.companySettings$.getValue();

            if (company.DefaultAddress && company.DefaultAddress.ID === 0 && !company.DefaultAddress['_createguid']) {
                company.DefaultAddress['_createguid'] = this.companySettingsService.getNewGuid();
            }

            if (company.FactoringEmail && company.FactoringEmail.ID === 0 && !company.FactoringEmail['_createguid']) {
                company.FactoringEmail['_createguid'] = this.companySettingsService.getNewGuid();
            }

            if (company.DefaultPhone && !company.DefaultPhoneID) {
                company.DefaultPhone['_createguid'] = this.companySettingsService.getNewGuid();
            }

            if (company.DefaultEmail && !company.DefaultEmailID) {
                company.DefaultEmail['_createguid'] = this.companySettingsService.getNewGuid();
            }

            this.companySettingsService.Put(company.ID, company).subscribe((response) => {
                if (done) {
                    done('Firmainnstillinger lagret');
                }
                this.isDirty = false;
                res(true);
            }, err => {
                if (done) {
                    done('Lagring feilet. Sjekk at info stemmer, eller last inn siden på nytt og prøv igjen.');
                }
                res(false);
            });
        });
    }

    openBrRegModal() {
        this.modalService.open(UniBrRegModal).onClose.subscribe(brRegInfo => {
            if (brRegInfo) {
                this.businessRelationService.updateCompanySettingsWithBrreg(
                    this.companySettings$.getValue(), brRegInfo, this.companyTypes
                );
            }
        });
    }

}
