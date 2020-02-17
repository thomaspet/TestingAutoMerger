import { Component, OnInit, OnDestroy } from '@angular/core';
import { IToolbarConfig } from '@app/components/common/toolbar/toolbar';
import { UniTableConfig, UniTableColumn, UniTableColumnType } from '@uni-framework/ui/unitable';
import { RegulativeGroup } from '@uni-entities';
import { RegulativeUploadModalComponent, IRegulativeUploadResult } from '@app/components/salary/modals/regulative-upload-modal/regulative-upload-modal.component';
import { ConfirmActions, UniModalService, UniNewRegulativeModal } from '@uni-framework/uni-modal';
import { filter, map, switchMap, finalize } from 'rxjs/operators';
import { RegulativeGroupService, StatisticsService, PageStateService } from '@app/services/services';
import { forkJoin } from 'rxjs';
import { Router } from '@angular/router';
import { TabService, UniModules } from '@app/components/layout/navbar/tabstrip/tabService';
@Component({
  selector: 'uni-regulative-group-list',
  templateUrl: './regulative-group-list.component.html',
  styleUrls: ['./regulative-group-list.component.sass']
})
export class RegulativeGroupListComponent implements OnInit {

    busy: boolean;
    regulativeGroups: RegulativeGroup[] = [];

    tableConfig: UniTableConfig;

    toolbarConfig: IToolbarConfig = {
        title: 'Regulativ',
        navigation: {
            add: {
                label: 'Lag nytt regulativ',
                action: () => this.newRegulation(),
            }
        },
    };

    constructor(
        private uniModalService: UniModalService,
        private regulativeGroupService: RegulativeGroupService,
        private statisticsService: StatisticsService,
        private router: Router,
        private tabService: TabService,
        private pageStateService: PageStateService,
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
            this.regulativeGroupService.GetAll('', ['Regulatives']),
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
                        if (!group.Regulatives || !group.Regulatives.length) {
                            return group;
                        }
                        group['_StartDate'] = group
                            .Regulatives
                            .map(regulative => regulative.StartDate)
                            .reduce((earliest, current) => (earliest && earliest < current) ? earliest : current);
                        return group;
                    }
                );
                return regulativeGroups;
            }),
            finalize(() => this.busy = false),
        )
        .subscribe(regulativeGroups => this.regulativeGroups = regulativeGroups);
    }

    createConfig() {
        const nameColumn = new UniTableColumn('Name', 'Navn', UniTableColumnType.Number)
            .setWidth('5rem');
        const employeeCountColumn = new UniTableColumn('_EmployeeCount', 'Knyttet til')
            .setTemplate((row: RegulativeGroup) => `${row['_EmployeeCount']} ansatte`);
        const startDate = new UniTableColumn('_StartDate', 'Gyldig fra', UniTableColumnType.LocalDate);
        const linkColumn = new UniTableColumn('ID', 'Regulativ', UniTableColumnType.Link)
            .setTemplate(() => 'Detaljer')
            .setLinkResolver((row: RegulativeGroup) =>
                `salary/regulative/${row.ID}`
            );

        this.tableConfig = new UniTableConfig('salary.regulative', false, false)
            .setColumns(
                [
                    nameColumn,
                    startDate,
                    employeeCountColumn,
                    linkColumn,
                ])
            .setAutoAddNewRow(false)
            .setEditable(false)
            .setColumnMenuVisible(false);
    }

    newRegulation() {
        this.uniModalService
            .open(UniNewRegulativeModal)
            .onClose
            .pipe(
                filter(result => result === ConfirmActions.ACCEPT),
                switchMap(() => this.import$()),
            )
            .subscribe(result => this.navigateTo(result.regulativeGroup));
    }

    import() {
        this.import$()
            .subscribe(result => this.regulativeGroups.push(result.regulativeGroup));
    }

    import$() {
        return this.uniModalService
            .open(RegulativeUploadModalComponent, {header: 'Regulativ import', data: new RegulativeGroup()})
            .onClose
            .pipe(
                map(result => <IRegulativeUploadResult>result),
                filter(result => result.confirmAction === ConfirmActions.ACCEPT),
            );
    }

    navigateTo(regulativeGroup: RegulativeGroup) {
        if (!regulativeGroup || !regulativeGroup.ID) {
            return;
        }
        this.router.navigate([`salary/regulative/${regulativeGroup.ID}`]);
    }

}
