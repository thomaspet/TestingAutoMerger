import { Component, ViewChild, SimpleChanges, } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import { BehaviorSubject, } from 'rxjs';
import { Observable, } from 'rxjs';
import { IToolbarConfig, } from '@app/components/common/toolbar/toolbar';
import { TabService, UniModules, } from '@app/components/layout/navbar/tabstrip/tabService';
import { ErrorService, PaymentInfoTypeService, CompanySettingsService, PageStateService} from '@app/services/services';
import { IUniSaveAction, } from '@uni-framework/save/save';
import { AgGridWrapper, } from '@uni-framework/ui/ag-grid/ag-grid-wrapper';
import { FieldType, UniField, UniFieldLayout, UniFormError, UniForm, } from '@uni-framework/ui/uniform';
import { UniTableColumn, UniTableColumnType, UniTableConfig, } from '@uni-framework/ui/unitable/index';
import { ToastService, ToastType, ToastTime, } from '@uni-framework/uniToast/toastService';
import { ConfirmActions, UniModalService, } from '@uni-framework/uni-modal';
import { PaymentInfoType, StatusCodePaymentInfoType, CompanySettings } from '@uni-entities';

declare var _;

@Component({
    selector: 'kid-settings',
    templateUrl: './kidSettings.html'
})
export class KIDSettings {
    @ViewChild('listTable', { static: true }) private detailsTable: AgGridWrapper;
    @ViewChild(UniForm, { static: true }) private form: UniForm;

    currentPaymentInfoType: PaymentInfoType;
    currentID: number;
    detailsTableConfig: UniTableConfig;
    formConfig$: BehaviorSubject<any> = new BehaviorSubject({});
    formFields$: BehaviorSubject<UniField[]> = new BehaviorSubject([]);
    formModel$: BehaviorSubject<PaymentInfoType> = new BehaviorSubject(null);
    isKidLengthOK: boolean = true;
    listTableConfig: UniTableConfig;
    saveactions: IUniSaveAction[];
    paymentInfoTypes: PaymentInfoType[];
    showInactiveInList: boolean = false;
    toggleBtnLabel: string = 'Vis inaktive';
    toolbarconfig: IToolbarConfig = {
        title: 'KID-innstillinger'
    };

    private companySettings: CompanySettings;
    private hasUnsavedChanges: boolean = false;
    private initialPaymentInfoTypeList: PaymentInfoType[];
    private initialActive: boolean;
    private paymentInfoTypePartsMacros: string[] = [];

    constructor(
        private companySettingsService: CompanySettingsService,
        private errorService: ErrorService,
        private modalService: UniModalService,
        private paymentInfoTypeService: PaymentInfoTypeService,
        private tabService: TabService,
        private toastService: ToastService,
        private route: ActivatedRoute,
        private pageStateService: PageStateService
    ) {
        this.route.queryParams.subscribe((params) => {
            this.currentID = +params['id'];
            this.showInactiveInList = params['showInactiveInList'] === 'true';
            this.initTableConfigs();
            this.requestData();
            this.addTab();
        });
    }

    addTab() {
        this.pageStateService.setPageState('id', this.currentID + '');
        this.pageStateService.setPageState('showInactiveInList', this.showInactiveInList + '');

        this.tabService.addTab({
            name: 'KID-innstillinger',
            url: this.pageStateService.getUrl(),
            moduleID: UniModules.KIDSettings,
            active: true
        });
    }

    checkInactive() {
        if (this.showInactiveInList) {
            this.paymentInfoTypes = this.initialPaymentInfoTypeList;
        } else {
            this.paymentInfoTypes = this.paymentInfoTypes.filter(
                paymentInfoType => paymentInfoType.StatusCode === StatusCodePaymentInfoType.Active
            );
        }

        if (this.paymentInfoTypes.length) {
            // Check to see if previously selected KID is still in grid
            const index = this.paymentInfoTypes.findIndex(paymentInfoType => paymentInfoType.ID === this.currentID);
            if (index !== -1) {
                setTimeout(() => {
                    this.detailsTable.focusRow(index);
                });
            } else {
                this.setCurrent(this.paymentInfoTypes[0]);
                setTimeout(() => {
                    this.detailsTable.focusRow(0);
                });
            }
            this.addTab();
        }
    }

