import {Component, OnInit} from '@angular/core';
import { IUniTab } from '@uni-framework/uni-tabs';
import { IUniSaveAction } from '@uni-framework/save/save';
import { IToolbarConfig } from '@app/components/common/toolbar/toolbar';
import { UniTableConfig, UniTableColumn, UniTableColumnType } from '@uni-framework/ui/unitable';
import { RegulativeGroup, Regulative, RegulativeStep, LocalDate } from '@uni-entities';
import { UniModalService, ConfirmActions } from '@uni-framework/uni-modal';
import {
    RegulativeUploadModalComponent, IRegulativeUploadResult
} from '../modals/regulative-upload-modal/regulative-upload-modal.component';
import { tap, filter, map, finalize } from 'rxjs/operators';
import { RegulativeGroupService, RegulativeService, PageStateService } from '@app/services/services';
import { forkJoin } from 'rxjs';
import { TabService, UniModules } from '@app/components/layout/navbar/tabstrip/tabService';
import { saveAs } from 'file-saver';

@Component({
    selector: 'regulative',
    templateUrl: './regulative.html',
})

export class RegulativeComponent implements OnInit {

    tabs: IUniTab[] = [];

    saveActions: IUniSaveAction[] = [
        {
            label: 'Opprett regulativ',
            action: this.newRegulation.bind(this),
            main: true,
            disabled: false
        },
        {
            label: 'Eksporter til excel',
            action: this.exportToExcel.bind(this),
            main: false,
            disabled: false
        },
        {
            label: 'Importer fra excel',
            action: this.importFromExcel.bind(this),
            main: false,
            disabled: false
        },
        {
            label: 'Importer standard regulativ',
            action: this.importStandardRegulatives.bind(this),
            main: false,
            disabled: false
        }
    ];

    busy: boolean = false;

    regulativeGroups: RegulativeGroup[] = [];

    tableConfig: UniTableConfig;

    toolbarConfig: IToolbarConfig = {
        title: 'Nytt regulativ',
    };

    regulativeSteps: any[] = [];

    activeIndex: number = 0;

    busy: boolean;

    constructor(
        private uniModalService: UniModalService,
        private regulativeGroupService: RegulativeGroupService,
        private regulativeService: RegulativeService,
        private tabService: TabService,
        private pageStateService: PageStateService,
    ) {

    }

    ngOnInit(): void {
        this.tabService.addTab({
            name: 'Regulativ',
            url: this.pageStateService.getUrl(),
            moduleID: UniModules.Regulative,
            active: true
        });
        this.busy = true;
        forkJoin(
            this.regulativeGroupService.GetAll(''),
            this.regulativeService.GetAll('orderby=StartDate desc,CreatedAt desc', ['Steps']),
        )
            .pipe(
                tap((result: [RegulativeGroup[], Regulative[]]) => {
                    const [groups, regulatives] = result;

                    groups.forEach(regulativeGroup => {
                        regulativeGroup.Regulatives = [];
                        regulatives
                            .filter(regulative => regulative.RegulativeGroupID === regulativeGroup.ID)
                            .forEach(regulative => {
                                if (regulativeGroup.Regulatives.find(reg => reg.StartDate === regulative.StartDate)) {
                                    return;
                                }
                                regulativeGroup.Regulatives.push(regulative);
                            });
                    });
                    if (groups.length) {
                        this.regulativeGroups = groups;
                    }
                    // get existing regulative or make new regulative
                    this.tabs = this.getTabs(this.regulativeGroups);

                    this.toolbarConfig.title = this.tabs[this.activeIndex] && this.tabs[this.activeIndex].name;
                    if (this.regulativeGroups.length
                        && this.regulativeGroups[this.activeIndex].Regulatives[0]
                        && this.regulativeGroups[this.activeIndex].Regulatives[0].Steps) {
                        this.regulativeSteps = this.setRegulativeSteps(this.regulativeGroups[this.activeIndex].Regulatives);
                    }

                }),
                finalize(() => this.busy = false),
            )
            .subscribe(() => this.createConfig());
    }

    getTabs(regulativeGroups: RegulativeGroup[]): IUniTab[] {
        return regulativeGroups.length
            ? regulativeGroups.map((regulativeGroup: RegulativeGroup) => {
                return {name: `${regulativeGroup.ID} - ${regulativeGroup.Name}`};
            })
            : [{name: 'Nytt regulativ'}];
    }

    refresh(regulativeGroup?: RegulativeGroup) {
        if (regulativeGroup) {
            this.regulativeGroups[this.activeIndex] = regulativeGroup;
        }
        this.regulativeSteps = this.setRegulativeSteps(this.regulativeGroups[this.activeIndex].Regulatives);
        this.tabs = this.getTabs(this.regulativeGroups);
        this.tabChange();
    }

