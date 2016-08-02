import {Component, Input} from '@angular/core';
import {WorkerService} from '../../../services/timetracking/workerservice';
import {WorkRelation} from '../../../unientities';
import {Router} from '@angular/router';

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
    public busy: boolean = false;
    
    private initialized: boolean = false;

    constructor(private workerService: WorkerService, private router: Router) {

    }

    public ngOnInit() {
        this.initialized = true;
        this.loadList();
    }

    public onItemClicked(item: WorkRelation) {
        if (item && item.ID) {
            this.router.navigateByUrl('/timetracking/workrelations/' + item.ID);
        }
    }

    private loadList() {
        if (!this.initialized) { return; }
        if (this.currentId) {
            this.busy = true;
            this.workerService.getWorkRelations(this.currentId).subscribe( (items) => {
                this.items = items;
                this.busy = false; 
            });
        } else {
            this.items.length = 0;
        }
    }
}
