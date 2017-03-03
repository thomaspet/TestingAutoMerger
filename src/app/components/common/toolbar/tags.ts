import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'uni-tags',
    template: `
        <button type="button"
            class="tags_toggle"
            (click)="isOpen = !isOpen">
            {{config?.description || ''}}
            {{summary(tags)}}
        </button>

        <article class="tags_control"
            [attr.aria-expanded]="isOpen"
            [title]="config?.toolTip || ''">

            <small *ngIf="config?.helpText">{{config.helpText}}</small>

            <ul class="tags_list" [attr.aria-readonly]="config?.readOnly">
                <li class="tags_tag"
                    *ngFor="let tag of tags">
                    {{tag.title}}
                    <button type="button"
                        class="tags_tag_removeBtn"
                        (click)="remove(tag)">
                        Delete {{tag.title}}
                    </button>
                </li>
            </ul>
            <section class="tags_lookup" *ngIf="config && !config.readOnly">
                <label>
                    {{config?.lookupLabel || 'Søk opp kategori'}}

                    <input [(ngModel)]="newTag" (keydown.enter)="add(newTag)"/>
                </label>
                <button class="good"
                        type="button"
                        (click)="add(newTag)">
                        Legg til
                </button>
            </section>
        </article>

    `
})
export class UniTags {
    @Input() public config: {
        description?: string;
        helpText?: string;
        lookupLabel?: string;
        truncate?: number;
        readOnly?: boolean;
        toolTip?: string;
    };
    @Input() public tags: any[];
    @Output() public tagsChange: EventEmitter<any> = new EventEmitter();

    private isOpen: boolean = false;
    private newTag: string = '';

    private summary(tags: any[]): string {
        let _tags: string[] = [];
        let _skipped: number = 0;
        let _truncate: number = 20;
        if (this.config && this.config.truncate) {
            _truncate = this.config.truncate;
        }

        this.tags.forEach((tagObj, i) => {
            let tag: string = tagObj.title;
            let currentString: string = _tags.join(', ');
            if (currentString.length + tag.length >= _truncate) {
                _skipped++;
            } else {
                _tags.push(tag);
            }
        });

        if (!_skipped) {
            return _tags.join(', ');
        } else {
            return _tags.join(', ') + ' og ' + _skipped + ' til…';
        }
    }

    public remove(tag: string): void {
        if (!this.config.readOnly) {
            this.tags.splice(this.tags.indexOf(tag), 1);
            this.tagsChange.emit(this.tags);
        }
    }

    public add(tag: string): void {
        if (tag === '') { return; };
        this.tags.push({ title: tag });
        this.newTag = '';
        this.tagsChange.emit(this.tags);
    }

}
