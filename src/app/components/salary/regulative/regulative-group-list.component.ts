import { Component, OnInit, OnDestroy } from '@angular/core';
import { IToolbarConfig } from '@app/components/common/toolbar/toolbar';
import { UniTableConfig, UniTableColumn, UniTableColumnType } from '@uni-framework/ui/unitable';
import { RegulativeGroup } from '@uni-entities';
import {
    RegulativeUploadModalComponent,
    IRegulativeUploadResult
} from '@app/components/salary/modals/regulative-upload-modal/regulative-upload-modal.component';
import { ConfirmActions, UniModalService } from '@uni-framework/uni-modal';
import { filter, map, switchMap, finalize, tap, catchError } from 'rxjs/operators';
import { StatisticsService, PageStateService, ErrorService } from '@app/services/services';
import { forkJoin, Observable } from 'rxjs';
import { TabService, UniModules } from '@app/components/layout/navbar/tabstrip/tabService';
import { NewRegulativeModalComponent, NewRegulativeActions } from '../modals/new-regulative-modal/new-regulative-modal.component';
import { ToastService, ToastType, ToastTime } from '@uni-framework/uniToast/toastService';
import { IUniSaveAction } from '@uni-framework/save/save';
@Component({
  selector: 'uni-regulative-group-list',
  templateUrl: './regulative-group-list.component.html',
  styleUrls: ['./regulative-group-list.component.sass']
})
export class RegulativeGroupListComponent implements OnInit {

    busy: boolean;
    regulativeGroups: RegulativeGroup[] = [];
    openRegulativeGroup: RegulativeGroup;

    tableConfig: UniTableConfig;

    saveActions: IUniSaveAction[] = [{
        label: 'Nytt regulativ',
        action: (done) => this.newRegulation(done),
    }];

    toolbarConfig: IToolbarConfig = {
        title: 'Regulativ',
    };

    constructor(
        private uniModalService: UniModalService,
        private statisticsService: StatisticsService,
        private tabService: TabService,
        private pageStateService: PageStateService,
        private toastService: ToastService,
        private errorService: ErrorService,
    ) { }

    ngOnInit() {
        this.loadData();
        this.createConfig();
        this.tabService.addTab({
            name: 'Regulativ',
            url: this.pageStateService.getUrl(),
            moduleID: UniModules.Regulative,
            active: true
        });
    }

    loadData() {
        this.busy = true;
        forkJoin(
            this.statisticsService.GetAllUnwrapped(
                'select=Name as Name,ID as ID,max(Regulatives.StartDate) as StartDate&' +
                'model=RegulativeGroup&' +
                'expand=Regulatives'
            ),
            this.statisticsService.GetAllUnwrapped(
                `select=EmployeeID as EmployeeID,RegulativeGroupID as RegulativeGroupID&` +
                `model=Employment&` +
                `filter=isnull(RegulativeGroupID,0) ne 0&` +
                'distinct=true'
            ),
        )
        .pipe(
            map((result: [RegulativeGroup[], {EmployeeID: number, RegulativeGroupID: number}[]]) => {
                const [regulativeGroups, regulativeGroupStatistics] = result;
                regulativeGroups.forEach(group => {
                        const employeesData = regulativeGroupStatistics
                        .filter(stat => stat.RegulativeGroupID === group.ID);
                        group['_EmployeeCount'] = employeesData && employeesData.length || 0;
                    }
                );
                return regulativeGroups;
            }),
            finalize(() => this.busy = false),
        )
        .subscribe(regulativeGroups => this.regulativeGroups = regulativeGroups);
    }

    createConfig() {
        const nameColumn = new UniTableColumn('Name', 'Navn', UniTableColumnType.Text)
            .setWidth('5rem');
        const employeeCountColumn = new UniTableColumn('_EmployeeCount', 'Gjelder for', UniTableColumnType.Number)
            .setTemplate((row: RegulativeGroup) => `${row['_EmployeeCount'] || 0} ansatte`);
        const startDate = new UniTableColumn('StartDate', 'Gyldig fra og med', UniTableColumnType.LocalDate);

        this.tableConfig = new UniTableConfig('salary.regulative', false, false)
            .setColumns(
                [
                    nameColumn,
                    startDate,
                    employeeCountColumn,
                ])
            .setAutoAddNewRow(false)
            .setEditable(false)
            .setColumnMenuVisible(false)
            .setSearchable(true);
    }

    newRegulation(done: (message: string) => void) {
        this.uniModalService
            .open(NewRegulativeModalComponent)
            .onClose
            .pipe(
                filter(result => result === NewRegulativeActions.IMPORT),
                switchMap(() => this.import$(done)),
                tap(result => this.toastService
                    .addToast(
                        `Regulativet ${result.regulativeGroup.Name} er opprettet og lagt til listen`,
                        ToastType.good,
                        ToastTime.medium
                    )
                ),
                tap(() => done('Regulativ opprettet')),
                catchError((err, obs) => {
                    done('Feil ved oppretting av regulativ');
                    return this.errorService.handleRxCatch(err, obs);
                })

            )
            .subscribe(() => this.loadData());
    }

    import() {
        this.import$()
            .pipe(
                tap(result => this.toastService
                    .addToast(
                        `Regulativet ${result.regulativeGroup.Name} er opprettet og lagt til listen`,
                        ToastType.good,
                        ToastTime.medium
                    )
                )
            )
            .subscribe(result => this.regulativeGroups.push(result.regulativeGroup));
    }

    import$(
        done?: (message: string) => void,
        regulativeGroup: RegulativeGroup = new RegulativeGroup()
    ): Observable<IRegulativeUploadResult> {
        return this.uniModalService
            .open(RegulativeUploadModalComponent, {header: 'Regulativ import', data: regulativeGroup})
            .onClose
            .pipe(
                map(result => <IRegulativeUploadResult>result),
                tap(result => {
                    if (result.confirmAction !== ConfirmActions.ACCEPT && done) {
                        done('Regulativimport avbrutt');
                    }
                }),
                filter(result => result.confirmAction === ConfirmActions.ACCEPT),
            );
    }

    rowSelected(event: RegulativeGroup) {
        this.openRegulativeGroup = event;
    }

    closeRegulativeDetails(needsImport: boolean) {
        if (needsImport) {
            this.import$(null, {...this.openRegulativeGroup})
                .pipe(
                    tap((result) => this.toastService
                        .addToast(`Oppdatering av ${result.regulativeGroup.Name} er fullført`, ToastType.good, ToastTime.medium)),
                )
                .subscribe(() => this.loadData());
        }
        this.openRegulativeGroup = null;
    }

}