    onDataChange(formChanges?: SimpleChanges) {
        this.hasUnsavedChanges = true;
        if (formChanges) {
            const paymentInfoType = this.formModel$.getValue();
            if (formChanges['_active']) {
                paymentInfoType.StatusCode = formChanges['_active'].currentValue
                    ? StatusCodePaymentInfoType.Active
                    : StatusCodePaymentInfoType.Disabled;
            }
            this.form.validateForm();
            this.currentPaymentInfoType = paymentInfoType;
            this.formModel$.next(paymentInfoType);
        }
        this.checkLengths();
        this.updateSaveActions();
    }

    onKidSelect(event) {
        if (!event) { return; }

        this.checkSave(true).then(success => {
            if (success) {
                this.setCurrent(event);
                this.initFormConfig();
                this.detailsTableConfig.setEditable(!this.currentPaymentInfoType.Locked);
            }
        });
    }

    onSaveClick(done) {
        this.save().then(() => {
            done('Lagring fullført');
        })
        .catch(err => {
            done(err.message || err);
        });
    }

    private checkLengths() {
        this.currentPaymentInfoType.PaymentInfoTypeParts.forEach((part, index) => {
            if (part.Part === '<modulus10>') {
                this.currentPaymentInfoType.PaymentInfoTypeParts[index].Length = 1;
            }
        });
        this.currentPaymentInfoType = _.cloneDeep(this.currentPaymentInfoType);

        let sum = 0;
        this.currentPaymentInfoType.PaymentInfoTypeParts
            .filter(part => !part.Deleted)
            .forEach(part => sum += part.Length || 0);
        this.isKidLengthOK = (sum === this.currentPaymentInfoType.Length);
    }

    private checkPaymentInfoTypeParts() {
        const currentPaymentInfoTypeParts = this.currentPaymentInfoType.PaymentInfoTypeParts.filter(row => !row.Deleted);

        if (!currentPaymentInfoTypeParts.find(part => part.Part === '<modulus10>')) {
            this.toastService.addToast(
                'Feil ved lagring', ToastType.bad, ToastTime.long, 'Kontrollsiffer må være siste element i listen'
            );
            throw new Error('Kontrollsiffer må være siste element i listen');
        }

        currentPaymentInfoTypeParts.forEach((part, index) => {
            if (!part._createguid) {
                part._createguid = this.paymentInfoTypeService.getNewGuid();
            }

            if (part.Part === '<modulus10>' && index < currentPaymentInfoTypeParts.length - 1) {
                    this.toastService.addToast(
                        'Feil ved lagring', ToastType.bad, ToastTime.long, 'Kontrollsiffer må være siste element i listen'
                    );
                    throw new Error('Kontrollsiffer må være siste element i listen');
            }

            if (this.paymentInfoTypeService.macros.find(macro => macro.Macro === part.Part) === undefined) {
                if (/\D/.test(part.Part)) {
                    this.toastService.addToast(
                        'Feil ved lagring',
                        ToastType.bad,
                        ToastTime.long,
                        'Kun siffer er tillatt på egendefinert element'
                    );
                    throw new Error('Kun siffer er tillatt på egendefinerte element');
                }
                if (part.Part.length !== part.Length) {
                    this.toastService.addToast(
                        'Feil ved lagring',
                        ToastType.bad,
                        ToastTime.long,
                        'Antall siffer, ' + part.Length + ', stemmer ikke overens med elementet ' + part.Part
                    );
                    throw new Error('Antall siffer, ' + part.Length + ', stemmer ikke overens med elementet ' + part.Part);
                }
            }
        });
    }

    private checkSave(confirmBeforeSave: boolean): Promise<boolean> {
        return new Promise(resolve => {
            if (!this.hasUnsavedChanges) {
                resolve(true);
                return;
            }

            if (confirmBeforeSave) {
                this.modalService.confirm({
                    header: 'Lagre endringer?',
                    message: 'Ønsker du å lagre endringene før vi fortsetter?',
                    buttonLabels: {
                        accept: 'Lagre',
                        reject: 'Forkast',
                        cancel: 'Avbryt'
                    },
                    activateClickOutside: false
                }).onClose.subscribe(response => {
                    switch (response) {
                        case ConfirmActions.ACCEPT:
                            this.save().then(success => {
                                resolve(success);
                                })
                                .catch(err => this.toastService.addToast('Feil ved lagring', ToastType.bad, ToastTime.long, err.message));
                            break;
                        case ConfirmActions.REJECT:
                            resolve(true);
                            break;
                        default:
                            resolve(false);
                            break;
                    }
                });

            } else {
                this.save()
                    .then(x => resolve(x))
                    .catch(err => this.errorService.handle(err));
            }
        });
    }

