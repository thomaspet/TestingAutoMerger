import {
    Component,
    Input,
    Output,
    EventEmitter,
    ChangeDetectionStrategy,
    OnInit
} from '@angular/core';
import {IModalOptions, IUniModal} from '../../uniModal/interfaces';
import {UniTableConfig} from '../unitable/config/unitableConfig';
import {UniTableColumn} from '../unitable/config/unitableColumn';

import * as _ from 'lodash';

@Component({
    selector: 'column-menu-modal',
    template: `
        <section role="dialog" class="uni-modal" [ngClass]="{'advanced': tableConfig?.advancedColumnMenu}">
            <header>
                <h1>{{'Kolonneoppsett'}}</h1>
            </header>
            <article>
                <p>Her kan du bestemme synlighet, tittel, rekkefølge og posisjon på kolonnene.</p>
                <p>"Hopp til kolonne" definere hvilken kolonne man skal gå til ved tab/enter klikk.</p>
                <p>For å endre posisjon på en kolonne drar du <span class="move-icon"></span> ikonet opp eller ned.</p>
                <table>
                    <thead>
                        <tr>
                            <th class="visibility-col">Synlig</th>
                            <th class="title-col">Tittel</th>
                            <th class="jump-col">Hopp til kolonne</th>
                            <ng-container *ngIf="tableConfig?.advancedColumnMenu">
                                <th>Felt eller spørring</th>
                                <th>Summeringsfunksjon</th>
                                <th>Alias</th>
                            </ng-container>
                            <th><!-- columnMenu toggle icon --></th>
                        </tr>
                    </thead>

                    <tbody>
                        <tr *ngFor="let column of columns; let idx = index"
                            draggable="true"
                            (dragstart)="onDragStart($event, idx)"
                            (dragover)="onDragOver($event)"
                            (dragleave)="onDragLeave($event)"
                            (drop)="onDrop($event, idx)"
                            (dragend)="onDragEnd($event)">

                            <td>
                                <input type="checkbox"
                                    [checked]="column.visible"
                                    (change)="visibilityChanged(idx, column)"
                                />
                                <label class="checkbox-label" (click)="visibilityChanged(idx, column)">Synlig</label>
                            </td>

                            <td>
                                <input type="text"
                                    [value]="column.header"
                                    (change)="inputChange($event, 'header', column, idx)"
                                    placeholder="Kolonnetittel"
                                />
                            </td>

                            <td>
                                <select [value]="column.jumpToColumn || ''"
                                        (change)="inputChange($event, 'jumpToColumn', column, idx)">
                                    <option value=""></option>
                                    <option *ngFor="let col of columns"
                                            value="{{col.field}}">
                                        {{col.header}}
                                    </option>
                                </select>
                            </td>

                            <ng-container *ngIf="tableConfig?.advancedColumnMenu">
                                <td>
                                    <input type="text"
                                        [value]="column.field"
                                        (change)="inputChange($event, 'field', column, idx)"
                                        placeholder="Feltnavn eller formel"
                                    />
                                </td>

                                <td>
                                    <select [value]="column.sumFunction || ''"
                                            (change)="inputChange($event, 'sumFunction', column, idx)">
                                        <option value=""></option>
                                        <option value="sum">Sum</option>
                                        <option value="avg">Gjennomsnitt</option>
                                        <option value="min">Laveste</option>
                                        <option value="max">Høyeste</option>
                                    </select>
                                </td>

                                <td>
                                    <input type="text"
                                        [value]="column.alias || ''"
                                        (change)="inputChange($event, 'alias', column, idx)"
                                    />
                                </td>
                            </ng-container>

                            <td class="move-icon"></td>
                        </tr>
                    </tbody>
                </table>
            </article>

            <footer>
                <button class="good" (click)="close(true)">Lagre</button>
                <button class="bad" (click)="resetAll()">Nullstill</button>
                <button class="cancel" (click)="close(false)">Avbryt</button>
            </footer>
        </section>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ColumnMenuNew implements IUniModal, OnInit {
    @Input()
    public options: IModalOptions = {};

    @Output()
    public onClose: EventEmitter<any> = new EventEmitter();

    private columns: UniTableColumn[];
    private tableConfig: UniTableConfig;

    // Drag and drop
    private dragElement: any;
    private dragElementIndex: any;

    public ngOnInit() {
        // cloneDeep to avoid overwriting config when changing stuff (object references)
        this.columns = _.cloneDeep(this.options.data.columns);
        this.tableConfig = this.options.data.tableConfig;
    }

    public resetAll() {
        this.onClose.emit({ resetAll: true });
    }

    public close(emitValue?: boolean) {
        if (emitValue) {
            this.onClose.emit({ columns: this.columns });
        } else {
            this.onClose.emit();
        }
    }

    public visibilityChanged(index, column) {
        this.columns[index].visible = !this.columns[index].visible;
    }

    public inputChange(event, property, column: UniTableColumn, index) {
        if (property === 'field' && !column['_originalField']) {
            column['originalField'] = column.field;
        }

        this.columns[index] = _.set(column, property, event.target.value || '');
    }

    // Drag & Drop
    public onDragStart(event, elementIndex: number) {
        this.dragElement = event.target;
        this.dragElementIndex = elementIndex;

        event.dataTransfer.setData('text/html', event.target.outerHTML);
        event.dataTransfer.effectAllowed = 'move';
        event.target.classList.add('dragElement');
    }

    public onDragOver(event) {
        let row = event.target;
        if (row.tagName !== 'TR') {
            row = row.closest('TR');
        }

        if (row.parentNode === this.dragElement.parentNode) {
            event.preventDefault();
            event.stopPropagation();
            row.classList.add('dragIndicator');
            event.dataTransfer.dropEffect = 'move';
        }
    }

    public onDragLeave(event) {
        let row = event.target;
        if (row.tagName !== 'TR') {
            row = row.closest('TR');
        }

        row.classList.remove('dragIndicator');
    }

    public onDrop(event, dropIndex: number) {
        let row = event.target;
        if (row.tagName !== 'TR') {
            row = row.closest('TR');
        }

        row.classList.remove('dragIndicator');

        // Make sure we're not dropping outside our list,
        // or inside the label/checkbox
        if (row.parentNode === this.dragElement.parentNode) {
            const columns = this.columns;
            columns.splice(dropIndex, 0, columns.splice(this.dragElementIndex, 1)[0]);

            this.columns = columns;
        }
    }

    public onDragEnd(event) {
        this.dragElement.classList.remove('dragElement');
        this.dragElement = undefined;
        this.dragElementIndex = undefined;
    }
}
