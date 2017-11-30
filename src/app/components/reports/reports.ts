import {Component, ViewChild} from '@angular/core';
import {TabService, UniModules} from '../layout/navbar/tabstrip/tabService';
import {ReportDefinition, UniQueryDefinition} from '../../unientities';
import {ReportDefinitionService, UniQueryDefinitionService, ErrorService} from '../../services/services';
import {Report} from '../../models/reports/report';
import {BalanceReportFilterModal} from './modals/balanceList/BalanceReportFilterModal';
import {PostingJournalReportFilterModal} from './modals/postingJournal/PostingJournalReportFilterModal';
import {ResultAndBalanceReportFilterModal} from './modals/resultAndBalance/ResultAndBalanceReportFilterModal';
import {BalanceGeneralLedgerFilterModal} from './modals/balanceGeneralLedgerFilter/BalanceGeneralLedgerFilterModal';
import {CustomerAccountReportFilterModal} from './modals/customerAccountReportFilter/CustomerAccountReportFilterModal';
import {SupplierAccountReportFilterModal} from './modals/supplierAccountReportFilter/SupplierAccountReportFilterModal';
import {AccountReportFilterModal} from './modals/account/AccountReportFilterModal';
import {SalaryPaymentListReportFilterModal} from './modals/salaryPaymentList/salaryPaymentListReportFilterModal';
import {VacationPayBaseReportFilterModal} from './modals/vacationPayBase/vacationPayBaseReportFilterModal';
import {SalaryWithholdingAndAGAReportFilterModal} from './modals/salaryWithholdingAndAGA/salaryWithholdingAndAGAReportFilterModal';
import {PayCheckReportFilterModal} from './modals/paycheck/paycheckReportFilterModal';
import {Router} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import {UniModalService, ConfirmActions} from '../../../framework/uniModal/barrel';
import {UniReportParamsModal} from './modals/parameter/reportParamModal';
import {UniPreviewModal} from './modals/preview/previewModal';

interface IMainGroup {
    name: string;
    label: string;
    groups: Array<ISubGroup>;
}

interface ISubGroup {
    name: string;
    label: string;
    reports: Array<Report>;
    keywords?: Array<string>;
}

@Component({
    selector: 'uni-reports',
    templateUrl: './reports.html'
})
export class UniReports {

    // TODO: rewrite old modals..
    @ViewChild(BalanceReportFilterModal)
    private balanceListModal: BalanceReportFilterModal;

    @ViewChild(AccountReportFilterModal)
    private accountReportFilterModal: AccountReportFilterModal;

    @ViewChild(PostingJournalReportFilterModal)
    private postingJournalModal: PostingJournalReportFilterModal;

    @ViewChild(ResultAndBalanceReportFilterModal)
    private resultAndBalanceModal: ResultAndBalanceReportFilterModal;

    @ViewChild(BalanceGeneralLedgerFilterModal)
    private balanceGeneralLedgerFilterModal: BalanceGeneralLedgerFilterModal;

    @ViewChild(CustomerAccountReportFilterModal)
    private customerAccountModal: CustomerAccountReportFilterModal;

    @ViewChild(SupplierAccountReportFilterModal)
    private supplierAccountModal: SupplierAccountReportFilterModal;

    @ViewChild(SalaryPaymentListReportFilterModal)
    private salaryPaymentListFilterModal: SalaryPaymentListReportFilterModal;

    @ViewChild(VacationPayBaseReportFilterModal)
    private vacationBaseFilterModal: VacationPayBaseReportFilterModal;

    @ViewChild(SalaryWithholdingAndAGAReportFilterModal)
    private salaryWithholdingAndAGAReportFilterModal: SalaryWithholdingAndAGAReportFilterModal;

    @ViewChild(PayCheckReportFilterModal)
    private paycheckReportFilterModal: PayCheckReportFilterModal;

    public activeTabIndex: number = 0;
    public busy: boolean = true;

