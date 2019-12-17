import {Component} from '@angular/core';
import { IUniTab } from '@uni-framework/uni-tabs';
import { IUniSaveAction } from '@uni-framework/save/save';
import { IToolbarConfig } from '@app/components/common/toolbar/toolbar';
import { UniTableConfig, UniTableColumn, UniTableColumnType } from '@uni-framework/ui/unitable';
import { RegulativeGroup, Regulative, RegulativeStep, LocalDate } from '@uni-entities';
import { TabService, UniModules } from '@app/components/layout/navbar/tabstrip/tabService';
import { PageStateService } from '@app/services/services';

@Component({
    selector: 'regulative',
    templateUrl: './regulative.html',
})

export class RegulativeComponent {
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

    regulativeGroups: RegulativeGroup[] = [];

    tableConfig: UniTableConfig;

    toolbarConfig: IToolbarConfig = {
        title: 'Nytt regulativ',
    };

    regulativeSteps: any[] = [];

    activeIndex: number = 0;

    constructor(
        tabService: TabService,
        pageStateService: PageStateService,
    ) {
        tabService.addTab({
            name: 'Regulativ',
            url: pageStateService.getUrl(),
            moduleID: UniModules.Regulative,
            active: true
        });

        // get existing regulative or make new regulative
        this.tabs = this.regulativeGroups.length 
            ? this.regulativeGroups.map((regulativeGroup: RegulativeGroup) => { 
                return {name: `${regulativeGroup.ID} - ${regulativeGroup.Name}`};
            }) 
            : [{name: 'Nytt regulativ'}];

        this.toolbarConfig.title = this.tabs[this.activeIndex].name;


        if (this.regulativeGroups.length && this.regulativeGroups[this.activeIndex].Regulatives[0] && this.regulativeGroups[this.activeIndex].Regulatives[0].Steps) {
            this.regulativeGroups = this.sortRegulativeByDate(this.regulativeGroups);
            this.regulativeSteps = this.setRegulativeSteps(this.regulativeGroups[this.activeIndex].Regulatives);
        }

        this.createConfig();
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
        return done('Eksport fullført');
    }

    importFromExcel(done: (message: string) => void) {
        // backend action to import
        return done('Import fullført');
    }

    importNewFromExcel() {
        // backend action to import
        return;
    }

    importStandardRegulatives() {
        // use backend to setup the 2 std regulatives
    }

    private createConfig() {
        const stepCol = new UniTableColumn('Step', 'Lønnstrinn', UniTableColumnType.Number)
            .setWidth('5rem');

        this.tableConfig = new UniTableConfig('salary.regulative')
            .setColumns([stepCol, ...this.stepAmountColomnFactory(this.regulativeGroups[this.activeIndex] ? this.regulativeGroups[this.activeIndex].Regulatives : [])])
            .setAutoAddNewRow(false)
            .setEditable(false)
            .setColumnMenuVisible(false);
    }

    stepAmountColomnFactory(regulatives: Regulative[]): UniTableColumn[] {
        if (!regulatives || (regulatives && !regulatives.length)) return [new UniTableColumn(`amount_0`, `${new Date().toLocaleDateString()}`, UniTableColumnType.Number)];

        return regulatives.map((regulative: Regulative, i: number) => {
            return new UniTableColumn(`amount_${i}`, `${regulative.StartDate.toDate().toLocaleDateString()}`, UniTableColumnType.Number)
        });
    }

    setRegulativeSteps(regulatives: Regulative[]) {
        if (!regulatives || (regulatives && !regulatives.length)) return [];

        const regulativeSteps = [];

        regulatives.reduce((acc, curr) => [...acc, ...curr.Steps], []).map((x: RegulativeStep) => x.Step).sort((a, b) => a - b).forEach((step: number) => {
            if (regulativeSteps.find(x => x.Step === step))
                return;
            regulativeSteps.push({Step: step});
        });

        regulatives.forEach((regulative: Regulative, idx: number) => {
            regulative.Steps.forEach((step: RegulativeStep) => {
                Object.assign(regulativeSteps.find(r => r.Step === step.Step), {[`amount_${idx}`]: step.Amount});
            })
        });

        return regulativeSteps;
    }


    sortRegulativeByDate(regulativeGroups: RegulativeGroup[]): RegulativeGroup[] {
        return regulativeGroups.map(regulativeGroup => {
            regulativeGroup.Regulatives
                .sort((a: any, b: any) => {
                    a = a.StartDate.toDate();
                    b = b.StartDate.toDate();
                    return a > b 
                        ? -1 : a < b 
                            ? 1 : 0;
                });
            return regulativeGroup;
        });
    }

    tabChange() {
        this.toolbarConfig.title = this.tabs[this.activeIndex].name;

        if (this.regulativeGroups.length && this.regulativeGroups[this.activeIndex]) {
            this.regulativeSteps = this.setRegulativeSteps(this.regulativeGroups[this.activeIndex].Regulatives);
        } else {
            this.regulativeSteps = [];
        }
        this.createConfig()
    }
}
