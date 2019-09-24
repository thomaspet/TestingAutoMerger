import {Component, ViewChild, ElementRef} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {FormControl} from '@angular/forms';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {BudgetService, NumberFormat, ReportDefinitionService, DepartmentService, PageStateService} from '@app/services/services';
import {UniModalService, ConfirmActions, IModalOptions, UniConfirmModalV2} from '@uni-framework/uni-modal';
import {IUniSaveAction} from '@uni-framework/save/save';
import {Budget} from '@app/unientities';
import {UniBudgetEntryEditModal} from './budgetEntryEditModal';
import {UniBudgetEditModal} from './budgetEditModal';
import * as Chart from 'chart.js';
import {Observable} from 'rxjs';
import {UniPreviewModal} from '../../reports/modals/preview/previewModal';
import {IStatus, STATUSTRACK_STATES} from '../../common/toolbar/statustrack';
import {saveAs} from 'file-saver';
import PerfectScrollbar from 'perfect-scrollbar';

@Component({
    selector: 'uni-budget-view',
    templateUrl: './budgetview.html'
})

export class UniBudgetView {

    @ViewChild('chart')
    private chart: ElementRef;

    displayData;
    showEmptyBudgetView: boolean = false;
    showSideMenu: boolean = false;
    budgetIDFromParams: number;
    allBudgets: any[] = [];
    filteredBudgets: any[] = [];
    currentBudget: Budget;
    originalBudgetData: any[] = [];
    accountingData: any[];
    departments: any[] = [];
    currentDepartment;
    myChart: Chart;
    myChartData;
    hideChart: boolean = false;
    searchControl: FormControl = new FormControl('');
    currentLine;
    filterString: string = '';
    state;
    toolbarConfig;

    saveActions: IUniSaveAction[] = [];
    scrollbar: PerfectScrollbar;

    listActions = [
        { name: 'edit', label: 'Rediger budsjett'},
        { name: 'select', label: 'Vis budsjett' },
        { name: 'delete', label: 'Slett budsjett' }
    ];

    private MONTHS_SHORT: string[] = [ 'Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Des' ];

    constructor (
        private tabService: TabService,
        private route: ActivatedRoute,
        private budgetService: BudgetService,
        public numberFormatService: NumberFormat,
        private modalService: UniModalService,
        private reportService: ReportDefinitionService,
        private departmentService: DepartmentService,
        private pageStateService: PageStateService
        ) {
            this.searchControl.valueChanges
            .debounceTime(150)
            .subscribe(query => {
                this.filteredBudgets = this.getFilteredBudget();
                setTimeout(() => {
                    if (this.showSideMenu) {
                        this.scrollbar.update();
                    }
                });
            });
        }

    public ngOnInit() {

        this.hideChart = JSON.parse(localStorage.getItem('ShowHideBudgetChart'));

        Observable.forkJoin(
            this.budgetService.GetAll(null),
            this.departmentService.GetAll(null),
        ).subscribe((result) => {
            this.departments = result[1];
            this.departments.unshift({ Name: 'Alle', ID: 'ALLDEPARTMENTSID', DepartmentNumber: 0 });
            this.currentDepartment = this.departments[0];
            if (!result[0].length) {
                this.showEmptyBudgetView = true;
                this.updateToolbar();
                return;
            } else {
                this.allBudgets = result[0];

                this.route.queryParams.subscribe(params => {
                    this.budgetIDFromParams = +params['id'];
                    this.findStandardOrFirst();
                });
            }
        });

        this.tabService.addTab({
            name: 'Budsjett',
            url: this.pageStateService.getUrl(),
            active: true,
            moduleID: UniModules.Budget
        });
    }

    public showHideSideMenu() {
        this.showSideMenu = !this.showSideMenu;
        if (this.showSideMenu) {
            setTimeout(() => {
                this.scrollbar = new PerfectScrollbar('#role-info');
            });
        }
    }

    private updateToolbar() {
        this.toolbarConfig = {
            title: this.currentBudget ? this.currentBudget.Name : 'Budsjett',
            statustrack: this.currentBudget ? this.getStatustrackConfig() : null,
        };
    }

