import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RegulativeGroup, Regulative, LocalDate } from '@uni-entities';
import {
    Ticker,
    UniTickerService,
    ITickerActionOverride,
    RegulativeService,
    RegulativeGroupService,
    PageStateService
} from '@app/services/services';
import { map, switchMap, tap, filter } from 'rxjs/operators';
import { saveAs } from 'file-saver';
import { IToolbarConfig } from '@app/components/common/toolbar/toolbar';
import { UniModules, TabService } from '@app/components/layout/navbar/tabstrip/tabService';
import {
    RegulativeUploadModalComponent,
    IRegulativeUploadResult
} from '@app/components/salary/modals/regulative-upload-modal/regulative-upload-modal.component';
import { ConfirmActions, UniModalService } from '@uni-framework/uni-modal';
import { IUniSaveAction } from '@uni-framework/save/save';

@Component({
  selector: 'uni-regulative-group',
  templateUrl: './regulative-group.component.html',
  styleUrls: ['./regulative-group.component.sass']
})
export class RegulativeGroupComponent implements OnInit {
    ticker: Ticker;
    actionOverrides: ITickerActionOverride[] = [
        {
            Code: 'export_regulative',
            ExecuteActionHandler: (selectedRows) => this.export(selectedRows[0])
        },
    ];
    toolbarConfig: IToolbarConfig = {
        title: 'Regulativ',
    };
    saveActions: IUniSaveAction[] = this.getSaveActions();

    constructor(
        private activeRoute: ActivatedRoute,
        private tickerService: UniTickerService,
        private regulativeService: RegulativeService,
        private regulativeGroupService: RegulativeGroupService,
        private tabService: TabService,
        private pageStateService: PageStateService,
        private uniModalService: UniModalService,
    ) { }

    ngOnInit() {
        this.activeRoute
            .params
            .pipe(
                map(params => params['id'] || 0),
                tap(id => this.updateTabAndToolbar(id)),
                switchMap(id => this.getTicker(id)),
            )
            .subscribe(ticker => this.ticker = ticker);
    }

    getSaveActions(group?: RegulativeGroup): IUniSaveAction[] {
        return [
            {
                label: 'Oppdater regulativ',
                action: (done) => this.import(group, done),
                main: false,
                disabled: !group,
            }
        ];
    }

    updateTabAndToolbar(id: number) {
        this.regulativeGroupService
            .Get(id)
            .pipe(
                tap(group => this.saveActions = this.getSaveActions(group)),
                tap(group => this.updateTab(group)),
            )
            .subscribe((group: RegulativeGroup) => this.toolbarConfig.title = group.Name);
    }

    updateTab(group: RegulativeGroup) {
        this.tabService.addTab({
            name: group.Name,
            url: this.pageStateService.getUrl(),
            moduleID: UniModules.Regulative,
            active: true
        });
    }

    getTicker(regulativeGroupID: number) {
        return this.tickerService
            .getTicker('regulative_list')
            .pipe(
                map(ticker => {
                    ticker.Filter = `RegulativeGroupID eq ${regulativeGroupID}`;
                    return ticker;
                })
            );
    }

    refreshTicker() {
        this.ticker = {...this.ticker};
    }

    export(regulative: Regulative): Promise<Blob> {
        if (!regulative) {
            return;
        }
        const startDate = new LocalDate(regulative.StartDate.toString());
        const dateString = `${startDate.day}-${startDate.month}-${startDate.year}`;
        return this.regulativeService
            .export(regulative)
            .pipe(
                tap(blob => saveAs(blob, `${regulative['Name'] || 'Regulativ'}_${dateString}.xlsx`))
            )
            .toPromise();
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
                tap(() => this.refreshTicker())
            )
            .subscribe(() => done && done('Import fullført'));
    }

}
