import {Component, ViewChild, Output, EventEmitter, ElementRef, OnInit, AfterViewInit} from '@angular/core';
import {HttpParams} from '@angular/common/http';
import {VatType} from '@uni-entities';
import {VatTypeService, ErrorService, FinancialYearService} from '@app/services/services';
import {UniTableColumn, UniTableColumnType, UniTableConfig} from '@uni-framework/ui/unitable';
import {AgGridWrapper} from '@uni-framework/ui/ag-grid/ag-grid-wrapper';
import * as moment from 'moment';

@Component({
    selector: 'vattype-list',
    templateUrl: './vatTypeList.html'
})
export class VatTypeList implements OnInit, AfterViewInit {
    @Output() public uniVatTypeChange: EventEmitter<VatType> = new EventEmitter<VatType>();
    @ViewChild(AgGridWrapper, { static: true }) private table: AgGridWrapper;

    public vatTableConfig: UniTableConfig;
    public lookupFunction: (urlParams: HttpParams) => any;
    private activeYear: number;

    constructor(
        private vatTypeService: VatTypeService,
        private errorService: ErrorService,
        private elementRef: ElementRef,
        private financialYearService: FinancialYearService
    ) {
    }

    public ngOnInit() {
        this.activeYear = this.financialYearService.getActiveYear();
        this.setupTable();
    }

    public ngAfterViewInit() {
        const input = this.elementRef.nativeElement.querySelector('input');
        if (input) {
            input.focus();
        }
    }

    public onRowSelected (event) {
        this.uniVatTypeChange.emit(event);
    }

    public refresh() {
        if (this.table) {
            this.table.refreshTableData();
        }
    }

    private setupTable() {

        this.lookupFunction = (urlParams: HttpParams) => {
            let params = urlParams;

            if (params === null) {
                params = new HttpParams();
            }

            if (!params.get('orderby')) {
                params = params.set('orderby', 'VatCode');
            }

            params = params.set(
                'expand',
                'VatCodeGroup,IncomingAccount,OutgoingAccount,VatReportReferences,'
                    + 'VatReportReferences.VatPost,VatReportReferences.Account,'
                    + 'VatTypePercentages'
            );

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
