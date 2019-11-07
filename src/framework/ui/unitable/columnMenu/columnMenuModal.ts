import {Component, Input, Output, EventEmitter, ChangeDetectionStrategy} from '@angular/core';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';
import {UniTableConfig} from '../config/unitableConfig';
import * as Immutable from 'immutable';

@Component({
    selector: 'column-menu-modal',
    template: `
        <section role="dialog" class="uni-modal" [ngClass]="{'advanced': tableConfig?.advancedColumnMenu}">
            <header>{{'Kolonneoppsett'}}</header>
            <article>
                <p>Her kan du bestemme synlighet, tittel, rekkefølge og posisjon på kolonnene.</p>
                <p>"Hopp til kolonne" definere hvilken kolonne man skal gå til ved tab/enter klikk.</p>
                <p>For å endre posisjon på en kolonne drar du <i class="material-icons move-icon">menu</i> ikonet opp eller ned.</p>
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
                                    [checked]="column.get('visible')"
                                    (change)="visibilityChanged(idx, column)"
                                />
                                <label class="checkbox-label" (click)="visibilityChanged(idx, column)">Synlig</label>
                            </td>

                            <td>
                                <input type="text"
                                    [value]="column.get('header')"
                                    (change)="inputChange($event, 'header', column, idx)"
                                    placeholder="Kolonnetittel"
                                />
                            </td>

                            <td>
                                <select [value]="column.get('jumpToColumn') || ''"
                                        (change)="inputChange($event, 'jumpToColumn', column, idx)">
                                    <option value=""></option>
                                    <option *ngFor="let col of columns"
                                            value="{{col.get('field')}}">
                                        {{col.get('header')}}
                                    </option>
                                </select>
                            </td>

                            <ng-container *ngIf="tableConfig?.advancedColumnMenu">
                                <td>
                                    <input type="text"
                                        [value]="column.get('field')"
                                        (change)="inputChange($event, 'field', column, idx)"
                                        placeholder="Feltnavn eller formel"
                                    />
                                </td>

                                <td>
                                    <select [value]="column.get('sumFunction') || ''"
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
                                        [value]="column.get('alias') || ''"
                                        (change)="inputChange($event, 'alias', column, idx)"
                                    />
                                </td>
                            </ng-container>

                            <td>
                                <i class="material-icons move-icon">menu</i>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </article>

            <footer>
                <button class="secondary pull-left" (click)="close(false)">Avbryt</button>
                <button class="bad" (click)="resetAll()">Nullstill</button>
                <button class="good" (click)="close(true)">Lagre</button>
            </footer>
        </section>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ColumnMenuModal implements IUniModal {
    @Input()
    public options: IModalOptions = {};

    @Output()
    public onClose: EventEmitter<any> = new EventEmitter();

    public columns: Immutable.List<any>;
    public tableConfig: UniTableConfig;

    // Drag and drop
    private dragElement: any;
    private dragElementIndex: any;

    public ngOnInit() {
        this.columns = this.options.data.columns;
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
        this.columns = this.columns.update(index, () => {
            return column.set('visible', !column.get('visible'));
        });
    }

    public inputChange(event, property, column, index) {
        this.columns = this.columns.update(index, () => {
            if (property === 'field' && !column.get('_originalField')) {
                column = column.set('_originalField', column.get('field'));
            }

            return column.set(property, event.target.value || '');
        });
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
            let columns = this.columns;
            let dragElement = columns.get(this.dragElementIndex);

            columns = columns.delete(this.dragElementIndex);
            columns = columns.insert(dropIndex, dragElement);
            this.columns = columns;
        }
    }

    public onDragEnd(event) {
        this.dragElement.classList.remove('dragElement');
        this.dragElement = undefined;
        this.dragElementIndex = undefined;
    }
}
