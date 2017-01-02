import {Component, Input} from '@angular/core';
import {UniTableConfig, UniTableColumnType, UniTableColumn} from 'unitable-ng2/main';

declare var moment;

@Component({
    selector: 'amelding-summary-view',
    templateUrl: 'app/components/salary/amelding/ameldingSummary/summary.html'
})

export class AmeldingSummaryView {
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
            this.createdDate = moment(this.currentAMelding.created).format('DD.MM.YYYY HH:mm');
            if (this.currentAMelding.sent) {
                this.sentDate = moment(this.currentAMelding.sent).format('DD.MM.YYYY HH:mm');
            }
        }

        if (this.currentSumUp && this.currentAMelding) {
            this.mapData();
        }
    }

    private mapData() {
        this.entitiesWithData = [];
        let period = this.currentAMelding.period;

        if (this.currentSumUp.entities) {
            this.currentSumUp.entities.forEach(entity => {
                let entityName: string = entity.name;
                let entityOrgNumber: string = entity.orgNumber;
                let entityExpanded: boolean = entity.expanded;
                let entitySums: Object = entity.sums;

                if (entity.employees) {
                    this.employeeAndEmployments = [];
                    this.employeeleaves = [];
                    entity.employees.forEach(employee => {
                        let employeeName = employee.name;
                        let employeeNumber = employee.employeeNumber;

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
                                        let startdatePeriod = parseInt(permisjon.startdato.split('-', 2)[1]);
                                        let enddatePeriod = parseInt(permisjon.sluttdato.split('-', 2)[1]);
                                        if (startdatePeriod === period || enddatePeriod === period) {
                                            this.employeeleaves.push({
                                                permisjonsId: permisjon.permisjonsId,
                                                employeenumber: employeeNumber,
                                                employeename: employeeName,
                                                startdato: permisjon.startdato,
                                                sluttdato: permisjon.sluttdato,
                                                permisjonsprosent: permisjon.permisjonsprosent,
                                                beskrivelse: permisjon.beskrivelse
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
                
                if (entity.transactionTypes) {
                    this.sumPerDescription = [];
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
        let empNoCol = new UniTableColumn('employeeNumber', 'Nr', UniTableColumnType.Number).setWidth('4rem');
        let nameCol = new UniTableColumn('name', 'Navn', UniTableColumnType.Text);
        let emplmntCol = new UniTableColumn('arbeidsforholdId', 'ID arbeidsforhold', UniTableColumnType.Number).setWidth('10rem');
        let startCol = new UniTableColumn('startDate', 'Startdato', UniTableColumnType.LocalDate).setWidth('8rem');
        let endCol = new UniTableColumn('endDate', 'Sluttdato', UniTableColumnType.LocalDate).setWidth('8rem');

        this.employeeTableConfig = new UniTableConfig(false, true, 30)
        .setColumns([empNoCol, nameCol, emplmntCol, startCol, endCol]);
    }

    private setupLeaves() {
        let idCol = new UniTableColumn('permisjonsId', 'Id', UniTableColumnType.Number).setWidth('4rem');
        let numberCol = new UniTableColumn('employeenumber', 'Nr', UniTableColumnType.Number).setWidth('4rem');
        let nameCol = new UniTableColumn('employeename', 'Ansattnavn', UniTableColumnType.Text);
        let startCol = new UniTableColumn('startdato', 'Startdato', UniTableColumnType.LocalDate).setWidth('8rem');
        let endCol = new UniTableColumn('sluttdato', 'Sluttdato', UniTableColumnType.LocalDate).setWidth('8rem');
        let pcntCol = new UniTableColumn('permisjonsprosent', 'Prosent', UniTableColumnType.Percent).setWidth('5rem');
        let descCol = new UniTableColumn('beskrivelse', 'Beskrivelse', UniTableColumnType.Text);

        this.leaveTableConfig = new UniTableConfig(false, true, 30)
        .setColumns([idCol, numberCol, nameCol, startCol, endCol, pcntCol, descCol]);
    }

    private setupTransactions() {
        let typeCol = new UniTableColumn('incomeType', 'Type', UniTableColumnType.Text);
        let benefitCol = new UniTableColumn('benefit', 'Fordel', UniTableColumnType.Text);
        let descrCol = new UniTableColumn('description', 'Beskrivelse', UniTableColumnType.Text);
        let taxCol = new UniTableColumn('Base_EmploymentTax', 'Trekk', UniTableColumnType.Text).setWidth('4rem');
        taxCol.setTemplate((rowModel) => {
            if (rowModel.Base_EmploymentTax) {
                return 'Ja';
            } else {
                return 'Nei';
            }
        });
        let agaCol = new UniTableColumn('tax', 'Aga', UniTableColumnType.Text).setWidth('4rem');
        agaCol.setTemplate((rowModel) => {
            if (rowModel.tax) {
                return 'Ja';
            } else {
                return 'Nei';
            }
        });
        let amountCol = new UniTableColumn('amount', 'Beløp', UniTableColumnType.Money)
        .setWidth('6rem')
        .setCls('column-align-right');

        this.transactionTableConfig = new UniTableConfig(false, true, 30)
        .setColumns([typeCol, benefitCol, descrCol, taxCol, agaCol, amountCol]);
    }
}
