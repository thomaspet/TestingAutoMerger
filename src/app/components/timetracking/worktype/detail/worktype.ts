import {Component} from "@angular/core";
import {TabService} from '../../../layout/navbar/tabstrip/tabService';
import {View} from '../../../../models/view/view';
import {WorkerService} from '../../../../services/timetracking/workerservice';
import {WorkTypeSystemTypePipe} from '../../utils/pipes';
import {RouteParams} from '@angular/router-deprecated';
import {WorkType} from '../../../../unientities';
import {UniSave, IUniSaveAction} from '../../../../../framework/save/save';
import {UniForm, UniFieldLayout} from '../../../../../framework/uniform';

export var view = new View('worktype', 'Timeart', 'WorktypeDetailview', true, 'worktype/detail');

@Component({
    selector: view.name,
    templateUrl: 'app/components/timetracking/worktype/detail/worktype.html',
    pipes: [WorkTypeSystemTypePipe],
    providers: [WorkerService],
    directives: [UniForm]
})
export class WorktypeDetailview {

    private ID:number;
    private current: WorkType;
    private fields: Array<any>;
    private config: any = {};

    constructor(private workerService: WorkerService, private params: RouteParams) {
        this.ID = parseInt(params.get('id'));
    }

    public ngOnInit() {
        this.setupLayout();
    }

    public onChange(event) {

    }

    public onReady(event) {

    }

    private setupLayout() {
        this.fields = [
            this.newField('ID', 'Nr'),
            this.newField('Name', 'Navn')
        ];
    }

    private newField(name:string, label:string, fieldType = 10, section = 0, sectionHeader?:string, fieldSet = 0):any {
        return { 
            EntityType: 'WorkType', 
            Property: name, Label: label,
            FieldType: fieldType,
            Section: section, SectionHeader: sectionHeader,
            FieldSet: fieldSet,
            Combo: 0
        }
    }

}  