import {
    Component, Input, ChangeDetectionStrategy, Output, EventEmitter,
    SimpleChanges, OnChanges, ViewChild, ElementRef
} from '@angular/core';
import {Translatable, Language} from '../../../../../unientities';
import {KeyCodes} from '../../../../../services/common/keyCodes';
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';
import 'rxjs/add/observable/fromEvent';

@Component({
    selector: 'uni-translatables-list',
    template: `
        <ul class="translatablesList" (keydown)="navigate($event)" #list>
            <li *ngFor="let translatable of translatables" 
                (click)="open(translatable)"
                [attr.aria-selected]="isSelected(translatable) || false"
            >{{translatable.Value}}
            </li>
        </ul>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TranslatablesListComponent implements OnChanges {
    @Input() public translatables: Translatable[];
    @Input() public selectedTranslatable: Translatable;
    @Input() public language: Language;
    @Output() public selectTranslatable: EventEmitter<Translatable> = new EventEmitter<Translatable>();
    @ViewChild('list') private list: ElementRef;
    private navigationEvent: Subscription;
    private openOnce: boolean = false;
    private currentTranslatable: Translatable;

    constructor() {}

    public ngOnChanges(changes: SimpleChanges) {
        if (changes['selectedTranslatable']) {
            const value = changes['selectedTranslatable'].currentValue;
            this.currentTranslatable = value;
            if (!this.openOnce && value) {
                this.openOnce = true;
                this.open(value);
            }
        }
    }

    public ngAfterViewInit() {
        this.navigationEvent = Observable.fromEvent(document, 'keydown')
            .subscribe(this.navigate.bind(this));
    }

    private open(translatable: Translatable) {
        this.selectTranslatable.emit(translatable);
    }

    private navigate(event: KeyboardEvent) {
        const index = this.translatables.indexOf(this.selectedTranslatable);
        if (event.keyCode === KeyCodes.UP_ARROW) {
            event.preventDefault();
            event.stopPropagation();
            if (index > 0) {
                this.open(this.translatables[index - 1]);
                this.scrollToListItem();
            }
        }
        if (event.keyCode === KeyCodes.DOWN_ARROW || event.keyCode === KeyCodes.ESCAPE) {
            event.preventDefault();
            event.stopPropagation();
            if (index < this.translatables.length - 1) {
                this.open(this.translatables[index + 1]);
                this.scrollToListItem();
            }
        }
    }

    private scrollToListItem() {
        const list = this.list.nativeElement;
        const currItem = list.children[this.translatables.indexOf(this.selectedTranslatable)];
        if (!currItem) {
            return;
        }
        const bottom = list.scrollTop + list.offsetHeight - currItem.offsetHeight;

        if (currItem.offsetTop <= list.scrollTop) {
            list.scrollTop = currItem.offsetTop;
        } else if (currItem.offsetTop >= bottom) {
            list.scrollTop = currItem.offsetTop - (list.offsetHeight - currItem.offsetHeight);
        }
    }

    private isSelected(translatable: Translatable) {
        return this.selectedTranslatable === translatable;
    }

    public ngOnDestroy() {
        this.navigationEvent.unsubscribe();
    }
}
