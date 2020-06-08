import {
    Component, OnInit, Input, Output, OnChanges, SimpleChanges,
    EventEmitter, OnDestroy, SimpleChange
} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {TravelLine, Travel} from '@uni-entities';
import {TravelService} from '@app/services/services';
const DIRTY = '_isDirty';

@Component({
  selector: 'uni-travel-details',
  templateUrl: './travel-details.component.html',
  styleUrls: ['./travel-details.component.sass']
})
export class TravelDetailsComponent implements OnInit, OnChanges, OnDestroy {

    @Input() public travel: Travel;
    @Input() public fileIDs: number[] = [];
    @Output() public travelChange: EventEmitter<Travel> = new EventEmitter();

    public travelLines$: BehaviorSubject<TravelLine[]> = new BehaviorSubject([]);
    public travelFormModel$: BehaviorSubject<Travel> = new BehaviorSubject(null);
    public fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    public filesBusy: boolean;
    public viewActive: boolean;

    constructor(
        private travelService: TravelService
    ) { }

    public ngOnInit() {
        this.travelService
            .layout(this.travelFormModel$)
            .subscribe(layout => this.fields$.next(layout.Fields));
    }

    public ngOnChanges(changes: SimpleChanges) {
        if (changes['travel']) {
            this.travelLines$.next((this.travel && this.travel.TravelLines) || []);
            this.travelFormModel$.next(this.travel);
            this.refreshForm(changes['travel']);
        }
    }

    public ngOnDestroy() {
        this.travelService.clear();
    }

    public formChange(change: SimpleChanges) {
        this.travelFormModel$
            .take(1)
            .map(travel => {
                travel[DIRTY] = true;
                return travel;
            })
            .subscribe(travel => this.emitChange(travel));
    }

    public linesChanged(lines: TravelLine[]) {
        this.travel[DIRTY] = true;
        this.travel.TravelLines = lines;
        this.emitChange(this.travel);
    }

    private emitChange(travel: Travel) {
        travel.TravelLines = travel.TravelLines.filter(x => !(x['_isEmpty'] === true));
        this.travelChange.next(travel);
    }
    private refreshForm(change: SimpleChange): boolean {
        return this.refreshFormWithProp(change, 'EmployeeNumber')
        || this.refreshFormWithProp(change, 'SupplierID');
    }
    private refreshFormWithProp(change: SimpleChange, prop: string): boolean {
        if (!change || change.firstChange || change.currentValue[prop] ||
            change.currentValue[prop] === change.previousValue[prop]) {
            return false;
        }
        this.viewActive = true;
        setTimeout(() => this.viewActive = false);

        return true;
    }

}
