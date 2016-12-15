import {Component, Input, ViewChild, ElementRef} from '@angular/core';
import {FormControl} from '@angular/forms';
import {Comment, User} from '../../app/unientities';
import {CommentService} from './commentService';
import {ErrorService, UserService} from '../../app/services/services';
import {KeyCodes} from '../../app/services/common/KeyCodes';
import moment from 'moment';

@Component({
    selector: 'uni-comments',
    templateUrl: 'framework/comments/comments.html'
})
export class UniComments {
    @ViewChild('inputElement')
    private inputElement: ElementRef;

    @Input()
    private entity: string;

    @Input()
    private entityID: number;

    private isOpen: boolean = true;
    private comments: Comment[] = [];
    private users: User[] = [];

    private inputControl: FormControl = new FormControl('');

    // lookup
    private lookupResults: any[] = [];
    private selectedIndex: number;

    constructor(
        private commentService: CommentService,
        private userService: UserService,
        private errorService: ErrorService
    ) {}

    public ngOnInit() {
        this.inputControl.valueChanges.debounceTime(150).subscribe((val) => {
            const mention = this.inputControl.value
                .split(' ')
                .find(word => word[0] === '@');

            if (mention) {
                this.mentionLookup(mention.substring(1));
            } else {
                this.lookupResults = [];
            }
        });
    }

    public ngOnChanges() {
        if (this.entity && this.entityID) {
            this.userService.GetAll(null).subscribe(
                (res) => {
                    this.users = res;
                    this.getAllOnEntity();
                },
                this.errorService.handle
            );
        }
    }

    public toggle(event?: MouseEvent) {
        if (event) {
            event.stopPropagation();
        }
        this.isOpen = !this.isOpen;
        if (this.isOpen) {
            setTimeout(() => {
                this.inputElement.nativeElement.focus();
            });
        }
    }

    public close() {
        this.isOpen = false;
    }

    public getTimeFromNow(createdAt: Date): string {
        return (createdAt)
            ? moment(createdAt).fromNow()
            : '';
    }

    private mentionLookup(word) {
        this.lookupResults = this.users.filter((user) => {
            return (user.DisplayName || '').startsWith(word)
                || (user.UserName || '').startsWith(word);
        });

        this.selectedIndex = (this.lookupResults.length > 0)
            ? 0 : undefined;
    }

    public selectItem() {
        const words = this.inputControl.value.split(' ');
        const index = words.findIndex(word => word[0] === '@');
        words[index] = this.lookupResults[this.selectedIndex].UserName;

        this.lookupResults = [];
        this.inputControl.setValue(words.join(' '), {emitEvent: false});
    }

    public onKeydown(event: KeyboardEvent) {
        if (!this.lookupResults.length) {
            return;
        }

        switch (event.which || event.keyCode) {
            case KeyCodes.ENTER:
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
    }

    public submit() {
        if (this.inputControl.value) {
            this.commentService.post(
                this.entity,
                this.entityID,
                this.inputControl.value
            ).subscribe(
                (res) => {
                    this.inputControl = new FormControl('');
                    this.getAllOnEntity();
                },
                this.errorService.handle
            );
        }
    }

    public getAllOnEntity() {
        this.commentService.getAll(this.entity, this.entityID).subscribe(
            (res) => {
                // REVISIT: if expanding Author works this can be removed
                this.comments = res.map((comment) => {
                    const author = this.users.find(user => user.ID === comment.AuthorID);
                    comment['_author'] = (author && author.DisplayName)
                        ? author.DisplayName : 'Ukjent bruker';

                    return comment;
                });
                // this.comments = res
            },
            this.errorService.handle
        );
    }

    public submitNewComment(text: string) {
        this.commentService.post(this.entity, this.entityID, text).subscribe(
            res => this.getAllOnEntity(),
            this.errorService.handle
        );
    }

}