    newRegulation(done: (message: string) => void) {
        this.tabs = [...this.tabs, {name: this.tabs.length + 1 + ' - Nytt regulativ'}];
        this.activeIndex = this.tabs.length - 1;
        this.toolbarConfig.title = this.tabs[this.activeIndex].name;
        this.regulativeSteps = [];
        this.createConfig();
        return done('');
    }

    exportToExcel(done: (message: string) => void) {
        // backend action to export
        const regulativeGroup = this.regulativeGroups[this.activeIndex];
        const regulatives = regulativeGroup && regulativeGroup.Regulatives || [];
        if (regulatives.length) {
            const exportRegulative = regulatives[0];
            const startDate = new LocalDate(exportRegulative.StartDate.toString());
            const dateString = `${startDate.day}-${startDate.month}-${startDate.year}`;
            this.regulativeService
                .export(exportRegulative)
                .pipe(
                    tap(blob => saveAs(blob, `${regulativeGroup.Name || 'Regulativ'}_${dateString}.xlsx`)),
                )
                .subscribe(() => done('Eksport fullført'));
        } else {
            done('Eksport fullført');
        }

    }

    importFromExcel(done: (message: string) => void) {
        this.import(this.regulativeGroups[this.activeIndex] || new RegulativeGroup(), done);
    }

    importNewFromExcel() {
        this.import(new RegulativeGroup());
    }

    import(regulativeGroup: RegulativeGroup, done?: (message: string) => void) {
        this.uniModalService
            .open(RegulativeUploadModalComponent, {header: 'Regulativ import', data: regulativeGroup})
            .onClose
            .pipe(
                map(result => <IRegulativeUploadResult>result),
                tap(result => {
                    if (result.confirmAction !== ConfirmActions.ACCEPT && done) {
                        done('Import avbrutt');
                    }
                }),
                filter(result => result.confirmAction === ConfirmActions.ACCEPT),
                tap(result => this.refresh(result.regulativeGroup))
            )
            .subscribe(() => done && done('Import fullført'));
    }

    importStandardRegulatives() {
        // use backend to setup the 2 std regulatives
    }

    private createConfig() {
        const stepCol = new UniTableColumn('Step', 'Lønnstrinn', UniTableColumnType.Number)
            .setWidth('5rem');

        this.tableConfig = new UniTableConfig('salary.regulative', false, false)
            .setColumns(
                [
                    stepCol,
                    ...this.stepAmountColomnFactory(this.regulativeGroups[this.activeIndex]
                        ? this.regulativeGroups[this.activeIndex].Regulatives
                        : [])
                ])
            .setAutoAddNewRow(false)
            .setEditable(false)
            .setColumnMenuVisible(false);
    }

    stepAmountColomnFactory(regulatives: Regulative[]): UniTableColumn[] {
        if (!regulatives || (regulatives && !regulatives.length)) {
            return [new UniTableColumn(`amount_0`, `${new Date().toLocaleDateString()}`, UniTableColumnType.Number)];
        }

        return regulatives.map((regulative: Regulative, i: number) => {
            return new UniTableColumn(
                `amount_${i}`,
                `${new Date(regulative.StartDate.toString()).toLocaleDateString()}`,
                UniTableColumnType.Number
            );
        });
    }

    setRegulativeSteps(regulatives: Regulative[]) {
        if (!regulatives || (regulatives && !regulatives.length)) {
            return [];
        }

        const regulativeSteps = [];

        regulatives
            .reduce((acc, curr) => [...acc, ...curr.Steps], [])
            .map((x: RegulativeStep) => x.Step)
            .sort((a, b) => a - b)
            .forEach((step: number) => {
                if (regulativeSteps.find(x => x.Step === step)) {
                    return;
                }
                regulativeSteps.push({Step: step});
            });

        regulatives.forEach((regulative: Regulative, idx: number) => {
            regulative.Steps.forEach((step: RegulativeStep) => {
                Object.assign(regulativeSteps.find(r => r.Step === step.Step), {[`amount_${idx}`]: step.Amount});
            });
        });

        return regulativeSteps;
    }

    tabChange() {
        this.toolbarConfig.title = this.tabs[this.activeIndex].name;

        if (this.regulativeGroups.length && this.regulativeGroups[this.activeIndex]) {
            this.regulativeSteps = this.setRegulativeSteps(this.regulativeGroups[this.activeIndex].Regulatives);
        } else {
            this.regulativeSteps = [];
        }
        this.createConfig();
    }
}
