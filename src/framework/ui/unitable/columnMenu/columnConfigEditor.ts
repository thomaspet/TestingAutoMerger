import {Component, Input, Output, EventEmitter, OnChanges} from '@angular/core';
import {UniTableColumn} from '../config/unitableColumn';
import * as Immutable from 'immutable';

@Component({
    selector: 'unitable-column-config-editor',
    template: `
        <section class="unitable-column-config-editor"
                 *ngIf="model"
                 (keydown)="onKeydown($event)">
            <label title="Overskrift for kolonnen">
                <span>Overskrift:</span>
                <input type="text" [(ngModel)]="model.header" />
            </label>
            <label title="Eventuelt angi bredden på kolonnen i prosent, f.eks. 10">
                <span>Bredde:</span>
                <input type="text" [(ngModel)]="model.width" />
            </label>
            <label title="Felt eller spørring som skal hentes/vises">
                <span>Felt/formel:</span>
                <input type="text" [(ngModel)]="model.field" />
            </label>
            <label>
            <span title="Eventuelt en summeringsfunksjon for feltet/formelen over">Summeringsfunksjon:</span>
                <select [(ngModel)]="model.sumFunction">
                    <option value=""></option>
                    <option value="sum">Sum</option>
                    <option value="avg">Gjennomsnitt</option>
                    <option value="min">Laveste</option>
                    <option value="max">Høyeste</option>
                </select>
            </label>
            <label title="Eventuelt et alias som brukes i spørringen">
                <span>Feltalias:</span>
                <input type="text" [(ngModel)]="model.alias" />
            </label>
            <button (click)="updateConfig()">Oppdater</button>
        </section>
    `
})
export class UniTableColumnConfigEditor implements OnChanges {
    @Input()
    private columnConfig: Immutable.Map<any, any>;

    @Output()
    public onChange: EventEmitter<any> = new EventEmitter();

    public model: UniTableColumn;

    public ngOnChanges() {
        if (this.columnConfig) {
            this.model = this.columnConfig.toJS();
        }
    }

    public onKeydown(event: KeyboardEvent) {
        const key = event.which || event.keyCode;
        if (key === 9 || key === 13 || key === 37 || key === 39 || key === 35 || key === 36) {
            event.stopPropagation();
        }
    }

    private updateConfig() {
        let updatedConfig = Immutable.fromJS(this.model);

        this.onChange.emit(updatedConfig);
    }
}
