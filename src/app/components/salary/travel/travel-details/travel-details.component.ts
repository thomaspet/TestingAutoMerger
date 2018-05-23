import {Component, OnInit, Input, Output, OnChanges, SimpleChanges, EventEmitter} from '@angular/core';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Observable} from 'rxjs/Observable';
import {TravelLine, Travel} from '@uni-entities';
import {TravelService, FileService, ErrorService} from '@app/services/services';
const DIRTY = '_isDirty';

@Component({
  selector: 'uni-travel-details',
  templateUrl: './travel-details.component.html',
  styleUrls: ['./travel-details.component.sass']
})
export class TravelDetailsComponent implements OnInit, OnChanges {

    @Input() travel: Travel;
    @Output() public travelChange: EventEmitter<Travel> = new EventEmitter();

    public travelLines$: BehaviorSubject<TravelLine[]> = new BehaviorSubject([]);
    public travelFormModel$: BehaviorSubject<Travel> = new BehaviorSubject(null);
    public fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    public fileIDs$: BehaviorSubject<number[]> = new BehaviorSubject([]);
    public filesBusy: boolean;

    constructor(
        private travelService: TravelService,
        private errorService: ErrorService
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
            this.checkFiles(this.travel);
        }
    }

    public formChange(change: SimpleChanges) {
        this.travelFormModel$
            .take(1)
            .map(travel => {
                travel[DIRTY] = true;
                return travel;
            })
            .subscribe(travel => this.travelChange.next(travel));
    }

    public linesChanged(lines: TravelLine[]) {
        this.travel[DIRTY] = true;
        this.travel.TravelLines = lines;
        this.travelChange.next(this.travel);
    }

    private checkFiles(travel: Travel) {
        this.fileIDs$.next([]);
        this.travelService
            .getFiles(travel)
            // .finally(() => this.filesBusy = false)
            .catch((err, obs) => this.errorService.handleRxCatch(err, obs))
            .subscribe(files => this.fileIDs$.next(files.map(file => file.ID)));
    }

}
