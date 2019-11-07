import {Component, Input} from '@angular/core';
//Can not use UniTabs due to circular reference
export interface IBarnepassTab {
    name: string;
    count?: number;
    onClick?: () => void;
}

@Component({
    selector: 'uni-barnepass-tabs',
    template: `
        <mat-tab-group
            (selectedIndexChange)="onTabActivated($event)">

            <mat-tab *ngFor="let tab of tabs">
                <ng-template mat-tab-label>
                    {{tab['name']}}&nbsp;<strong>{{tab['count']}}</strong>
                </ng-template>
            </mat-tab>
        </mat-tab-group>
    `
})
export class BarnepassTabs {
    @Input() public tabs: IBarnepassTab[];

    public onTabActivated(index: number) {
        const tab = this.tabs[index];

        if (!tab) {
            return;
        }

        if (tab.onClick) {
            setTimeout(() => tab.onClick());
        }
    }
}
