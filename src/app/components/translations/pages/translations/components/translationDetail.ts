import {
    Component, Input, ChangeDetectionStrategy, SimpleChanges, OnChanges, ViewChild,
    ElementRef
} from '@angular/core';
import {FormControl} from '@angular/forms';
import {Store} from '@ngrx/store';
import * as translationActions from '../../../translation/actions';
import {Translatable, Translation} from '../../../../../unientities';
import {TranslationsState} from '../../../reducers';
import {Subscription} from 'rxjs/Subscription';
import {KeyCodes} from "../../../../../services/common/keyCodes";

@Component({
    selector: 'uni-translation-detail',
    template: `
        <section class="translationInfo">
            <h2>Source Text</h2>
            <p>{{translatable?.Value}}</p>
            <h3>Meaning</h3>
            <p>{{translatable?.Meaning}}</p>
            <h3>Description</h3>
            <p>{{translatable?.Description}}</p>
        </section>
        <section class="translation">
            <label>
                <h4>Translation</h4>
                <textarea [formControl]="translationFormControl" #textarea (keydown)="preventEnter($event)"></textarea>
                <aside style="float:right">Hint: Use shift+enter to insert a line break</aside>
            </label>
        </section>

    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TranslationDetailComponent implements OnChanges {
    @Input() private translatable: Translatable;
    @Input() private translation: Translation;
    @ViewChild('textarea') private textarea: ElementRef;
    private translationFormControl: FormControl;
    private subscription: Subscription;

    constructor(private store: Store<TranslationsState>) {}

    public ngOnChanges(changes: SimpleChanges) {
        if (changes['translation']) {
            if (this.textarea && this.textarea.nativeElement) {
                this.textarea.nativeElement.focus();
            }
            const translation: Translation = changes['translation'].currentValue;
            if (this.subscription) {
                this.subscription.unsubscribe();
            }
            this.translationFormControl = new FormControl(translation.Value);
            this.subscription = this.translationFormControl
                .valueChanges
                .debounceTime(500)
                .subscribe((value: string) => {
                    translation.Value = value;
                    this.store.dispatch({
                        type: translationActions.ActionTypes.SET_TRANSLATION,
                        payload: translation
                    });
                });
        }

    }

    public preventEnter(event: KeyboardEvent) {
        if (event.keyCode === KeyCodes.ENTER && event.shiftKey === true) {
            event.stopPropagation();
        }
    }

    public ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}
