import {Component, ViewChild, ElementRef, Output, EventEmitter} from '@angular/core';
import {FormControl} from '@angular/forms';
import {User} from '../../app/unientities';
import {ErrorService, UserService} from '../../app/services/services';
import {KeyCodes} from '../../app/services/common/KeyCodes';

@Component({
    selector: 'uni-comment-input',
    template: `
        <ul #list class="mention-dropdown-list"
            role="listbox"
            tabindex="-1"
            [attr.aria-expanded]="filteredUsers?.length > 0">

            <li *ngFor="let user of filteredUsers; let idx = index"
                role="option"
                (mouseover)="focusIndex = idx"
                (click)="userSelected()"
                [attr.aria-selected]="focusIndex === idx">

                {{user.DisplayName}}
            </li>
        </ul>

        <input #inputElement type="text" placeholder="Skriv en melding"
               [formControl]="inputControl"
               (keydown)="onKeyDown($event)"
        />

        <button class="c2a" (click)="submitClicked()">Send</button>
    `
})
export class UniCommentInput {
    @ViewChild('inputElement')
    private inputElement: ElementRef;

    @Output()
    private submit: EventEmitter<string> = new EventEmitter();

    private inputControl: FormControl = new FormControl('');

    private users: User[];
    private filteredUsers: User[] = [];
    private focusIndex: number;
    private mentionIndex: number;

    constructor(
        private userService: UserService,
        private errorService: ErrorService
    ) {}

    public ngOnInit() {
        this.userService.GetAll(null).subscribe(
            users => this.users = users,
            err => this.errorService.handle(err)
        );

        this.inputControl.valueChanges.subscribe((value) => {
            let inputWord = this.getCurrentWord(value);

            if (inputWord && inputWord[0] === '@') {
                const wordsInMessage = value.split(' ');
                this.mentionIndex = wordsInMessage.findIndex(w => w === inputWord);
                this.mentionLookup(inputWord.slice(1));
            } else {
                this.mentionIndex = undefined;
                this.filteredUsers = [];
            }
        });
    }

    public submitClicked() {
        if (this.inputControl.value && this.inputControl.value.length) {
            this.submit.next(this.inputControl.value);
            this.inputControl.setValue('', {emitEvent: false});
        }
    }

    private mentionLookup(word) {
        this.focusIndex = 0;
        this.filteredUsers = this.users.filter((user: User) => {
            return (user.DisplayName || '').toLowerCase().startsWith(word)
                || (user.UserName || '').toLowerCase().startsWith(word);
        });
    }

    private userSelected() {
        let user = this.filteredUsers[this.focusIndex];

        let editorValue = this.inputControl.value || '';
        let words = editorValue.split(' ');
        words[this.mentionIndex] = '@' + user.UserName + ' ';

        this.inputControl.setValue(words.join(' '), {emitEvent: false});
        this.filteredUsers = [];
        // TODO: cdr.markForCheck() ?
    }

    public onKeyDown(event: KeyboardEvent) {
        if (!this.filteredUsers.length) {
            return;
        }

        switch (event.which || event.keyCode) {
            case KeyCodes.ENTER:
            case KeyCodes.TAB:
            case KeyCodes.SPACE:
                event.preventDefault();
                this.userSelected();
            break;
            case KeyCodes.ESCAPE:
                event.stopPropagation();
                this.filteredUsers = [];
            break;
            case KeyCodes.UP_ARROW:
                event.preventDefault();
                if (this.focusIndex > 0) {
                    this.focusIndex--;
                }
            break;
            case KeyCodes.DOWN_ARROW:
                event.preventDefault();
                if ((this.focusIndex + 1) < this.filteredUsers.length) {
                    this.focusIndex++;
                }
            break;
        }
    }

    private getCurrentWord(inputValue: string): string {
        let caret = this.getCaretPosition();
        let endPos = inputValue.indexOf(' ', caret.end);
        if (endPos === -1) {
            endPos = inputValue.length;
        }

        let result = /\S+$/.exec(inputValue.slice(0, endPos));
        let word = result ? result[0] : null;

        const lastChar = word && word[word.length - 1];
        if (lastChar === ',' || lastChar === '.') {
            return '';
        }

        return word;
    }

    private getCaretPosition(): {start: number, end: number} {
        let start, end;
        if (this.inputElement.nativeElement.setSelectionRange) {
            start = this.inputElement.nativeElement.selectionStart;
            end = this.inputElement.nativeElement.selectionEnd;
        } else if ((<any> document).selection && (<any> document).selection.createRange) {
            const range = (<any> document).selection.createRange();
            start = 0 - range.duplicate().moveStart('character', -100000);
            end = start + range.text.length;
        }

        return {
            start: start,
            end: end
        };
    }

}
