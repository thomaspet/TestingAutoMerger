import { Uniform2Component } from '@uni-framework/ui/uniform2/uniform2/uniform2.component';
import { KeyCodes } from '@app/services/common/keyCodes';
import { Directive, EventEmitter, Host, Output, Self } from '@angular/core';
import { hasEvent, runEvent } from '@uni-framework/ui/uniform2/uniform2/custom-events.helpers';

@Directive({
    selector: '[appWithNavigation]'
})
export class UniForm2NavigationDirective {

    numFields = 0;
    fieldsChange = false;
    navigationList = [];

    @Output() moveForwardEvent = new EventEmitter();
    @Output() moveBackwardEvent = new EventEmitter();

    constructor(@Host() public host: Uniform2Component) {

    }

    ngAfterViewInit() {
        if (this.host.fieldsList.length > 0) {
            this.listenForFields(this.host.fieldsList.toArray());
        }
        this.host.fieldsList.changes.subscribe(fields => {
            this.listenForFields(fields);
        });
        if (this.host.fieldsetsList.length > 0) {
            this.listenForFieldsets(this.host.fieldsetsList.toArray());
        }
        this.host.fieldsetsList.changes.subscribe(fieldsets => {
            this.listenForFieldsets(fieldsets);
        });
        if (this.host.sectionsList.length > 0) {
            this.listenForSections(this.host.sectionsList.toArray());
        }
        this.host.sectionsList.changes.subscribe(sections => {
            this.listenForSections(sections);
        });
        this.host.keyDownEvent.subscribe(event => {
            this.listenForNavigationKeys(event);
        });
    }

    get allElementsReady() {
        return this.numFields > 0
            && this.host.fields
            && this.numFields === this.host.fields.length;
    }

    listenForFields(fields) {
        if (!this.fieldsChange) {
            this.numFields = 0;
        }
        this.fieldsChange = true;
        fields.forEach(field => {
            const index = this.host.fields.indexOf(field.field);
            this.navigationList[index] = field;
            this.numFields++;
        });
        if (this.allElementsReady) {
            if (this.host.currentComponent && !this.host.currentComponent.config.Hidden) {
                this.host.currentComponent.focusInput();
                return;
            }
            const index = this.host.fields.findIndex(item => !item.Hidden);
            this.navigationList[index].component.focusInput();
            this.fieldsChange = false;

        }
    }

    listenForFieldsets(fieldsets) {
        if (!this.fieldsChange) {
            this.numFields = 0;
        }
        this.fieldsChange = true;
        fieldsets.forEach((fs) => {
            fs.fieldsList.forEach((field) => {
                const index = this.host.fields.indexOf(field.field);
                this.navigationList[index] = field;
                this.numFields++;
            });
        });
        if (this.allElementsReady) {
            if (this.host.currentComponent && !this.host.currentComponent.config.Hidden) {
                this.host.currentComponent.focusInput();
                return;
            }
            const index = this.host.fields.findIndex(item => !item.Hidden);
            this.navigationList[index].component.focusInput();
            this.fieldsChange = false;
        }
    }

    listenForSections(sections) {
        if (!this.fieldsChange) {
            this.numFields = 0;
        }
        this.fieldsChange = true;
        sections.forEach(section => {
            section.fieldsetsList.forEach(fieldset => {
                fieldset.fieldsList.forEach(field => {
                    const index = this.host.fields.indexOf(field.field);
                    this.navigationList[index] = field;
                    this.numFields++;
                });
            });
            section.fieldsList.changes.subscribe(fields => {
                fields.forEach(field => {
                    const index = this.host.fields.indexOf(field.field);
                    this.navigationList[index] = field;
                    this.numFields++;
                });
            });
        });
        if (this.allElementsReady) {
            if (this.host.currentComponent && !this.host.currentComponent.config.Hidden) {
                this.host.currentComponent.focusInput();
                return;
            }
            const index = this.host.fields.findIndex(item => !item.Hidden);
            this.navigationList[index].component.focusInput();
            this.fieldsChange = false;
        }
    }

    emitMovementEvent(to, from, direction) {
        const eventInfo = {
            from: from,
            to: to
        };
        switch (direction) {
            case 'forward':
                this.moveForwardEvent.emit(eventInfo);
                break;
            case 'backward':
                this.moveBackwardEvent.emit(eventInfo);
                break;
        }
        this.host.currentComponent = to === null ? null : to.component;
    }

    listenForNavigationKeys(event: KeyboardEvent) {
        if (!this.host.currentComponent) {
            console.warn('uniform navigation: host not found');
            return;
        }
        const events = this.host.currentComponent.config.Options && this.host.currentComponent.config.Options.events;
        if (hasEvent(events || [], event)) {
            runEvent(events, event, this.host.model, this.host);
        } else if (event.which === KeyCodes.TAB || event.which === KeyCodes.ENTER) {
            let index = this.navigationList.findIndex(item => {
                if (!item) {
                    return false;
                }
                return item.component === this.host.currentComponent;
            });
            let moveForward = true;
            if (event.shiftKey) {
                moveForward = false;
            }
            const direction = moveForward ? 'forward' : 'backward';
            if (index === this.navigationList.length - 1 && moveForward) {
                const from = this.navigationList[index];
                const to = null;
                this.emitMovementEvent(to, from, direction);
                return;
            }
            if (index === 0 && moveForward === false) {
                const from = this.navigationList[0];
                const to = null;
                this.emitMovementEvent(to, from, direction);
                return;
            }
            event.preventDefault();
            event.stopPropagation();
            if (this.host.currentComponent !== null && this.navigationList.length > 0) {
                if (index >= 0 && index < this.navigationList.length) {
                    const initialIndex = index;
                    do {
                        if (moveForward) {
                            index = index + 1;
                        } else {
                            index = index - 1;
                        }
                        if (this.navigationList[index]) {
                            this.host.currentComponent = this.navigationList[index].component;
                        }
                    } while (this.host.fields[index].Hidden);
                    const from = this.navigationList[initialIndex];
                    const to = this.navigationList[index];
                    this.emitMovementEvent(to, from, direction);
                    if (to !== null && this.host.fields[index].section) {
                        const section = this.host.sectionsList.find((s) => {
                            return s.fields[0].id === this.host.fields[index].section;
                        });
                        if (!section.isOpen) {
                            section.open();
                        }
                    }
                    this.host.currentComponent.focusInput();
                }
            }
        }
    }
}
