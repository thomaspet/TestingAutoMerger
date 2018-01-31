import {Component, ViewChild, Output, EventEmitter, ElementRef, OnInit, AfterViewInit} from '@angular/core';
import {URLSearchParams} from '@angular/http';
import {VatType, LocalDate, VatTypePercentage} from '../../../../unientities';
import {VatTypeService, ErrorService, YearService} from '../../../../services/services';
import {
    UniTable, UniTableColumn, UniTableColumnType, UniTableConfig
} from '../../../../../framework/ui/unitable/index';
import * as moment from 'moment';

@Component({
    selector: 'vattype-list',
    templateUrl: './vatTypeList.html'
})
export class VatTypeList implements OnInit, AfterViewInit {
    @Output() public uniVatTypeChange: EventEmitter<VatType> = new EventEmitter<VatType>();
    @ViewChild(UniTable) private table: UniTable;
    private vatTableConfig: UniTableConfig;
    private lookupFunction: (urlParams: URLSearchParams) => any;
    private vatPercent: number;
    private activeYear: number;

    constructor(
        private vatTypeService: VatTypeService,
        private errorService: ErrorService,
        private elementRef: ElementRef,
        private yearService: YearService
    ) {
    }

    public ngOnInit() {
        this.yearService.getActiveYear().subscribe(activeYear => {
            this.activeYear = activeYear;
            this.setupTable();
        });
    }

    public ngAfterViewInit() {
        const input = this.elementRef.nativeElement.querySelector('input');
        input.focus();
    }

    public onRowSelected (event) {
        this.uniVatTypeChange.emit(event.rowModel);
    }

    public refresh() {
        this.table.refreshTableData();
    }

    private setupTable() {

        this.lookupFunction = (urlParams: URLSearchParams) => {
            let params = urlParams;

            if (params === null) {
                params = new URLSearchParams();
            }

            if (!params.get('orderby')) {
                params.set('orderby', 'VatCode');
            }

            params.set(
                'expand',
                'VatCodeGroup,IncomingAccount,OutgoingAccount,VatReportReferences,'
                    + 'VatReportReferences.VatPost,VatReportReferences.Account,'
                    + 'VatTypePercentages'
            );

            return this.vatTypeService.GetAllByUrlSearchParams(params)
                .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
        };

        const groupCol = new UniTableColumn('VatCodeGroup.Name', 'Gruppe', UniTableColumnType.Text).setWidth('20%');
        const codeCol = new UniTableColumn('VatCode', 'Kode', UniTableColumnType.Text).setWidth('10%');
        const aliasCol = new UniTableColumn('Alias', 'Alias', UniTableColumnType.Text).setWidth('10%');
        const nameCol = new UniTableColumn('Name', 'Navn', UniTableColumnType.Text).setWidth('30%');
        const incomingAccountCol = new UniTableColumn(
            'IncomingAccount.AccountNumber', 'Inng. konto', UniTableColumnType.Text
        ).setWidth('10%');
        const outgoingAccountCol = new UniTableColumn(
            'OutgoingAccount.AccountNumber', 'Utg. konto', UniTableColumnType.Text
        ).setWidth('10%');
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
        this.vatTableConfig = new UniTableConfig('accounting.vatsettings.vattypeList', false, false)
            .setSearchable(true)
            .setColumns([groupCol, codeCol, aliasCol, nameCol, incomingAccountCol, outgoingAccountCol, percentCol])
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