    public mainGroups: Array<IMainGroup> = [
        { name: 'Sales', label: 'Salg', groups: [
            { name: 'Quote', label: 'Tilbud', reports: [], keywords: ['Sales.Quote'] },
            { name: 'Order', label: 'Ordre', reports: [], keywords: ['Sales.Order'] },
            { name: 'Invoice', label: 'Faktura', reports: [], keywords: ['Sales.Invoice'] },
        ] },
        { name: 'Accounting', label: 'Regnskap', groups: [
            { name: 'AccountStatement', label: 'Kontoutskrifter', reports: [],
                keywords: ['Accounting.AccountStatement'] },
            { name: 'Balance', label: 'Saldolister', reports: [], keywords: ['Accounting.Balance'] },
            { name: 'Result', label: 'Resultat', reports: [], keywords: ['Accounting.Result'] },
        ] },
        { name: 'Payroll', label: 'Lønn', groups:  [
            { name: 'Payroll', label: 'Lønn', reports: [], keywords: ['Salary', 'Payroll'] },
        ] },
        { name: 'Timeracking', label: 'Timer', groups: [
            { name: 'Timeracking', label: 'Timeregistrering', reports: [], keywords: ['Timer'] },
        ] },
        { name: 'Custom', label: 'Egendefinert', groups: [
            { name: 'Custom', label: 'Ukategorisert', reports: [], keywords: [] },
        ] },
    ];

    constructor(
        private tabService: TabService,
        private reportDefinitionService: ReportDefinitionService,
        private uniQueryDefinitionService: UniQueryDefinitionService,
        private router: Router,
        private errorService: ErrorService,
        private uniModalService: UniModalService
    ) {
        this.tabService.addTab({
            name: 'Rapportoversikt',
            url: '/reports',
            moduleID: UniModules.Reports,
            active: true
        });
    }

    public showReportParams(report: ReportDefinition) {
        switch (report.ID) {
            case 7:
            case 8:
                this.salaryPaymentListFilterModal.open(report);
                break;
            case 9:
                this.vacationBaseFilterModal.open(report);
                break;
            case 10:
                this.paycheckReportFilterModal.open(report);
                break;
            case 11:
                this.salaryWithholdingAndAGAReportFilterModal.open(report);
                break;
            case 12:
            case 13:
                this.balanceListModal.open(report);
                break;
            case 14:
                this.resultAndBalanceModal.open(report);
                break;
            case 15:
                this.balanceGeneralLedgerFilterModal.open(report);
                break;
            case 16:
                this.postingJournalModal.open(report);
                break;
            case 17:
                this.accountReportFilterModal.open(report);
                break;
            case 18:
                this.customerAccountModal.open(report);
                break;
            case 19:
                this.supplierAccountModal.open(report);
                break;
            default:
                this.defaultRunReport(report);
                break;
        }
    }

    private defaultRunReport(report: ReportDefinition) {
        this.uniModalService.open(UniReportParamsModal,
            {   data: report,
                header: report.Name,
                message: report.Description
            }).onClose.subscribe(modalResult => {
                if (modalResult === ConfirmActions.ACCEPT) {
                    this.uniModalService.open(UniPreviewModal, {
                        data: report
                    });
                }
            });
    }

    public showUniQuery(report: UniQueryDefinition) {
        this.router.navigateByUrl('/uniqueries/details/' + report.ID);
    }

    public ngOnInit() {
        this.busy = true;
        Observable.forkJoin(
            this.reportDefinitionService.GetAll<ReportDefinition>(null),
            this.uniQueryDefinitionService.GetAll<UniQueryDefinition>(null))
            .finally( () => this.busy = false )
            .subscribe( result => this.showReportsEx(result)
            , err => this.errorService.handle(err));
    }

    private showReportsEx(response) {
        response[0].forEach(x => x.IsReport = true);
        response[1].forEach(x => x.IsQuery = true);
        const reportAndQueries = response[0].concat(response[1]);
        reportAndQueries.forEach(element => {
            if (element.Visible || element.IsQuery) {
                this.placeReport(<Report>element);
            }
        });
    }

    private placeReport(report: Report) {
        for (let i = 0; i < this.mainGroups.length; i++) {
            const match = this.mainGroups[i].groups.find( x => x.label === report.Category
                || (x.keywords && x.keywords.indexOf(report.Category) >= 0));
            if (match) {
                match.reports.push(report);
                return;
            }
        }

        // Category not found (put into "custom")
        const main = this.mainGroups.find( x => x.name === 'Custom');
        if (report.Category) {
            const grp = main.groups.find( g => g.label === report.Category || g.name === report.Category);
            if (grp) {
                grp.reports.push(report);
            } else {
                main.groups.push( { name: report.Category, label: report.Category, reports: [ report ] });
            }
        } else {
            main.groups.find( x => x.name === 'Custom').reports.push(report);
        }
    }

}
