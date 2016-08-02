import {Component, Input} from '@angular/core';
import {WorkerService} from '../../../services/timetracking/workerservice';
import {WorkRelation} from '../../../unientities';

@Component({
    selector: 'workrelations',
    templateUrl: 'app/components/timetracking/worker/relations.html',
    providers: [WorkerService]        
})
export class View {
    @Input() public set workerid(id: number) {
        this.currentId = id;
        this.loadList();
    }
    public currentId: number = 0;
    public collapseView: boolean = false;
    public items: Array<WorkRelation> = [];
    
    private initialized: boolean = false;

    constructor(private workerService: WorkerService) {

    }

    public ngOnInit() {
        this.initialized = true;
        this.loadList();
    }

    private loadList() {
        if (!this.initialized) { return; }
        if (this.currentId) {
            this.workerService.getWorkRelations(this.currentId).subscribe( items => this.items = items );
        } else {
            this.items.length = 0;
        }
    }
}
