import {Component, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {Router} from '@angular/router';
import {IUniWidget} from '../uniWidget';
import {AuthService} from '../../../authService';
import {FinancialYearService} from '@app/services/services';
import {WidgetDataService} from '@app/components/widgets/widgetDataService';
import {Company} from '@uni-entities';

interface IKeyNumberObject {
    label: string;
    value: string;
    grade: string;
    class: string;
    indicator: string;
}

@Component({
    selector: 'uni-kpi-widget',
    template: `
        <section class="company-name">
            {{company?.Name}}
        </section>

        <section class="kpi-section">

            <section *ngFor="let kpiItem of kpiItems" class="overview-widget-count">
                <p>{{kpiItem.label}}</p>
                <span>
                    <i class="material-icons" [ngClass]="kpiItem.class">
                        {{kpiItem.indicator}}
                    </i>
                    <strong>{{kpiItem.grade}} </strong>
                    {{kpiItem.value ? ' (' + kpiItem.value + ')' : ''}}
                </span>
            </section>

        </section>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniKpiWidget {
    public widget: IUniWidget;

    public company: Company;

    public kpiItems: IKeyNumberObject[] = [
        {
            label: 'Lønnsomhet',
            value: '',
            grade: 'Ikke tilgjengelig',
            class: 'warn',
            indicator: 'trending_flat',
        },
        {
            label: 'Likviditet',
            value: '',
            grade: 'Ikke tilgjengelig',
            class: 'warn',
            indicator: 'trending_flat',
        },
        {
            label: 'Soliditet',
            value: '',
            grade: 'Ikke tilgjengelig',
            class: 'warn',
            indicator: 'trending_flat',
        }
    ];

    constructor(
        private router: Router,
        private authService: AuthService,
        private cdr: ChangeDetectorRef,
        private dataService: WidgetDataService,
        private financialYearService: FinancialYearService
    ) {
        this.authService.authentication$.subscribe(auth => {
            this.company = auth.activeCompany;
        });
    }

    public ngAfterViewInit() {
        this.authService.authentication$.subscribe(auth => {
            const user = auth.user;
            if (this.authService.hasUIPermission(user, 'ui_accounting_accountingreports')) {
                this.getKpiData();
            }
        });
    }

    private getKpiData() {
        this.financialYearService.lastSelectedFinancialYear$.subscribe(financialYear => {
            const year = financialYear.Year;
            const endpoint = '/api/statistics?model=JournalEntryLine'
            + '&select=sum(casewhen(Account.AccountNumber ge 1400 '
            + 'and Account.AccountNumber le 1999,Amount,0)) as sumOmlopsmidler,'
            + 'sum(casewhen(Account.AccountNumber ge 2300 '
            + 'and Account.AccountNumber le 2999,Amount,0)) as sumkortsiktiggjeld,'
            + 'sum(casewhen(Account.AccountNumber ge 2000 '
            + 'and Account.AccountNumber le 2999,Amount,0)) as sumTK,'
            + 'sum(casewhen(Account.AccountNumber ge 2000 '
            + 'and Account.AccountNumber le 2099,Amount,0)) as sumEK,'
            + 'sum(casewhen(Account.AccountNumber ge 3000 '
            + 'and Account.AccountNumber le 8299 '
            + 'and Period.AccountYear eq ' + year + ',Amount,0)) as resultat'
            + '&expand=Account,Period&distinct=false';

            this.dataService.getData(endpoint).subscribe(data => {
                if (!data || !data.Data) {
                    return;
                }

                this.initProfitabilityIndicator(data.Data[0]);
                this.initLiquidityIndicator(data.Data[0]);
                this.initSolidityIndicator(data.Data[0]);

                this.cdr.markForCheck();
            });
        });
    }

    public initProfitabilityIndicator(data) {
        if (data.sumTK) {
            this.kpiItems[0].value = ((data.resultat * 100) / data.sumTK || 1).toFixed(1);
            this.checkNumbers(this.kpiItems[0], [1, 5, 9, 15]);
        }
    }


    public initLiquidityIndicator(data) {
        if (data.sumkortsiktiggjeld) {
            this.kpiItems[1].value = (data.sumOmlopsmidler / (data.sumkortsiktiggjeld * -1)).toFixed(1);
            this.checkNumbers(this.kpiItems[1], [0.5, 1, 1.5, 2]);
        }
    }

    public initSolidityIndicator(data) {
        if (data.sumTK) {
            // Add result to give a more up-to-date view of the solidity
            this.kpiItems[2].value = (((data.sumEK + data.resultat) * 100) / (data.sumTK + data.resultat)).toFixed(1);
            this.checkNumbers(this.kpiItems[2], [3, 10, 18, 40]);
        }
    }

    public checkNumbers(kpiObject: IKeyNumberObject, breakpoints: number[]) {
        const keyNumber = parseInt(kpiObject.value, 10);

        if (keyNumber < breakpoints[0]) {
            kpiObject.grade = 'Ikke tilfredstillende';
            kpiObject.class = 'bad';
            kpiObject.indicator = 'trending_down';
        } else if (keyNumber >= breakpoints[0] && keyNumber < breakpoints[1]) {
            kpiObject.grade = 'Svak';
            kpiObject.class = 'bad';
            kpiObject.indicator = 'trending_down';
        } else if (keyNumber >= breakpoints[1] && keyNumber < breakpoints[2]) {
            kpiObject.grade = 'Tilfredstillende';
            kpiObject.class = 'warn';
            kpiObject.indicator = 'trending_flat';
        } else if (keyNumber >= breakpoints[2] && keyNumber < breakpoints[3]) {
            kpiObject.grade = 'God';
            kpiObject.class = 'good';
            kpiObject.indicator = 'trending_up';
        } else {
            kpiObject.grade = 'Meget god';
            kpiObject.class = 'good';
            kpiObject.indicator = 'trending_up';
        }
    }
}
