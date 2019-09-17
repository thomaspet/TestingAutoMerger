import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { ChatBoxService } from './chat-box.service';
import { Comment, User } from '@uni-entities';
import { AuthService } from '@app/authService';
import { FormControl } from '@angular/forms';
import { KeyCodes } from '@app/services/common/keyCodes';
import { UserService, ErrorService } from '@app/services/services';
import { Router } from '@angular/router';
import { CommentService } from '@uni-framework/comments/commentService';
import { SignalRService } from '@app/services/common/signal-r.service';
import { PushMessage, BusinessObject } from '@app/models';

@Component({
    selector: 'uni-chat-box',
    templateUrl: './chat-box.component.html',
    styleUrls: ['./chat-box.component.sass']
})
export class ChatBoxComponent implements OnInit {
    @Input() businessObject: BusinessObject;

    @ViewChild('inputElement') private inputElement: ElementRef;

    comments: Comment[];
    filteredUsers: User[] = [];
    inputControl: FormControl = new FormControl('');
    minimized = false;

    public focusIndex: number;
    private mentionIndex: number;
    private users: User[];

    constructor(
        public authService: AuthService,
        private chatBoxService: ChatBoxService,
        private commentService: CommentService,
        private errorService: ErrorService,
        private router: Router,
        private userService: UserService,
        public signalRService: SignalRService) {}

    ngOnInit() {
        if (this.businessObject) {
            this.getComments();
        }

        this.userService.GetAll().subscribe(
            users => this.users = users,
            err => this.errorService.handle(err)
        );

        this.inputControl.valueChanges.subscribe((value: string) => {
            const inputWord = this.getCurrentWord(value);

            this.inputElement.nativeElement.style.height = '';
            this.inputElement.nativeElement.style.height = this.inputElement.nativeElement.scrollHeight + 'px';

            if (inputWord && inputWord[0] === '@') {
                const wordsInMessage = value.split(' ');
                this.mentionIndex = wordsInMessage.findIndex(w => w === inputWord);
                this.mentionLookup(inputWord.slice(1));
            } else {
                this.mentionIndex = undefined;
                this.filteredUsers = [];
            }
        });

        this.signalRService.hubConnection.invoke(
            'RegisterListener',
            <PushMessage> {
                entityType: this.businessObject.EntityType,
                entityID: this.businessObject.EntityID,
                companyKey: this.signalRService.currentCompanyKey
            }
        ).catch(err => console.error(err));

        this.signalRService.pushMessage$.subscribe(message => {
            if (message && message.entityType.toLowerCase() === this.businessObject.EntityType.toLowerCase()) {
                this.getComments();
            }
        });
    }

    closeChatBox(event: any) {
        event.stopPropagation();
        let businessObjects = this.chatBoxService.businessObjects.getValue();
        businessObjects = businessObjects.filter(businessObject => {
            return !(
                businessObject.EntityType === this.businessObject.EntityType
                && businessObject.EntityID === this.businessObject.EntityID
            );
        });
        this.chatBoxService.businessObjects.next(businessObjects);
    }

    getComments() {
        this.commentService.getAll(this.businessObject.EntityType, this.businessObject.EntityID).subscribe((comments: Comment[]) => {
            this.comments = comments.reverse();
            this.comments.map((comment) => {
                let words = comment.Text ? comment.Text.split(' ') : [];
                words = words.map((word) => {
                    return word.startsWith('@')
                        ? `<span class="mention">${word}</span>`
                        : word;
                });

                comment.Text = words.join(' ');
                return comment;
            });
        });
    }

    navigateToBusinessObject(event: any) {
        event.stopPropagation();
        this.router.navigateByUrl(this.chatBoxService.getBusinessObjectRoute(this.businessObject));
    }

    onKeyDown(event: KeyboardEvent) {
        const element = document.querySelector('.mention-dropdown-list');
        const style = getComputedStyle(element);

        if (!event.shiftKey && event.keyCode === KeyCodes.ENTER) {
            if (style.visibility === 'hidden') {
                event.preventDefault();
                this.postComment();
                return;
            }
        }

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

    postComment() {
        const commentDraft: Comment = <Comment>{
            Author: <User>{
                DisplayName: this.signalRService.user.DisplayName,
                GlobalIdentity: this.signalRService.user.GlobalIdentity
            },
            CreatedAt: new Date(),
            Text: this.inputControl.value
        };

        this.comments.unshift(commentDraft);

        this.commentService.post(this.businessObject.EntityType, this.businessObject.EntityID, this.inputControl.value).subscribe(
            () => {},
            err => console.error(err)
        );

        this.inputControl.setValue('');
    }

    userSelected() {
        const user = this.filteredUsers[this.focusIndex];

        const editorValue = this.inputControl.value || '';
        const words = editorValue.split(' ');
        words[this.mentionIndex] = '@' + user.UserName + ' ';

        this.inputControl.setValue(words.join(' '), {emitEvent: false});
        this.filteredUsers = [];
    }

    private getCurrentWord(inputValue: string): string {
        const caret = this.getCaretPosition();
        let endPos = inputValue.indexOf(' ', caret.end);
        if (endPos === -1) {
            endPos = inputValue.length;
        }

        const result = /\S+$/.exec(inputValue.slice(0, endPos));
        const word = result ? result[0] : null;

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

    private mentionLookup(word: string) {
        this.focusIndex = 0;
        this.filteredUsers = this.users.filter((user: User) => {
            return (user.DisplayName || '').toLowerCase().startsWith(word)
                || (user.UserName || '').toLowerCase().startsWith(word);
        });
    }

}
