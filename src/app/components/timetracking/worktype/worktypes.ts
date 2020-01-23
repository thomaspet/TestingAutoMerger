import {Component, ViewChild, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { UniTickerWrapper } from '@app/components/uniticker/tickerWrapper/tickerWrapper';
import { TabService, UniModules } from '@app/components/layout/navbar/tabstrip/tabService';
import { ITickerColumnOverride } from '@app/services/services';
import { WorkTypeSystemTypePipe } from '@app/components/common/utils/pipes';

@Component({
    selector: 'worktypes',
    templateUrl: './worktypes.html'
})
export class WorktypeListview implements OnInit {

    @ViewChild(UniTickerWrapper, { static: true }) private tickerWrapper: UniTickerWrapper;
    private systemTypePipe: WorkTypeSystemTypePipe = new WorkTypeSystemTypePipe();

    public tickercode: string = 'worktype_list';
    public columnOverrides: Array<ITickerColumnOverride> = [
        {
            Field: 'SystemType',
            Template: (dataItem) => {
                return this.systemTypePipe.transform(dataItem.WorktypeSystemType, '');
            }
        }
    ];

    public toolbarActions = [{
        label: 'Ny timeart',
        action: this.newWorktype.bind(this),
        main: true,
        disabled: false
    }];

    constructor(private router: Router, private tabService: TabService) {}

    public ngOnInit(): void {
        this.tabService.addTab({
            url: '/timetracking/worktypes',
            name: 'Timearter',
            active: true,
            moduleID: UniModules.WorkTypes
        });
    }

    private newWorktype() {
        this.router.navigateByUrl('/timetracking/worktypes/' + 0);
    }
}
