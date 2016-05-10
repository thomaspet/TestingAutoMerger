import {Component} from '@angular/core';
import {TabService} from '../layout/navbar/tabstrip/tabService';

@Component({
  selector: 'uni-dashboard',
  templateUrl: 'app/components/dashboard/dashboard.html',
})
export class Dashboard {

    constructor(private tabService: TabService) {
        this.tabService.addTab({name: 'Dashboard', url: '/'});
    }
}