    private updateSaveaActions() {
        this.saveActions = [
            {
                label: 'Nytt budsjett',
                action: (done) => this.openEditModal(null, done),
                main: true,
                disabled: false
            },
            {
                label: 'Aktiver',
                action: done => this.transition('activate', done, 'Aktivering'),
                main: false,
                disabled: this.currentBudget.StatusCode === 47002
            },
            {
                label: 'Deaktiver',
                action: done => this.transition('deactivate', done, 'Deaktivering'),
                disabled: this.currentBudget.StatusCode === 47001
            },
            {
                label: 'Last ned tom mal',
                action: (done) => this.downloadTemplate(null, done),
                main: false,
                disabled: false
            },
            {
                label: 'Eksporter budsjett',
                action: (done) => this.downloadTemplate(this.currentBudget, done),
                main: false,
                disabled: false
            },
            {
                label: 'Importer budsjett',
                action: (done) => this.openEditModal(this.currentBudget, done, true),
                main: false,
                disabled: false
            },
            {
                label: 'Slett budsjett',
                action: (done) => this.deleteBudget(this.currentBudget, done),
                main: false,
                disabled: false
            }
        ];
    }

    private transition(action: string, done, doneString: string) {
        this.budgetService.transitionAction(this.currentBudget.ID, action).subscribe((res) => {
            this.currentBudget = res;
            this.updateToolbar();
            this.updateSaveaActions();
            done(`${doneString} fullført.`);
        }, err => { done(`${doneString} feilet.`); });
    }

    private getFilteredBudget() {
        return this.allBudgets.filter((budget: Budget) => {
            const name = (budget.Name || '').toLowerCase();
            const filterString = (this.filterString || '').toLowerCase();

            return name.includes(filterString);
        }).slice(0, 99);
    }

    private getStatustrackConfig() {
        const statustrack: IStatus[] = [];
        let activeStatus = 0;
        if (this.currentBudget) {
            activeStatus = this.currentBudget.StatusCode || 1;
        }

        const statuses = [
            { Code: 47002, Text: 'Aktivt' },
            { Code: 47001, Text: 'Inaktivt' },
        ];
        statuses.forEach((status) => {
            let _state: STATUSTRACK_STATES;

            if (status.Code > activeStatus) {
                _state = STATUSTRACK_STATES.Future;
            } else if (status.Code < activeStatus) {
                _state = STATUSTRACK_STATES.Completed;
            } else if (status.Code === activeStatus) {
                _state = STATUSTRACK_STATES.Active;
            }

            statustrack.push({
                title: status.Text,
                state: _state,
                code: status.Code
            });
        });

        return statustrack;
    }

    public findStandardOrFirst() {
        let index;
        if (this.budgetIDFromParams) {
            index = this.allBudgets.findIndex(bud => bud.ID === this.budgetIDFromParams);
        } else {
            index = this.allBudgets.findIndex(bud => bud.AccountingYear === new Date().getFullYear() && bud.StatusCode === 47002);
        }
        index = index > -1 ? index : 0;

        this.currentBudget = this.allBudgets[index];

        this.getAndShowBudgetDetails();
    }

    public getAndShowBudgetDetails() {
        if (!this.currentBudget) {
            // Error message? Route?
            return;
        }

        this.tabService.currentActiveTab.url = '/accounting/budget?id=' + this.currentBudget.ID;
        this.pageStateService.setPageState('id', this.currentBudget.ID + '');

        const departmentNumber = this.currentDepartment && this.currentDepartment.ID !== 'ALLDEPARTMENTSID'
            ? this.currentDepartment.DepartmentNumber
            : null;

        Observable.forkJoin(
            this.budgetService.getBudgetDetails(this.currentBudget.ID, departmentNumber),
            this.budgetService.getProfitAndLossGrouped(this.currentBudget.AccountingYear)
        ).subscribe((result) => {
            this.originalBudgetData = result[0];
            this.accountingData = result[1];
            this.formatAndDisplayData();
            this.updateToolbar();
            this.updateSaveaActions();
        });
    }

