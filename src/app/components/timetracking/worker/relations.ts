import {Component, Input, Output, EventEmitter} from '@angular/core';
import {WorkerService} from '../../../services/timetracking/workerservice';
import {WorkRelation} from '../../../unientities';
import {Router} from '@angular/router';
import {UniForm} from '../../../../framework/uniform';
import {createFormField, FieldSize, ControlTypes} from '../utils/utils';

export interface IResult {
    success: boolean;
    msg?: string;   
}

@Component({
    selector: 'workrelations',
    templateUrl: 'app/components/timetracking/worker/relations.html',
    directives: [UniForm],
    providers: [WorkerService]        
})
export class View {
    @Input() public set workerid(id: number) {
        this.currentId = id;
        this.loadList();
    }
    @Output() public onValueChange: EventEmitter<any> = new EventEmitter();

    public collapseView: boolean = false;
    public items: Array<WorkRelation> = [];
    public busy: boolean = false;
    private initialized: boolean = false;

    public formConfig: any = {};
    public layout: any;

    public currentId: number = 0;
    public currentRelation: WorkRelation = new WorkRelation();

    constructor(private workerService: WorkerService, private router: Router) {
        this.layout = this.createLayout();
    }

    public ngOnInit() {
        this.initialized = true;
    }

    public onReady(event: any) {
        this.loadList();
    }

    public onChange(event: any) {
        this.onValueChange.emit(this.currentRelation);
    }

    public onItemClicked(item: WorkRelation) {
        this.currentRelation = item;
    }

    public saveChanges(parentID: number): Promise<IResult> {
        return new Promise((resolve, reject) => {
            this.currentRelation.WorkerID = parentID;
            this.workerService.saveByID<WorkRelation>(this.currentRelation, this.layout.data.route ).subscribe((item: WorkRelation) => {
                this.currentRelation = item; 
                resolve({ success: true });
            }, (err) => {
                reject({ success: false, msg: JSON.stringify(err) });
            });
        });
    }

    private loadList() {
        if (!this.initialized) { return; }
        this.currentRelation = this.layout.data.factory();
        if (this.currentId) {
            this.busy = true;
            this.workerService.getWorkRelations(this.currentId).subscribe( (items) => {
                this.items = items;
                if (items.length > 0) {
                    this.onItemClicked(items[0]);
                }
                this.busy = false; 
            });
        } else {
            this.items.length = 0;
        }
    }

    private createLayout() {

        var layout = {
            data: {
                route: 'workrelations',
                factory: () => { return new WorkRelation(); }
            },
            formFields: [
                createFormField('WorkPercentage', 'Stillingsprosent',  ControlTypes.NumericInput),
                createFormField('WorkProfileID', 'Stillingsmal', ControlTypes.SelectInput, FieldSize.Double, false, 0, undefined, undefined, this.getComboOptions()),                
                createFormField('CompanyName', 'Firmanavn',  ControlTypes.TextInput),
                createFormField('Description', 'Beskrivelse',  ControlTypes.TextInput, FieldSize.Double),
                createFormField('StartDate', 'Startdato',  ControlTypes.DateInput ),
                createFormField('IsActive', 'Aktiv',  ControlTypes.CheckboxInput )                
            ],
        };

        return layout;
    }

    private getComboOptions(): any {
        return {
                source: this.workerService.getWorkProfiles(),
                template: (obj) => `${obj.ID} - ${obj.Name}`, 
                valueProperty: 'ID',
                displayProperty: 'Name',
                debounceTime: 250,
            };        
    }     
}
