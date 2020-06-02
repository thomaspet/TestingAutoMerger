import { Component, OnInit, Output, EventEmitter, Input, SimpleChanges } from '@angular/core';
import { RegulativeGroup } from '@uni-entities';
import { UniTableConfig, UniTableColumn, UniTableColumnType } from '@uni-framework/ui/unitable';
import { tap, map, finalize, switchMap } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';
import { UniFieldLayout, FieldType } from '@uni-framework/ui/uniform';
import { IToolbarValidation } from '@app/components/common/toolbar/toolbar';
import { RegulativeDetailsLogicService, IRegulativeData } from '@app/components/salary/regulative/shared/service/regulative-details-logic.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'uni-regulative-details',
  templateUrl: './regulative-details.component.html',
  styleUrls: ['./regulative-details.component.sass']
})
export class RegulativeDetailsComponent implements OnInit {
    @Input() regulativeGroup: RegulativeGroup;
    @Output() public close: EventEmitter<boolean> = new EventEmitter<any>();
    lookupFunction: (urlParams: HttpParams) => any;
    exporting: boolean;
    validationMessages: IToolbarValidation[] = [];
    tableConfig: UniTableConfig;
    regulatives: IRegulativeData[];
    fields$: BehaviorSubject<UniFieldLayout[]> = new BehaviorSubject([]);
    model$: BehaviorSubject<{ID: number}> = new BehaviorSubject({ID: 0});
    config$: BehaviorSubject<any> = new BehaviorSubject({});

    constructor(
        private regulativeDetailsLogic: RegulativeDetailsLogicService,
        ) { }

    ngOnChanges() {
        this.regulativeDetailsLogic
            .getAllRegulatives(this.regulativeGroup.ID)
            .pipe(
                tap(regulatives => this.regulatives = regulatives),
                tap(regulatives => {
                    if (!regulatives || !regulatives.length) {
                        return;
                    }
                    this.setActive(regulatives.find(r => r.Active));
                })
            )
            .subscribe(regulatives => this.fields$.next(this.getFormFields(regulatives)));
    }

    ngOnInit() {
        this.buildTableConfig();
    }

    private setActive(active: IRegulativeData) {
        this.updateValidationMessage(active);
        this.setLookup(active);
        this.model$.next({ID: active.ID});
    }

    private updateValidationMessage(regulative: IRegulativeData) {
        this.validationMessages = [{
            label: regulative && regulative.Active ? 'Aktiv' : 'Avsluttet',
            type: regulative && regulative.Active ? 'good' : 'bad',
        }];
    }

    private buildTableConfig() {
        const stepColumn = new UniTableColumn('Step', 'Lønnstrinn', UniTableColumnType.Number);
        const salaryColumn = new UniTableColumn('Amount', 'Årslønn', UniTableColumnType.Money);

        this.tableConfig = new UniTableConfig('salary.regulative.details')
            .setColumns([stepColumn, salaryColumn])
            .setSearchable(true)
            .setPageSize(10)
            .setColumnMenuVisible(false)
            .setButtons([
                {
                    label: 'Export',
                    action: () => this.exportRegulative(),
                    class: 'secondary c2a',
                }
            ], true);
    }

    private getFormFields(regulatives: IRegulativeData[]): UniFieldLayout[] {
        return <UniFieldLayout[]>[
            <any>{
                Label: 'Historikk - Gyldig fra:',
                Property: 'ID',
                FieldType: FieldType.DROPDOWN,
                Options: {
                    source: regulatives,
                    valueProperty: 'ID',
                    template: (regulative: IRegulativeData) => regulative && regulative.DisplayDate,
                    searchable: false,
                    displayProperty: 'DisplayDate',
                    addEmptyValue: false,
                }
            }
        ];
    }

    formChange(changes: SimpleChanges) {
        const regulative = this.regulatives.find(r => r.ID === changes['ID'].currentValue);
        this.setLookup(regulative);
        this.updateValidationMessage(regulative);
    }

    private setLookup(regulative: IRegulativeData) {
        if (!regulative) {
            return;
        }
        this.lookupFunction = this.regulativeDetailsLogic
            .getLookup(regulative.ID);
    }

    closeRegulativeDetail(needImport = false) {
        this.close.emit(needImport);
    }

    exportRegulative() {
        this.exporting = true;
        this.model$
            .pipe(
                map(model => this.regulatives.find(r => r.ID === model.ID)),
                switchMap(regulative => this.regulativeDetailsLogic.exportRegulativeAndDownloadFile(regulative, this.regulativeGroup)),
                finalize(() => this.exporting = false),
            )
            .subscribe(() => this.exporting = false);
    }



}
