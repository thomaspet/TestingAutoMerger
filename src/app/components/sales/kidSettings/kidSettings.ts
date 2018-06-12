import { Component, QueryList, ViewChild, } from '@angular/core';

import { TabService, UniModules, } from '../../layout/navbar/tabstrip/tabService';
import { UniHttp, } from '../../../../framework/core/http/http';
import { ConfirmActions, UniModalService, } from '../../../../framework/uni-modal';
import { Observable, } from 'rxjs/Observable';
import { ToastService, ToastType, ToastTime, } from '../../../../framework/uniToast/toastService';
import { IUniSaveAction, } from '../../../../framework/save/save';
import { UniTableColumn, UniTableColumnType, UniTableConfig, } from '../../../../framework/ui/unitable/index';
import { ErrorService, PaymentInfoTypeService, StatusService, } from '../../../services/services';
import { PaymentInfoType } from '../../../unientities';
import { IToolbarConfig, } from '@app/components/common/toolbar/toolbar';
import { AgGridWrapper, } from '@uni-framework/ui/ag-grid/ag-grid-wrapper';
import { BehaviorSubject, } from 'rxjs/BehaviorSubject';
import { FieldType, UniField, } from '@uni-framework/ui/uniform';

declare var _;

@Component({
    selector: 'kid-settings',
    templateUrl: './kidSettings.html'
})
export class KIDSettings {
    @ViewChild('listTable') private listTable: AgGridWrapper;
    @ViewChild('detailsTable') private detailsTable: AgGridWrapper;

    detailsTableConfig: UniTableConfig;
    formConfig$: BehaviorSubject<any> = new BehaviorSubject({});
    formFields$: BehaviorSubject<UniField[]> = new BehaviorSubject([]);
    formModel$: BehaviorSubject<PaymentInfoType> = new BehaviorSubject(null);
    hasUnsavedChanges: boolean = false;
    listTableConfig: UniTableConfig;
    saveactions: IUniSaveAction[];

    public sumDoesNotMatch: boolean = false;
    public currentPaymentInfoType: PaymentInfoType;
    private initialActive: boolean;
    public paymentInfoTypes: PaymentInfoType[];
    private paymentInfoTypePartsMacros: string[] = [];
    public toolbarconfig: IToolbarConfig = {
        title: 'KID-innstillinger',
        omitFinalCrumb: true
    };

    constructor(
        private errorService: ErrorService,
        private http: UniHttp,
        private modalService: UniModalService,
        private paymentInfoTypeService: PaymentInfoTypeService,
        private statusService: StatusService,
        private tabService: TabService,
        private toastService: ToastService,
    ) {
        this.tabService.addTab({name: 'KID-innstillinger', url: '/sales/kidsettings', moduleID: UniModules.KIDSettings, active: true});
        this.requestData();
    }

    canDeactivate() {
        return new Promise((resolve, reject) => {
            this.checkSave(true).then(ok => resolve(ok));
        });
    }

    onDataChange() {
        this.hasUnsavedChanges = true;
        this.updateSaveActions();
        this.checkLength();
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
        this.save().then(success => {
            done('Lagring fullført');
        })
        .catch(err => {
            done(err.message || err);
        });
    }

    updateSaveActions() {
        this.saveactions = [{
            label: 'Lagre innstillinger',
            action: (done) => this.onSaveClick(done),
            main: true,
            disabled: !this.hasUnsavedChanges
        }];
    }

    private checkLength() {
        let sum = 0;
        this.currentPaymentInfoType.PaymentInfoTypeParts.forEach((part) => {
            sum += !!part.Length ? part.Length : 0;
        });

        this.sumDoesNotMatch = sum !== this.currentPaymentInfoType['Length'];
    }

