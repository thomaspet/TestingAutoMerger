import {Component, Input, ViewChild, ElementRef, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {FormControl} from '@angular/forms';
import {Comment, User} from '../../app/unientities';
import {CommentService} from './commentService';
import {ErrorService, UserService} from '../../app/services/services';
import {KeyCodes} from '../../app/services/common/keyCodes';
import * as moment from 'moment';

@Component({
    selector: 'uni-comments',
    templateUrl: './comments.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniComments {
    @ViewChild('inputElement')
    private inputElement: ElementRef;

    @ViewChild('commentList')
    private commentList: ElementRef;

    @Input()
    private entity: string;

    @Input()
    private entityID: number;

    private isBusy: boolean;
    private isOpen: boolean;
    private comments: Comment[] = [];
    private users: User[] = [];

    private inputControl: FormControl = new FormControl('');
    private mentionedIndexes: number[] = [];

    // lookup
    private lookupResults: any[] = [];
    private selectedIndex: number;

    constructor(
        private commentService: CommentService,
        private userService: UserService,
        private errorService: ErrorService,
        private cdr: ChangeDetectorRef
    ) {}

    public ngOnInit() {
        this.inputControl.valueChanges.throttleTime(300).subscribe((val) => {
            const mention = this.inputControl.value
                .split(' ')
                .find((word, index) => {
                    if (word[0] !== '@') {
                        return false;
                    }
                    // TODO: hacky for demo.. Rework this!
                    return this.mentionedIndexes.findIndex(x => x === index) < 0;
                });

            if (mention) {
                this.mentionLookup(mention.substring(1).toLowerCase());
            } else {
                this.lookupResults = [];
                this.cdr.markForCheck();
            }
        });
    }

    public ngOnChanges() {
        if (this.entity && this.entityID) {
            this.getAllOnEntity();
            this.userService.GetAll(null).subscribe(
                res => this.users = res,
                err => this.errorService.handle(err)
            );
        }
    }

    public toggle(event?: MouseEvent) {
        this.mentionedIndexes = [];
        if (event) {
            event.stopPropagation();
        }
        this.isOpen = !this.isOpen;
        if (this.isOpen) {
            setTimeout(() => {
                let scroll = this.commentList.nativeElement.scrollHeight;
                this.commentList.nativeElement.scrollTop = scroll;
                this.inputElement.nativeElement.focus();
            });
        }
        this.cdr.markForCheck();
    }

    public close() {
        this.mentionedIndexes = [];
        this.isOpen = false;
        this.cdr.markForCheck();
    }

    public getTimeFromNow(createdAt: Date): string {
        return (createdAt)
            ? moment(createdAt).fromNow()
            : '';
    }

    private mentionLookup(word) {
        this.lookupResults = this.users.filter((user) => {
            return (user.DisplayName || '').toLowerCase().startsWith(word)
                || (user.UserName || '').toLowerCase().startsWith(word);
        });

        this.selectedIndex = (this.lookupResults.length > 0)
            ? 0 : undefined;

        this.cdr.markForCheck();
    }

    public selectItem(event?: MouseEvent) {
        if (event) {
            event.stopPropagation(); // avoid trigger clickOutside
        }
        const words = this.inputControl.value.split(' ');
        const wordIndex = words.findIndex((word, index) => {
            if (word[0] !== '@') {
                return false;
            }
            // TODO: hacky for demo.. Rework this!
            return this.mentionedIndexes.findIndex(x => x === index) < 0;
        });

        words[wordIndex] = '@' + this.lookupResults[this.selectedIndex].UserName + ' ';
        this.mentionedIndexes.push(wordIndex);
        this.lookupResults = [];
        this.inputControl.setValue(words.join(' '), {emitEvent: false});
        this.cdr.markForCheck();
    }

    public onKeydown(event: KeyboardEvent) {
        if (!this.lookupResults.length) {
            return;
        }

        switch (event.which || event.keyCode) {
            case KeyCodes.ENTER:
            case KeyCodes.TAB:
            case KeyCodes.SPACE:
                event.preventDefault();
                this.selectItem();
            break;
            case KeyCodes.ESCAPE:
                event.stopPropagation();
                this.lookupResults = [];
            break;
            case KeyCodes.UP_ARROW:
                event.preventDefault();
                if (this.selectedIndex > 0) {
                    this.selectedIndex--;
                }
            break;
            case KeyCodes.DOWN_ARROW:
                event.preventDefault();
                if ((this.selectedIndex + 1) < this.lookupResults.length) {
                    this.selectedIndex++;
                }
            break;
        }

        this.cdr.markForCheck();
    }

    public submit() {
        this.mentionedIndexes = [];
        if (this.inputControl.value) {
            this.isBusy = true;
            this.commentService.post(
                this.entity,
                this.entityID,
                this.inputControl.value
            ).subscribe(
                (res) => {
                    this.isBusy = false;
                    this.inputControl.setValue('', {emitEvent: false});
                    this.getAllOnEntity();
                },
                (err) => {
                    this.isBusy = false;
                    this.errorService.handle(err);
                }
            );
        }
    }

    public getAllOnEntity() {
        this.commentService.getAll(this.entity, this.entityID).subscribe(
            (res) => {
                this.comments = res.map((comment) => {
                    let words = comment.Text.split(' ');
                    words = words.map((word) => {
                        return (word.startsWith('@'))
                            ? `<span class="mention">${word}</span>`
                            : word;
                    });

                    comment.Text = words.join(' ');
                    return comment;
                });

                this.cdr.markForCheck();
                setTimeout(() => {
                    const scroll = this.commentList.nativeElement.scrollHeight;
                    this.commentList.nativeElement.scrollTop = scroll;
                });
            },
            err => this.errorService.handle(err)
        );
    }
}
