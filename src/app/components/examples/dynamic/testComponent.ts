import {
    Component, Input, Output, ChangeDetectionStrategy, EventEmitter, ChangeDetectorRef
} from '@angular/core';
import {UniDynamic} from '../../../../framework/core/dynamic/UniDynamic';


@Component({
    selector: 'test-component',
    template: `
        <input type="text" [(ngModel)]="myInput"/>
        <button type="button" (click)="sendUp()">Send up!</button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UniTestComponent extends UniDynamic {

    @Input() public myInput: string = 'Not modified by the creator';
    @Output() public onReady: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() public onChange: EventEmitter<string> = new EventEmitter<string>();
    constructor(public cd: ChangeDetectorRef) {
        super(cd);
    }

    public ngOnInit() {
        console.log('ngOnInit:', this.myInput);
    }

    public ngOnChanges() { // Problem: we can't detect changes in this component
        console.log('ngOnChange:', this.myInput);
    }

    public ngAfterViewInit() {
        this.onReady.emit(true);
        console.log('ngAfterViewInit:', this.myInput);
    }

    public sendUp() {
        this.onChange.emit(this.myInput);
    }
}
