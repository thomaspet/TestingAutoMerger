import {Component, Input, OnChanges, EventEmitter, Output, SimpleChanges} from '@angular/core';
import * as moment from 'moment';
import { UniTableConfig, UniTableColumn, UniTableColumnType } from '@uni-framework/ui/unitable';
import { AMeldingService, IAmeldingPeriod } from '@app/components/salary/a-melding/shared/service/a-melding.service';
import { PensionSchemeService, IPensionSchemeDto } from '../shared/service/pension-scheme.service';
import { AmeldingData } from '@uni-entities';
import { UniModalService } from '@uni-framework/uni-modal';
import { PensionSchemeModalComponent } from '@app/components/salary/a-melding/modals/pension-scheme-modal/pension-scheme-modal.component';
import { ToastService, ToastType, ToastTime } from '@uni-framework/uniToast/toastService';
import { FinancialYearService } from '@app/services/services';

@Component({
    selector: 'amelding-summary-view',
    templateUrl: './summary.component.html',
    styleUrls: ['./summary.component.sass']
})

export class AmeldingSummaryViewComponent implements OnChanges {
    @Input() public currentSumUp: any;
    @Input() public currentAMelding: AmeldingData;
    @Input() public errorMessage: string;
    @Input() period: number;
    public employeeTableConfig: UniTableConfig;
    public leaveTableConfig: UniTableConfig;
    public transactionTableConfig: UniTableConfig;
    private employeeAndEmployments: any[] = [];
    private employeeleaves: any[] = [];
    private sumPerDescription: any[] = [];
    public entitiesWithData: any[] = [];
    public createdDate: string = '';
    public sentDate: string = '';
    public statusText: string;
    public validations: string[];
    private statuses: any[] = ['Generert', 'Generert', 'Innsendt', 'Status mottatt fra altinn'];
    public showXMLValidationError: boolean;
    public validationErrorsInAmelding: string;
    public pensionSchemeText: string;

    constructor(
        private ameldingService: AMeldingService,
        private pensionSchemeService: PensionSchemeService,
        private modalService: UniModalService,
        private toastService: ToastService,
        private yearService: FinancialYearService,
    ) {
        this.setupEmployees();
        this.setupLeaves();
        this.setupTransactions();
    }

    public ngOnInit() {

    }

    public ngOnChanges(changes: SimpleChanges) {
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

        if (changes['period']) {
            this.pensionSchemeService
                .getNames(this.yearService.getActiveYear(), this.period)
                .subscribe(names => this.pensionSchemeText = names);
        }

        this.validationErrorsInAmelding = '';
        if (this.validations && this.validations.length) {
            this.validationErrorsInAmelding = this.validations.join(',');
        }
        if (!!this.currentAMelding && !!this.currentAMelding.xmlValidationErrors) {
            this.validationErrorsInAmelding += this.currentAMelding.xmlValidationErrors;
        }
        this.showXMLValidationError = this.validationErrorsInAmelding !== '' ? true : false;

    }

    openPensionSchemeModal() {
        if (!this.period) {
            return;
        }
        const period: IAmeldingPeriod = {
            year: this.yearService.getActiveYear(),
            month: this.period,
        };
        this.modalService
            .open(PensionSchemeModalComponent, {data: period})
            .onClose
            .subscribe((schemes: IPensionSchemeDto[]) => {
                const updatedPensionSchemeText = this.pensionSchemeService.toNames(schemes);
                if ((this.pensionSchemeText || '') !== updatedPensionSchemeText) {
                    this.pensionSchemeText = updatedPensionSchemeText;
                    this.toastService
                        .addToast(
                            'SALARY.AMELDING.SUMMARY.PENSION_SCHEME_TOAST_HEADER',
                            ToastType.good,
                            ToastTime.medium,
                            'SALARY.AMELDING.SUMMARY.PENSION_SCHEME_TOAST_MESSAGE'
                        );
                }
            });
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
                                    endDate: arbeidsforhold.endDate,
                                    validations: arbeidsforhold.validations,
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
                    sums: entitySums,
                    validations: this.ameldingService.getValidations(entity),
                });
            });
        }
        this.validations = this.entitiesWithData.map(virk => virk.validations).reduce((val, curr) => [...val, ...curr], []);
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

        const errorsCol = new UniTableColumn('validations', 'Feil')
            .setTemplate(row => row.validations && row.validations.length ?  ' ' : '')
            .setWidth('2rem')
            .setFilterable(true)
            .setTooltipResolver(rowModel => {
                if (rowModel.validations && rowModel.validations.length) {
                    return {
                        type: 'bad',
                        text: rowModel.validations.join(', '),
                    };
                }
            });

        this.employeeTableConfig = new UniTableConfig('salary.amelding.summary.employees', false, true, 30)
        .setColumns([empNoCol, nameCol, emplmntCol, startCol, endCol, errorsCol]);
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