    private checkSave(confirmBeforeSave: boolean): Promise<boolean> {
        return new Promise((resolve, reject) => {
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

    private initFormConfig() {
        this.formConfig$.next({});
        this.formFields$.next([
            <any> {
                EntityType: 'PaymentInfoType',
                Property: 'Name',
                FieldType: FieldType.TEXT,
                Label: 'Navn',
                Section: 0,
                ReadOnly: this.currentPaymentInfoType.Locked,
            },
            <any> {
                EntityType: 'PaymentInfoType',
                Property: '_type',
                FieldType: FieldType.TEXT,
                Label: 'KID-type',
                Section: 0,
                ReadOnly: true,
            },
            <any> {
                EntityType: 'PaymentInfoType',
                Property: 'Length',
                FieldType: FieldType.NUMERIC,
                Label: 'KID-lengde',
                Section: 0,
                ReadOnly: this.currentPaymentInfoType.Locked,
            },
            <any> {
                EntityType: 'PaymentInfoType',
                Property: '_active',
                FieldType: FieldType.CHECKBOX,
                Label: 'Aktiv',
                Classes: ['toggle'],
                Section: 0,
                ReadOnly: this.currentPaymentInfoType.Locked,
            },
        ]);
    }

    private initTableConfigs() {
        this.listTableConfig = new UniTableConfig('sales.kidsettings', false, true, 15)
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

        this.detailsTableConfig = new UniTableConfig('sales.kidsettings.details', !this.currentPaymentInfoType.Locked, true, 15)
            .setSortable(false)
            .setRowDraggable(true)
            .setDeleteButton(true, !this.currentPaymentInfoType.Locked)
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
        ).subscribe(
            response => {
                this.paymentInfoTypes = response[0];
                this.paymentInfoTypes.forEach(paymentInfoType => {
                    paymentInfoType['_type'] = this.paymentInfoTypeService.kidTypes
                        .find(type => type.Type === paymentInfoType['Type']).Text;
                });
                this.setCurrent(this.paymentInfoTypes[0]);

                this.paymentInfoTypePartsMacros = response[1];

                this.initFormConfig();
                this.initTableConfigs();
                this.updateSaveActions();
            },
            error => this.errorService.handle(error)
        );
    }

    private save(): Promise<boolean>  {
        return new Promise((resolve, reject) => {
            let action: string;

            this.currentPaymentInfoType.PaymentInfoTypeParts =
                this.currentPaymentInfoType.PaymentInfoTypeParts.filter(row => !row['_isEmpty']);

            this.currentPaymentInfoType.PaymentInfoTypeParts.forEach((part, index) => {
                if (!part._createguid) {
                    part._createguid = this.paymentInfoTypeService.getNewGuid();
                }

                if (part.Part === '<modulus10>' && index < this.currentPaymentInfoType.PaymentInfoTypeParts.length - 1) {
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

                part.SortIndex = index;
            });

            // save PaymentInfoType.StatusCode if change
            if (this.currentPaymentInfoType['_active'] !== this.initialActive) {
                if (this.currentPaymentInfoType['_active']) {
                    action = 'activate-paymentinfotype';
                } else {
                    action = 'deactivate-paymentinfotype';
                }
                this.paymentInfoTypeService.PutAction(null, action, 'ID=' + this.currentPaymentInfoType.ID)
                    .subscribe(
                        response => {},
                        error => {
                            resolve(false);
                            this.errorService.handle(error);
                            return;
                        }
                    );
            }

            this.currentPaymentInfoType['type'] = undefined;
            this.currentPaymentInfoType['_active'] = undefined;

            // save PaymentInfoType
            this.paymentInfoTypeService.Put(this.currentPaymentInfoType.ID, this.currentPaymentInfoType)
                .subscribe(
                    response => {
                        resolve(true);
                        this.hasUnsavedChanges = false;
                        this.updateSaveActions();
                        this.requestData();
                    },
                    error => {
                        resolve(false);
                        this.errorService.handle(error);
                    }
                );
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
        this.hasUnsavedChanges = false;
        this.updateSaveActions();
    }

}
