import {Component, Input, Output, EventEmitter} from '@angular/core';
import {UniTableConfig} from '../config/unitableConfig';
import * as Immutable from 'immutable';

@Component({
    selector: 'unitable-column-menu',
    template: `
        <button class="column-menu-toggle" tabindex="-1" (click)="toggleMenu($event)">Column menu</button>
        <ul class="column-menu-dropdown" *ngIf="open">
            <li *ngFor="let column of columns; let idx = index">
                <label>
                    <input type="checkbox" [checked]="column.get('visible')"
                                           (change)="onChange(idx, column)">
                    {{column.get('header')}}
                    <button *ngIf="config.allowConfigChanges" (click)="setEditorVisible(idx)" class="show-column-editor-button">*</button>
                </label>

                <unitable-column-config-editor *ngIf="idx === showEditorIndex" [columnConfig]="column" (onChange)="changeConfig(idx, $event)"></unitable-column-config-editor>
            </li>
            <li>
                <button class="warning" (click)="resetVisibility()">Reset</button>
            </li>
        </ul>
    `,
    host: {
        '(click)': 'onClick($event)',
        '(document:click)': 'offClick()'
    }
})
export class UniTableColumnMenu {
    private open: boolean = false;

    @Input()
    private config: UniTableConfig;

    @Input()
    private columns: Immutable.List<any>;

    @Output()
    private toggleVisibility: EventEmitter<any> = new EventEmitter();
    @Output()
    private configChange: EventEmitter<any> = new EventEmitter();

    @Output()
    private resetAll: EventEmitter<any> = new EventEmitter();

    private showEditorIndex = null;

    private resetVisibility() {
        this.resetAll.emit({});
    }

    private onChange(index, column) {
        this.toggleVisibility.emit({index: index, column: column});
    }

    private changeConfig(index, column) {
        this.configChange.emit({index: index, column: column});
        this.showEditorIndex = -1;
    }

    private toggleMenu($event) {
        $event.stopPropagation();
        this.open = !this.open;
    }

    private onClick($event) {
        $event.stopPropagation();
    }

    private offClick() {
        this.open = false;
    }

    private setEditorVisible(idx) {
        // if the same item is clicked twice, hide the editor
        if (this.showEditorIndex === idx) {
            this.showEditorIndex = -1;
        } else {
            this.showEditorIndex = idx;
        }
    }
}
