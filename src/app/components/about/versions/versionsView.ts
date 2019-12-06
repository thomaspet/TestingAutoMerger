import {Component, ChangeDetectorRef} from '@angular/core';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {IToolbarConfig} from '../../common/toolbar/toolbar';
import * as moment from 'moment';
import {UniHttp} from '../../../../framework/core/http/http';
import {ErrorService} from '../../../services/common/errorService';
import {APP_METADATA} from 'src/environments/metadata';

const VERSION_DATE_FORMAT = 'DD.MM.YYYY HH:mm';

@Component({
    selector: 'uni-versions-view',
    templateUrl: './versionsView.html'
})
export class UniVersionsView {
    public frontend: any = {
        fullVersion: APP_METADATA.APP_VERSION,
        minVersion: APP_METADATA.APP_VERSION.substr(0, 6),
        buildDate: moment(APP_METADATA.APP_BUILD_DATE).format(VERSION_DATE_FORMAT),
    };

    public backend: {
        fullVersion: string
        minVersion: string
        buildDate: string
    };

    myDate;

    public toolbarConfig: IToolbarConfig = {title: 'Versjoner'};

    constructor(
        private tabService: TabService,
        private http: UniHttp,
        private errorService: ErrorService,
        private ref: ChangeDetectorRef
    ) {
        this.tabService.addTab({
            name: 'Versjoner',
            url: '/about/versions',
            moduleID: UniModules.Versions,
            active: true
        });
        this.http
            .usingRootDomain()
            .asGET()
            .withEndPoint('status/version')
            .send({})
            .map(result => result.body)
            .map(res => ({
                fullVersion: res.Version,
                minVersion: res.Version.substr(0, 6),
                buildDate: moment(res.Date).format(VERSION_DATE_FORMAT)
            }))
            .subscribe(
                backendVersions => this.backend = backendVersions,
                err => this.errorService.handle(err)
            );

    }
}
