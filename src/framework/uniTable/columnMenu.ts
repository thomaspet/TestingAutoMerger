import {Component, AfterViewInit, Input, Output, EventEmitter} from '@angular/core';

interface IColumnVisibility {
    field: string;
    title: string;
    visible: boolean;
}

@Component({
    selector: 'uni-table-column-menu',
    template: `
        <button class="column-menu-toggle" (click)="toggleMenu($event)">Column menu</button>
        <ul class="column-menu-dropdown" *ngIf="open">
            <li *ngFor="#column of columnVisibility; #idx = index">
                <label>
                    <input type="checkbox"
                           [checked]="column.visible"
                           (change)="visibilityChanged(column)">
                    {{column.title}}
                </label>
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
export class UniTableColumnMenu implements AfterViewInit {
    private open: boolean;
    private userPreferences: any = {};
    private columnVisibility: IColumnVisibility[] = [];
    
    @Input()
    private columns: any[];
    
    @Input()
    private tableName: string;
    
    @Output()
    private columnVisibilityChange = new EventEmitter();    
    
    public ngAfterViewInit() {                        
        this.userPreferences = JSON.parse(localStorage.getItem('uniTableVisibility')) || {};
                
        if (this.userPreferences[this.tableName]) {
            this.columnVisibility = this.userPreferences[this.tableName];
            this.emitAll();
        } else {
            this.columnVisibility = this.getDefaultVisibility();
        }
    }
    
    private visibilityChanged(column) {
        column.visible = !column.visible;
        this.columnVisibilityChange.emit({field: column.field, visible: column.visible});        
        
        if (this.tableName.length) {
            this.userPreferences[this.tableName] = this.columnVisibility;
            localStorage.setItem('uniTableVisibility', JSON.stringify(this.userPreferences));
        }
    }
    
    private emitAll() {
        this.columnVisibility.forEach((col) => {
            this.columnVisibilityChange.emit({field: col.field, visible: col.visible});
        });
    }
    
    private resetVisibility() {
        delete this.userPreferences[this.tableName];
        localStorage.setItem('uniTableVisibility', JSON.stringify(this.userPreferences));
        
        this.columnVisibility = this.getDefaultVisibility();
        this.emitAll();
    }
    
    private getDefaultVisibility(): IColumnVisibility[] {
        var visibility = [];
        this.columns.forEach((col) => {
            visibility.push({
                field: col.field,
                title: col.title,
                visible: !col.hidden
            });
        });
        
        return visibility;
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
    
}
