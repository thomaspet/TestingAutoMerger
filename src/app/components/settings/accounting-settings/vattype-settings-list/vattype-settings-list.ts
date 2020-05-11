import {Component, ViewChild, OnInit} from '@angular/core';
import {HttpParams} from '@angular/common/http';
import {VatType} from '@uni-entities';
import {VatTypeService, ErrorService, FinancialYearService} from '@app/services/services';
import {UniTableColumn, UniTableColumnType, UniTableConfig} from '@uni-framework/ui/unitable';
import {AgGridWrapper} from '@uni-framework/ui/ag-grid/ag-grid-wrapper';
import {UniModalService, ConfirmActions} from '@uni-framework/uni-modal';
import {VatTypeSettingsDetails} from '../vattypedetails/vattype-settings-details';
import {ToastService, ToastType} from '@uni-framework/uniToast/toastService';
import * as moment from 'moment';
import { Observable } from 'rxjs';

@Component({
    selector: 'vattype-settings-list',
    templateUrl: './vattype-settings-list.html',
    styleUrls: ['./vattype-settings-list.sass']
})
export class VatTypeSettingsList implements OnInit {

	@ViewChild(AgGridWrapper, { static: true })
    private table: AgGridWrapper;

    @ViewChild(VatTypeSettingsDetails)
    private vattypeDetails: VatTypeSettingsDetails;

	vatTableConfig: UniTableConfig;
	lookupFunction: (urlParams: HttpParams) => any;

	private activeYear: number;

	vatType: VatType;
    hasChanges: boolean = false;
    activeTableIndex: number;

    constructor(
        private vatTypeService: VatTypeService,
        private errorService: ErrorService,
        private financialYearService: FinancialYearService,
        private modalService: UniModalService,
        private toast: ToastService
    ) { }

    ngOnInit() {
        this.activeYear = this.financialYearService.getActiveYear();
        this.setupTable();
    }

    vatTypeSaved() {
        this.table.refreshTableData();
        this.hasChanges = false;
    }

    focusClickedRow() {
        if (this.activeTableIndex) {
            this.table.focusRow(this.activeTableIndex);
        }
    }

    onChange() {
        this.hasChanges = true;
    }

    onRowSelected (event) {
        if (this.hasChanges) {

            const modalOptions = {
                header: 'Ulagrede endringer',
                message: 'Vil du lagre endringer før du bytter mva-gruppe? Ulagrede endringer blir fjernet',
                buttonLabels: {
                    accept: 'Lagre',
                    reject: 'Forkast',
                    cancel: 'Avbryt'
                }
            };
            this.modalService.confirm(modalOptions).onClose.subscribe((response: ConfirmActions) => {
                if (response === ConfirmActions.ACCEPT) {
                    this.vatType.VatReportReferences = null;
                    this.vatType.VatTypePercentages = null;
                    this.saveVatType().subscribe(() => {
                        this.toast.addToast('MVA-innstilling lagret', ToastType.good, 5);
                        this.hasChanges = false;
                        this.vatType = {...event};
                        this.activeTableIndex = event._originalIndex;
                        this.table.refreshTableData();
                    });
                } else if (response === ConfirmActions.REJECT) {
                    this.hasChanges = false;
                    this.vatType = {...event};
                    this.activeTableIndex = event._originalIndex;
                } else {
                    this.table.focusRow(this.activeTableIndex);
                }
            });

        } else {
            this.vatType =  {...event};
            this.activeTableIndex = event._originalIndex;
        }
    }

    saveVatType(): Observable<any> {
        if (!this.hasChanges) {
            return Observable.of(true);
        }

        return this.vatType.ID ? this.vatTypeService.Put(this.vatType.ID, this.vatType) : this.vatTypeService.Post(this.vatType);
    }

    private setupTable() {
        this.lookupFunction = (urlParams: HttpParams) => {
            let params = urlParams || new HttpParams();

            if (!params.get('orderby')) {
                params = params.set('orderby', 'VatCode');
            }

            params = params.set('expand',
                'VatCodeGroup,IncomingAccount,OutgoingAccount,VatReportReferences,'
				+ 'VatReportReferences.VatPost,VatReportReferences.Account,'
				+ 'VatTypePercentages' );

            return this.vatTypeService.GetAllByHttpParams(params)
                .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
        };

        const groupCol = new UniTableColumn('VatCodeGroup.Name', 'Gruppe', UniTableColumnType.Text).setWidth('35%');
        const codeCol = new UniTableColumn('VatCode', 'Kode', UniTableColumnType.Text).setWidth('5%');
        const nameCol = new UniTableColumn('Name', 'Navn', UniTableColumnType.Text).setWidth('30%');
        const incomingAccountCol = new UniTableColumn(
            'IncomingAccount.AccountNumber', 'Inng. konto', UniTableColumnType.Text
        ).setWidth('8%');
        const outgoingAccountCol = new UniTableColumn(
            'OutgoingAccount.AccountNumber', 'Utg. konto', UniTableColumnType.Text
        ).setWidth('8%');
        const percentCol = new UniTableColumn('VatTypePercentages.VatPercent', 'Prosent', UniTableColumnType.Number)
            .setWidth('10%')
            .setDisplayField('VatPercent')
            .setFilterable(false)
            .setTemplate((data) => {
               if (data.VatTypePercentages.length > 1) {
                   let returnString = '-';
                   data.VatTypePercentages.forEach(vatType => {
                       const validToYear = moment(vatType.ValidTo).year();
                       const validFromYear = moment(vatType.ValidFrom).year();
                       if (validFromYear && !!validToYear && validFromYear <= this.activeYear && validToYear >= this.activeYear) {
                           returnString = vatType.VatPercent + '%';
                       } else if (validFromYear && validFromYear <= this.activeYear) {
                           returnString = vatType.VatPercent + '%';
                       }
                   });
                   return returnString;
               } else {
                   return data.VatPercent + '%';
               }
            })
            .setFilterOperator('eq');

        // Setup table
        this.vatTableConfig = new UniTableConfig('accounting.vatsettings.vattypeList', false, false, 15)
            .setSearchable(true)
            .setColumns([groupCol, codeCol, nameCol, incomingAccountCol, outgoingAccountCol, percentCol])
            .setDataMapper((data: Array<VatType>) => {
                const dataWithPercentage = [];

                const today = moment(new Date());

                data.forEach((vatType) => {
                    const currentPercentage =
                        vatType.VatTypePercentages.find(y =>
                            (moment(y.ValidFrom) <= today && y.ValidTo && moment(y.ValidTo) >= today)
                            || (moment(y.ValidFrom) <= today && !y.ValidTo));

                    if (currentPercentage) {
                        vatType.VatPercent = currentPercentage.VatPercent;
                    }
                    dataWithPercentage.push(vatType);
                });

                return dataWithPercentage;
            });
    }
}
