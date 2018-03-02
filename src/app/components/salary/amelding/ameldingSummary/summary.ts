import {Component, Input, OnChanges} from '@angular/core';
import {UniTableConfig, UniTableColumnType, UniTableColumn} from '../../../../../framework/ui/unitable/index';
import * as moment from 'moment';

@Component({
    selector: 'amelding-summary-view',
    templateUrl: './summary.html'
})

export class AmeldingSummaryView implements OnChanges {
    @Input() public currentSumUp: any;
    @Input() public currentAMelding: any;
    private employeeTableConfig: UniTableConfig;
    private leaveTableConfig: UniTableConfig;
    private transactionTableConfig: UniTableConfig;
    private employeeAndEmployments: any[] = [];
    private employeeleaves: any[] = [];
    private sumPerDescription: any[] = [];
    private entitiesWithData: any[] = [];
    private createdDate: string = '';
    private sentDate: string = '';
    private statusText: string;
    private statuses: any[] = ['Generert', 'Generert', 'Innsendt', 'Status mottatt fra altinn'];

    constructor() {
        this.setupEmployees();
        this.setupLeaves();
        this.setupTransactions();
    }

    public ngOnChanges() {
        if (this.currentSumUp) {
            if (this.currentSumUp.status === null) {
                this.currentSumUp.status = 0;
            }
            if (this.currentSumUp.status === 3) {
                this.statusText = this.currentSumUp._sumupStatusText;
            } else {
                this.statusText = this.statuses[this.currentSumUp.status];
            }
        }
        if (this.currentAMelding) {
            this.createdDate = moment(this.currentAMelding.created)
                .format('DD.MM.YYYY HH:mm');
            if (this.currentAMelding.sent) {
                this.sentDate = moment(this.currentAMelding.sent)
                    .format('DD.MM.YYYY HH:mm');
            }
        }

        if (this.currentSumUp && this.currentAMelding) {
            this.mapData();
        } else {
            this.entitiesWithData = [];
        }

    }

    private mapData() {
        this.entitiesWithData = [];
        const period = this.currentAMelding.period;

        if (this.currentSumUp.entities) {
            this.currentSumUp.entities.forEach(entity => {
                const entityName: string = entity.name;
                const entityOrgNumber: string = entity.orgNumber;
                const entityExpanded: boolean = entity.expanded;
                const entitySums: Object = entity.sums;

                if (entity.employees) {
                    this.employeeAndEmployments = [];
                    this.employeeleaves = [];
                    entity.employees.forEach(employee => {
                        const employeeName = employee.name;
                        const employeeNumber = employee.employeeNumber;

                        if (employee.arbeidsforhold) {
                            employee.arbeidsforhold.forEach(arbeidsforhold => {
                                this.employeeAndEmployments.push({
                                    employeeNumber: employeeNumber,
                                    name: employeeName,
                                    arbeidsforholdId: arbeidsforhold.arbeidsforholdId,
                                    startDate: arbeidsforhold.startDate,
                                    endDate: arbeidsforhold.endDate
                                });

                                if (arbeidsforhold.permisjon) {
                                    arbeidsforhold.permisjon.forEach(permisjon => {
                                        this.employeeleaves.push({
                                            permisjonsId: permisjon.permisjonsId,
                                            employeenumber: employeeNumber,
                                            employeename: employeeName,
                                            startdato: permisjon.startdato,
                                            sluttdato: permisjon.sluttdato,
                                            permisjonsprosent: permisjon.permisjonsprosent,
                                            beskrivelse: permisjon.beskrivelse
                                        });
                                    });
                                }
                            });
                        }
                    });
                }
                this.sumPerDescription = [];
                if (entity.transactionTypes) {
                    entity.transactionTypes.forEach(transaction => {
                        this.sumPerDescription.push(transaction);
                    });
                }

                this.entitiesWithData.push({
                    name: entityName,
                    orgNumber: entityOrgNumber,
                    expanded: entityExpanded,
                    employees: this.employeeAndEmployments,
                    leaves: this.employeeleaves,
                    transactions: this.sumPerDescription,
                    sums: entitySums
                });
            });
        }
    }

    private setupEmployees() {
        const empNoCol = new UniTableColumn('employeeNumber', 'Nr', UniTableColumnType.Number)
            .setWidth('4rem');
        const nameCol = new UniTableColumn('name', 'Navn', UniTableColumnType.Text);
        const emplmntCol = new UniTableColumn('arbeidsforholdId', 'ID arbeidsforhold', UniTableColumnType.Number)
            .setWidth('10rem');
        const startCol = new UniTableColumn('startDate', 'Startdato', UniTableColumnType.LocalDate)
            .setWidth('8rem');
        const endCol = new UniTableColumn('endDate', 'Sluttdato', UniTableColumnType.LocalDate)
            .setWidth('8rem');

        this.employeeTableConfig = new UniTableConfig('salary.amelding.summary.employees', false, true, 30)
        .setColumns([empNoCol, nameCol, emplmntCol, startCol, endCol]);
    }

    private setupLeaves() {
        const idCol = new UniTableColumn('permisjonsId', 'Id', UniTableColumnType.Number)
            .setWidth('4rem');
        const numberCol = new UniTableColumn('employeenumber', 'Nr', UniTableColumnType.Number)
            .setWidth('4rem');
        const nameCol = new UniTableColumn('employeename', 'Ansattnavn', UniTableColumnType.Text);
        const startCol = new UniTableColumn('startdato', 'Startdato', UniTableColumnType.LocalDate)
            .setWidth('8rem');
        const endCol = new UniTableColumn('sluttdato', 'Sluttdato', UniTableColumnType.LocalDate)
            .setWidth('8rem');
        const pcntCol = new UniTableColumn('permisjonsprosent', 'Prosent', UniTableColumnType.Percent)
            .setWidth('5rem');
        const descCol = new UniTableColumn('beskrivelse', 'Beskrivelse', UniTableColumnType.Text);

        this.leaveTableConfig = new UniTableConfig('salary.amelding.summary.leaves', false, true, 30)
            .setColumns([idCol, numberCol, nameCol, startCol, endCol, pcntCol, descCol]);
    }

    private setupTransactions() {
        const typeCol = new UniTableColumn('incomeType', 'Type', UniTableColumnType.Text);
        const benefitCol = new UniTableColumn('benefit', 'Fordel', UniTableColumnType.Text);
        const descrCol = new UniTableColumn('description', 'Beskrivelse', UniTableColumnType.Text);
        const taxCol = new UniTableColumn('Base_EmploymentTax', 'Trekk', UniTableColumnType.Text)
            .setWidth('4rem')
            .setTemplate((rowModel) => {
                if (rowModel.Base_EmploymentTax) {
                    return 'Ja';
                } else {
                    return 'Nei';
                }
            });
        const agaCol = new UniTableColumn('tax', 'Aga', UniTableColumnType.Text)
            .setWidth('4rem')
            .setTemplate((rowModel) => {
                if (rowModel.tax) {
                    return 'Ja';
                } else {
                    return 'Nei';
                }
            });
        const amountCol = new UniTableColumn('amount', 'Beløp', UniTableColumnType.Money)
            .setWidth('6rem')
            .setCls('column-align-right');

        this.transactionTableConfig = new UniTableConfig('salary.amelding.summary.transactions', false, true, 30)
            .setColumns([typeCol, benefitCol, descrCol, taxCol, agaCol, amountCol]);
    }
}