    private checkShowKIDSettingInCompanySettings() {
        return this.companySettings.ShowKIDOnCustomerInvoice
            && !this.paymentInfoTypes.some(paymentInfoType => paymentInfoType.StatusCode === StatusCodePaymentInfoType.Active);
    }

    private initFormConfig() {
        this.formConfig$.next({});
        this.formFields$.next([
            <any> {
                EntityType: 'PaymentInfoType',
                Property: 'Name',
                FieldType: FieldType.TEXT,
                Label: 'Navn',
                Section: 0,
                ReadOnly: this.currentPaymentInfoType ? this.currentPaymentInfoType.Locked : true,
            },
            <any> {
                EntityType: 'PaymentInfoType',
                Property: '_type',
                FieldType: FieldType.STATIC_TEXT,
                Label: 'KID-type',
                Section: 0,
            },
            <any> {
                EntityType: 'PaymentInfoType',
                Property: 'Length',
                FieldType: FieldType.NUMERIC,
                Label: 'KID-lengde',
                Validations: [this.validateKidLength],
                Section: 0,
                ReadOnly: this.currentPaymentInfoType ? this.currentPaymentInfoType.Locked : true,
            },
            <any> {
                EntityType: 'PaymentInfoType',
                Property: '_active',
                FieldType: FieldType.CHECKBOX,
                Label: 'Aktiv',
                Classes: ['toggle'],
                Section: 0,
                ReadOnly: this.currentPaymentInfoType ? this.currentPaymentInfoType.Locked : true,
            },
        ]);
    }

    private initTableConfigs() {
        this.listTableConfig = new UniTableConfig('sales.kidsettings', false, true, 15)
            .setColumnMenuVisible(false)
            .setSortable(false)
            .setColumns([
                new UniTableColumn('ID', 'ID', UniTableColumnType.Text)
                    .setWidth(20),
                new UniTableColumn('Name', 'Navn', UniTableColumnType.Text),
                new UniTableColumn('Type', 'KID-type', UniTableColumnType.Text)
                    .setWidth(40)
                    .setTemplate(item => this.paymentInfoTypeService.kidTypes.find(type => type.Type === item.Type).Text),
                new UniTableColumn('Length', 'KID-lengde', UniTableColumnType.Number)
                    .setWidth(40),
                new UniTableColumn('StatusCode', 'Aktiv', UniTableColumnType.Text)
                    .setWidth(40)
                    .setTemplate((item) => {
                        return this.paymentInfoTypeService.statusTypes
                            .find(statusType => statusType.Code === item.StatusCode).Text;
                    }),
            ]);

        this.detailsTableConfig = new UniTableConfig(
            'sales.kidsettings.details', this.currentPaymentInfoType ? !this.currentPaymentInfoType.Locked : false, true, 15)
            .setColumnMenuVisible(false)
            .setSortable(false)
            .setRowDraggable(true)
            .setDeleteButton(true, true)
            .setColumns([
                new UniTableColumn('Part', 'Element', UniTableColumnType.Typeahead)
                    .setTemplate(item => {
                        const match = this.paymentInfoTypeService.macros.find(macro => macro.Macro === item.Part);
                        return match ? match.Text : item.Part;
                    })
                    .setOptions({
                        lookupFunction: searchValue => {
                            return Observable.of(this.paymentInfoTypePartsMacros.filter(x => x.indexOf(searchValue) === 0));
                        },
                        itemTemplate: item => {
                            return this.paymentInfoTypeService.macros.find(macro => macro.Macro === item).Text;
                        },
                        itemValue: item => {
                            return item;
                        }
                    }),
                new UniTableColumn('Length', 'Antall siffer', UniTableColumnType.Number)
                    .setWidth(40),
        ]);
    }

