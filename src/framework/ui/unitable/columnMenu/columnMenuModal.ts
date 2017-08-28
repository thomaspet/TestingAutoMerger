import {Component, Input, Output, EventEmitter, ChangeDetectionStrategy} from '@angular/core';
import {IModalOptions, IUniModal} from '../../../uniModal/modalService';
import * as Immutable from 'immutable';

@Component({
    selector: 'column-menu-modal',
    template: `
        <dialog class="uni-modal">
            <header>
                <h1>{{'Kolonneoppsett'}}</h1>
            </header>
            <main>
                <p>Her kan du bestemme synlighet, tittel, rekkefølge og posisjon på kolonnene.</p>
                <p>"Hopp til kolonne" definere hvilken kolonne man skal gå til ved tab/enter klikk.</p>
                <p>For å endre posisjon på en kolonne drar du <span class="move-icon"></span> ikonet opp eller ned.</p>
                <table>
                    <thead>
                        <tr>
                            <th class="visibility-col">Synlig</th>
                            <th class="title-col">Tittel</th>
                            <th class="jump-col">Hopp til kolonne</th>
                            <th></th>
                        </tr>
                    </thead>

                    <tbody>
                        <tr *ngFor="let column of columns; let idx = index"
                            draggable="true"
                            (dragstart)="onDragStart($event, idx)"
                            (dragover)="onDragEnter($event)"
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
                                    (change)="columnHeaderChange($event, column, idx)"
                                    placeholder="Kolonnetittel"
                                />
                            </td>

                            <td>
                                <select [value]="column.get('jumpToColumn') || ''" (change)="jumpToColumnChange($event, column, idx)">
                                    <option value=""></option>
                                    <option *ngFor="let col of columns"
                                            value="{{col.get('field')}}">
                                        {{col.get('header')}}
                                    </option>
                                </select>
                            </td>

                            <td class="move-icon"></td>
                        </tr>
                    </tbody>
                </table>
            </main>

            <footer>
                <button class="good" (click)="close(true)">Lagre</button>
                <button class="bad" (click)="resetAll()">Nullstill</button>
                <button class="cancel" (click)="close(false)">Avbryt</button>
            </footer>
        </dialog>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ColumnMenuModal implements IUniModal {
    @Input()
    public options: IModalOptions = {};

    @Output()
    public onClose: EventEmitter<any> = new EventEmitter();

    private columns: Immutable.List<any>;

    // Drag and drop
    private dragElement: any;
    private dragElementIndex: any;

    public ngOnInit() {
        this.columns = this.options.data;
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

    public columnHeaderChange(event, column, index) {
        this.columns = this.columns.update(index, () => {
            return column.set('header', event.target.value || '');
        });
    }

    public jumpToColumnChange(event, column, index) {
        this.columns = this.columns.update(index, () => {
            return column.set('jumpToColumn', event.target.value || '');
        });
    }

    // Drag & Drop
    public onDragStart(event, elementIndex: number) {
        this.dragElement = event.target;
        this.dragElementIndex = elementIndex;

        event.dataTransfer.effectAllowed = 'move';
        event.target.classList.add('dragElement');
    }

    public onDragEnter(event) {
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