    public formatAndDisplayData() {
        this.displayData = this.budgetService.formatbudgetData(this.originalBudgetData);
        if (this.state) {
            this.displayData.forEach(group => {
                group.showSubGroup = this.state['group' + group.GroupNumber];
                if (group.children) {
                    group.children.forEach(child => {
                        child.showData = this.state['subgroup' + child.GroupNumber + child.GroupName];
                    });
                }
            });
        }

        // Reset state
        this.state = null;

        if (!this.hideChart) {
            this.formatChartData(this.displayData, this.accountingData);
        }
    }

    public openEditModal(budget: Budget = null, done = null, isImport: boolean = false) {
        const options = {
            header: budget ? budget.Name : 'Nytt budsjett',
            data: {
                budget: budget || null,
                isImport: isImport,
                departments: this.departments
            }
        };

        this.modalService.open(UniBudgetEditModal, options).onClose.subscribe((res) => {
            if (res) {
                this.currentBudget = res;

                // If new project has been created, add it to all budgets array
                if (this.allBudgets.findIndex(bud => bud.ID === res.ID) === -1) {
                    this.allBudgets.push(res);
                }

                this.getAndShowBudgetDetails();
                if (done) {
                    done('Budsjett lagret');
                }
                this.showSideMenu = false;
            } else {
                if (done) {
                    done();
                }
            }
        });
    }

    public openBudgetReport() {
        const name = 'BudgetDetails';

        this.reportService.GetAll(`filter=name eq '${name}'`)
            .subscribe( (reports: Array<any>) => {
                if (reports.length) {
                    const report = reports[0];
                    report.parameters = [{ value: this.currentBudget.ID, Name: 'id' }];

                    this.modalService.open(UniPreviewModal, {
                        data: report
                    });
                }
            });
        return;
    }

    public showHideSubgroup(group) {
        if (!group.isSumCol) {
            group.showSubGroup = !group.showSubGroup;
        }
    }

    public showHideChart() {
        this.hideChart = !this.hideChart;
        localStorage.setItem('ShowHideBudgetChart', JSON.stringify(this.hideChart));

        if (this.hideChart) {
            if (this.myChart) {
                this.myChart.destroy();
            }
        } else {
            setTimeout(() => {
                this.formatChartData(this.displayData, this.accountingData);
            }, 400);
        }
    }

    public onActionClick(action: any, item: Budget) {
        switch (action.name) {
            case 'edit':
                this.openEditModal(item, null);
                break;

            case 'select':
                this.onBudgetSelect(item);
                break;

            case 'delete':
                this.deleteBudget(item, null);
                break;

            default:
                break;
        }
    }

    public onAccountSelect(line) {
        this.currentLine = line;
        this.budgetService.getEntriesFromBudgetIDAndAccount(
            this.currentBudget.ID,
            line.AccountNumber
        ).subscribe((entries: any[]) => {
            this.openEntryEditModal(entries);
        });
    }

    public onDepartmentFilterChange(department) {
        this.currentDepartment = department;
        this.getAndShowBudgetDetails();
    }

    public openEntryEditModal(entries: any[] = null) {
        this.modalService.open(UniBudgetEntryEditModal,
            {
                data: {
                    BudgetID: this.currentBudget.ID,
                    entries: entries,
                    department: this.currentDepartment,
                    departments: this.departments
                }
            }).onClose.subscribe((res) => {
            if (res) {
                const account = res.entries[0].Account;

                this.currentBudget.Entries = res.entries;

                this.budgetService.Put(this.currentBudget.ID, this.currentBudget).subscribe((response) => {
                    this.state = {};
                    this.displayData.forEach(group => {
                        this.state['group' + group.GroupNumber] = group.showSubGroup;
                        if (group.children) {
                            group.children.forEach(child => {
                                this.state['subgroup' + child.GroupNumber + child.GroupName] = child.showData;
                            });
                        }
                    });
                    if (this.currentDepartment.ID !== res.department.ID) {
                        this.currentDepartment = res.department;
                        this.getAndShowBudgetDetails();
                    } else if (this.currentLine && account) {
                        const lineToEdit = this.originalBudgetData.find(data => data.AccountNumber === account.AccountNumber);
                        if (lineToEdit && response.Entries) {
                            response.Entries.forEach((ent) => {
                                lineToEdit['BudPeriod' + ent.PeriodNumber] = ent.Amount;
                            });

                            // Update the budget sum
                            lineToEdit.BudgetSum = 0;

                            lineToEdit.cls = 'line-updated';

                            for (let i = 1; i <= 12; i++) {
                                lineToEdit.BudgetSum += lineToEdit['BudPeriod' + i];
                            }

                            this.formatAndDisplayData();

                            setTimeout(() => {
                                lineToEdit.cls = '';
                            }, 2000);
                        } else {
                            // Something went wrong getting the original data to update..
                            // Show toast and reload data
                            this.getAndShowBudgetDetails();
                        }
                        this.currentLine = null;
                    } else {
                        this.getAndShowBudgetDetails();
                    }
                }, err => {
                    this.currentLine = null;
                });
            } else {
                this.currentLine = null;
            }
        });
    }

