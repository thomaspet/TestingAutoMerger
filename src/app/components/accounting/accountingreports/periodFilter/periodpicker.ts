import {Component, Input, Output, EventEmitter, ElementRef} from '@angular/core';
import {PeriodFilter, PeriodFilterHelper} from './periodFilter';
declare var _;

@Component({
    selector: 'period-picker',
    templateUrl: './periodpicker.html',
    host: {
        '(document:click)': 'checkForClickOutside($event)'
    },
})
export class PeriodPicker {
    @Input() public periodFilter: PeriodFilter;
    @Output() public periodFilterChanged: EventEmitter<PeriodFilter> = new EventEmitter<PeriodFilter>();

    private periodFilterData: PeriodFilter;
    public pickerAreaVisible: boolean = false;

    constructor(private el: ElementRef) {
    }

    public ngOnInit() {

    }

    private togglePicker() { // tslint:disable-line
        if (this.pickerAreaVisible) {
            this.hidePicker();
        } else {
            this.periodFilterData = _.cloneDeep(this.periodFilter);
            this.showPicker();
        }
    }

    private hidePicker() {
        this.pickerAreaVisible = false;
    }

    private showPicker() {
        this.pickerAreaVisible = true;
    }

    private update() { // tslint:disable-line
        this.periodFilterData.name = PeriodFilterHelper.getFilterName(this.periodFilterData);
        this.periodFilter = _.cloneDeep(this.periodFilterData);

        this.periodFilterChanged.emit(this.periodFilter);

        this.hidePicker();
    }

    public checkForClickOutside(event) {
        if (!this.pickerAreaVisible) {
            return;
        }

        if (!this.el.nativeElement.contains(event.target)) {
            this.hidePicker();
        }
    }
}