    private requestData() {
        Observable.forkJoin(
            this.paymentInfoTypeService.GetAll(null),
            this.paymentInfoTypeService.GetAction(null, 'get-paymentinfotype-parts-macros'),
            this.companySettingsService.getCompanySettings(),
        ).subscribe(
            response => {
                this.initialPaymentInfoTypeList = response[0];
                this.paymentInfoTypes = response[0];
                this.paymentInfoTypes.forEach(paymentInfoType => {
                    paymentInfoType['_type'] = this.paymentInfoTypeService.kidTypes
                        .find(type => type.Type === paymentInfoType['Type']).Text;
                });

                if (!this.showInactiveInList) {
                    this.paymentInfoTypes = this.paymentInfoTypes.filter(
                        paymentInfoType => paymentInfoType.StatusCode === StatusCodePaymentInfoType.Active
                    );
                }

                const index = this.paymentInfoTypes.findIndex(paymentInfoType => paymentInfoType.ID === this.currentID);

                if (index !== -1) {
                    this.setCurrent(this.paymentInfoTypes[index]);
                    setTimeout(() => {
                        this.detailsTable.focusRow(index);
                    });
                } else if (this.paymentInfoTypes.find(paymentInfoType => paymentInfoType.StatusCode === StatusCodePaymentInfoType.Active)) {
                    this.setCurrent(this.paymentInfoTypes[0]);
                    setTimeout(() => {
                        this.detailsTable.focusRow(0);
                    });
                }

                this.paymentInfoTypePartsMacros = response[1];
                this.companySettings = response[2];

                this.initFormConfig();
                this.updateSaveActions();
            },
            error => this.errorService.handle(error)
        );
    }

    private save(): Promise<boolean>  {
        return new Promise((resolve, reject) => {
            let action: string;
            const requests: Observable<any>[] = [];

            this.currentPaymentInfoType.PaymentInfoTypeParts = this.currentPaymentInfoType.PaymentInfoTypeParts
                .filter(row => !row['_isEmpty']);
            this.currentPaymentInfoType.PaymentInfoTypeParts.forEach((part, index) => part.SortIndex = index);
            const currentIdx = this.paymentInfoTypes.findIndex(paymentInfoType => paymentInfoType.ID === this.currentPaymentInfoType.ID);
            this.paymentInfoTypes[currentIdx] = this.currentPaymentInfoType;
            this.checkPaymentInfoTypeParts();

            if (this.checkShowKIDSettingInCompanySettings()) {
                this.toastService.addToast('Kunne ikke lagre', ToastType.warn, ToastTime.long,
                    `"Vis KID i fakturablankett" er aktivert under Innstillinger - Salg - Blankettoppsett. Minst én KID-type må da være aktiv. <a href="/#/settings/sales?index=2">Gå til innstillinger</a>`
                );
                reject(false);
                return;
            }

            // save PaymentInfoType.StatusCode if change
            if (this.currentPaymentInfoType['_active'] !== this.initialActive) {
                if (this.currentPaymentInfoType['_active']) {
                    action = 'activate-paymentinfotype';
                } else {
                    action = 'deactivate-paymentinfotype';
                }
                requests.push(this.paymentInfoTypeService.PutAction(null, action, 'ID=' + this.currentPaymentInfoType.ID));
            }

            this.currentPaymentInfoType['type'] = undefined;
            this.currentPaymentInfoType['_active'] = undefined;

            // save PaymentInfoType
            requests.push(this.paymentInfoTypeService.Put(this.currentPaymentInfoType.ID, this.currentPaymentInfoType));

            Observable.forkJoin(...requests).subscribe(() => {
                resolve(true);
                this.hasUnsavedChanges = false;
                this.updateSaveActions();
                this.requestData();
            },
            error => {
                reject(error);
                this.errorService.handle(error);
            });
        });
    }

    private setCurrent(currentPaymentInfoType: PaymentInfoType) {
        if (this.detailsTable) {
            this.detailsTable.finishEdit();
        }

        currentPaymentInfoType['_active'] = (currentPaymentInfoType.StatusCode === 42400);
        this.initialActive = currentPaymentInfoType['_active'];
        this.currentPaymentInfoType = currentPaymentInfoType;
        this.formModel$.next(this.currentPaymentInfoType);
        this.currentID = this.currentPaymentInfoType.ID;
        this.hasUnsavedChanges = false;
        this.updateSaveActions();
        this.addTab();
    }

    private updateSaveActions() {
        this.saveactions = [{
            label: 'Lagre innstillinger',
            action: (done) => this.onSaveClick(done),
            main: true,
            disabled: !this.isKidLengthOK || !this.hasUnsavedChanges
        }];
    }

    private validateKidLength(value: number, field: UniFieldLayout): UniFormError | null {
        if (value && value > 25) {
            return {
                value: value,
                errorMessage: 'Maks KID-lengde er 25.',
                field: field,
                isWarning: true
            };
        }
        return null;
    }

}