    public onBudgetSelect(budget: Budget) {
        this.currentBudget = budget;
        this.showSideMenu = false;
        this.getAndShowBudgetDetails();
    }

    public downloadTemplate(budget: Budget = null, done?) {
        this.budgetService.getExcelTemplate(budget ? budget.ID : 0).subscribe((blob) => {
            saveAs(blob, 'budget.xlsx');
            if (done) {
                done('Excel-mal hentet og lastet ned');
            }
        });
    }

    public deleteBudget(budget: Budget, done) {
        if (!budget) {
            budget = this.currentBudget;
        }
        const options: IModalOptions = {
            header: `Slette budsjett: ${budget.Name}`,
            message: 'Er du sikker på at du vil slette busjettet? Dette kan ikke angres.',
            buttonLabels: {
                accept: 'Slett',
                cancel: 'Avbryt'
            }
        };

        this.modalService.open(UniConfirmModalV2, options).onClose.subscribe((action: ConfirmActions) => {
            if (action === ConfirmActions.ACCEPT) {
                this.budgetService.Remove(this.currentBudget.ID).subscribe((del) => {
                    this.showSideMenu = false;
                    if (this.allBudgets.length === 1) {
                        this.allBudgets = [];
                        this.currentBudget = null;
                        this.showEmptyBudgetView = true;
                    } else {
                        this.allBudgets.splice(this.allBudgets.findIndex(bud => bud.ID === this.currentBudget.ID), 1);
                        this.findStandardOrFirst();
                    }
                    if (done) {
                        done('Budsjett slettet');
                    }
                });
            } else {
                if (done) {
                    done();
                }
            }
        });
    }

    public budgetNumberFormat(value: number) {
        if (!value && value !== 0) {
            return '';
        }

        let stringValue = value.toString().replace(',', '.').replace('-', '');
        stringValue = parseFloat(stringValue).toFixed(0);

        let [integer, decimal] = stringValue.split('.');
        integer = integer.replace(/\B(?=(\d{3})+(?!\d))/g, '\u2009');

        stringValue = decimal ? (integer + ',' + decimal) : integer;

        return stringValue;
    }

    private formatChartData(data, accountingData) {
        const dataSet = [
            {
                label: 'Budsjettert',
                backgroundColor: '#63a2e1',
                data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
              },
              {
                label: 'Regnskap',
                backgroundColor: '#81d8f8',
                data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
              }
        ];

        for (let i = 1; i <= 12; i++) {
            dataSet[0].data[i - 1] = data[data.length - 1]['BudPeriod' + i] * -1;
            dataSet[1].data[i - 1] = accountingData[accountingData.length - 1]['Period' + i] * -1;
        }

        this.myChartData = dataSet;

        this.drawChart(dataSet);
    }

    private drawChart(data) {
        if (this.myChart) {
            this.myChart.destroy();
        }

        const options: any = {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                yAxes: [{
                    gridLines: {
                        display: false
                    }
                }],
                xAxes: [{
                    gridLines: {
                        display: false
                    }
                }]
            }
        };

        this.myChart = new Chart(<any> this.chart.nativeElement, {
            type: 'bar',
            data: {
                labels: this.MONTHS_SHORT,
                datasets: data
            },
            options: options
        });
    }
}
