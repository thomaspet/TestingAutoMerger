import { Component, ViewChild, OnInit } from '@angular/core';
import { UniModules, TabService } from '../../layout/navbar/tabstrip/tabService';
import { UniTickerWrapper } from '@app/components/uniticker/tickerWrapper/tickerWrapper';
import { Router } from '@angular/router';

@Component({
    selector: 'workprofiles',
    templateUrl: './workprofiles.html'
})
export class WorkprofileListview implements OnInit {

    @ViewChild(UniTickerWrapper, { static: true }) private tickerWrapper: UniTickerWrapper;

    public tickercode: string = 'workprofile_list';

    public toolbarActions = [{
        label: 'Ny stillingsmal',
        action: this.newWorkProfile.bind(this),
        main: true,
        disabled: false
    }];

    constructor(private router: Router, private tabService: TabService) {}

    public ngOnInit(): void {
        this.tabService.addTab({
            url: '/timetracking/workprofiles',
            name: 'Stillingsmaler',
            active: true,
            moduleID: UniModules.WorkProfiles
        });
    }

    private newWorkProfile() {
        this.router.navigateByUrl('/timetracking/workprofiles/' + 0);
    }
}
