import {
    Injectable,
    ApplicationRef,
    ComponentRef,
    ComponentFactoryResolver,
    EmbeddedViewRef,
    Injector,
    EventEmitter,
    Type
} from '@angular/core';
import {
    UniUnsavedChangesModal,
    UniConfirmModalV2,
    ConfirmActions
} from './barrel';
import {Observable} from 'rxjs/Observable';

export interface IModalOptions {
    data?: any;
    class?: string;
    header?: string;
    message?: string;
    warning?: string;
    buttonLabels?: {
        accept?: string;
        reject?: string;
        cancel?: string;
    };
    cancelValue?: any;
    modalConfig?: any;
    activateClickOutside?: boolean; // removeMe?
    closeOnClickOutside?: boolean;
    closeOnEscape?: boolean;
}

export interface IUniModal {
    onClose: EventEmitter<any>;
    options?: IModalOptions;
}

@Injectable()
export class UniModalService {
    private openModalRefs: ComponentRef<IUniModal>[] = [];
    private containerElement: HTMLElement;

    constructor(
        private applicationRef: ApplicationRef,
        private factoryResolver: ComponentFactoryResolver,
        private injector: Injector
    ) {
        this.createContainer();

        Observable.fromEvent(document, 'keydown').subscribe((event: KeyboardEvent) => {
            const key = event.which || event.keyCode;
            if (this.openModalRefs.length && key === 27) {
                let activeModal = this.openModalRefs[this.openModalRefs.length - 1];
                if (activeModal.instance.options.closeOnEscape !== false) {
                    this.forceClose(activeModal);
                }
            }
        });
    }

    public forceClose(modalRef: ComponentRef<IUniModal>): void {
        let options = modalRef && modalRef.instance.options || {};

        if (options.hasOwnProperty('cancelValue')) {
            modalRef.instance.onClose.emit(options.cancelValue);
        } else {
            modalRef.instance.onClose.emit(null);
        }
    }

    public open(modal: Type<IUniModal>, options: IModalOptions = {}): IUniModal {
        const componentRef = this.createModal(modal, options);
        return componentRef.instance;
    }

    // TODO: remove this after everyone has migrated to the new method
    public deprecated_openUnsavedChangesModal(): IUniModal {
        const componentRef = this.createModal(UniUnsavedChangesModal, {
            cancelValue: false,
            closeOnClickOutside: false,
            closeOnEscape: false
        });

        return componentRef.instance;
    }

    public openUnsavedChangesModal(): IUniModal {
        return this.confirm({
            header: 'Ulagrede endringer',
            message: 'Du har ulagrede endringer. Ønsker du å lagre?',
            buttonLabels: {
                accept: 'Lagre',
                reject: 'Forkast',
                cancel: 'Avbryt'
            },
            closeOnClickOutside: false,
            closeOnEscape: false
        });
    }

    public confirm(options: IModalOptions = {}) {
        if (!options.hasOwnProperty('cancelValue')) {
            options.cancelValue = ConfirmActions.CANCEL;
        }

        options.closeOnClickOutside = options.closeOnClickOutside || false;
        options.closeOnEscape = options.closeOnEscape || false;

        const componentRef = this.createModal(UniConfirmModalV2, options);
        return componentRef.instance;
    }

    public onModalClosed(componentRef: ComponentRef<IUniModal>): void {
        let index = this.openModalRefs.findIndex(ref => ref === componentRef);
        componentRef.destroy();

        if (index >= 0) {
            this.openModalRefs.splice(index, 1);

            // Remove backdrop
            const backdropElements = this.containerElement.querySelectorAll('.uni-modal-backdrop');
            this.containerElement.removeChild(backdropElements.item(index));
        }
    }

    private createModal(modal: Type<IUniModal>, options: IModalOptions): ComponentRef<IUniModal> {
        let componentRef = this.compileModal(modal, options || {});
        let componentRootNode = (componentRef.hostView as EmbeddedViewRef<any>)
            .rootNodes[0] as HTMLElement;

        let dialogElement = componentRootNode.querySelector('dialog');
        if (dialogElement) {
            dialogElement.setAttribute('open', 'true');

            // Add close button
            let header = dialogElement.querySelector('header');
            if (header) {
                let button = document.createElement('button');
                button.classList.add('modal-close-button');
                button.onclick = (event) => {
                    this.forceClose(componentRef);
                };

                header.appendChild(button);
            }

            // Add classes from options
            if (options.class) {
                dialogElement.classList.add(...options.class.split(' '));
            }
        }

        componentRootNode.style.margin = '0 auto';
        let backdrop = this.createBackdrop(options);
        backdrop.appendChild(componentRootNode);

        return componentRef;
    }

    /** Injects a new UniModal into the container and returns it's ComponentRef */
    private compileModal(modal: Type<IUniModal>, options: IModalOptions): ComponentRef<IUniModal> {
        const factory = this.factoryResolver.resolveComponentFactory(modal);
        let componentRef = factory.create(this.injector);

        componentRef.instance['contentComponent'] = modal;
        componentRef.instance['options'] = options || {};
        componentRef.instance['modalService'] = this;

        componentRef.instance.onClose.subscribe(() => {
            this.onModalClosed(componentRef);
        });

        this.openModalRefs.push(componentRef);
        this.applicationRef.attachView(componentRef.hostView);

        return componentRef;
    }

    /** Creates a backdrop element, appends it to our container and returns it */
    private createBackdrop(options: IModalOptions): Element {
        let backdrop = document.createElement('section');
        backdrop.classList.add('uni-modal-backdrop');

        // Check specifically for false because we want this on by default
        if (options.closeOnClickOutside !== false) {
            backdrop.addEventListener('click', (event: MouseEvent) => {
                event.stopPropagation();
                let target = event.target || event.srcElement;

                // Make sure we don't close on events that propagated from the modal,
                // only clicks directly on the backdrop
                if (target === backdrop) {
                    const activeModal = this.openModalRefs[this.openModalRefs.length - 1];
                    this.forceClose(activeModal);
                }
            });
        }

        this.containerElement.appendChild(backdrop);

        return backdrop;
    }

    /** Creates a container element for our modals */
    private createContainer(): void {
        let container = document.createElement('section');
        container.classList.add('uni-modal-container');
        container.id = 'uni-modal-container';

        document.body.appendChild(container);
        this.containerElement = container;
    }
}
