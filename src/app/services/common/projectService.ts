import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {Project} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {BehaviorSubject, Observable} from 'rxjs';
import {ReplaySubject} from 'rxjs';
import {IToolbarConfig} from '../../components/common/toolbar/toolbar';
import {IUniSaveAction} from '../../../framework/save/save';

@Injectable()
export class ProjectService extends BizHttp<Project> {

    public currentProject: BehaviorSubject<Project> = new BehaviorSubject(null);
    public toolbarConfig: ReplaySubject<IToolbarConfig> = new ReplaySubject(null);
    public saveActions: ReplaySubject<Array<IUniSaveAction>> = new ReplaySubject(null);
    public allProjects: Project[];
    public isDirty: boolean;
    hasSupplierInvoiceModule: boolean = false;
    hasJournalEntryLineModule: boolean = false;
    hasOrderModule: boolean = false;

    constructor(http: UniHttp) {
        super(http);

        this.relativeURL = Project.RelativeUrl;
        this.entityType = Project.EntityType;
        this.DefaultOrderBy = null;
    }

    // tslint:disable-next-line:member-ordering
    public statusTypes: Array<any> = [
        { Code: 42201, Text: 'Registrert', isPrimary: true},
        { Code: 42202, Text: 'Tilbudsfase', isPrimary: false },
        { Code: 42203, Text: 'Pågår', isPrimary: true },
        { Code: 42204, Text: 'Fullført', isPrimary: true },
        { Code: 42205, Text: 'Arkivert', isPrimary: false },
    ];

    public setNew() {
        this.currentProject.next(new Project);
    }

    public resetBools() {
        this.hasOrderModule = false;
        this.hasSupplierInvoiceModule = false;
        this.hasJournalEntryLineModule = false;
    }

}
