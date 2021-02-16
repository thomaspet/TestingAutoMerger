import {
    Injectable,
    ApplicationRef,
    ComponentRef,
    ComponentFactoryResolver,
    EmbeddedViewRef,
    Injector,
    Type
} from '@angular/core';
import {UniUnsavedChangesModal} from './modals/unsavedChangesModal';
import {UniConfirmModalV2} from './modals/confirmModal';
import {Observable, fromEvent, Subscription, of} from 'rxjs';
import {ConfirmActions, IModalOptions, IUniModal } from '@uni-framework/uni-modal/interfaces';
import {take, timeout, switchMap, catchError, filter} from 'rxjs/operators';

@Injectable()
export class UniModalService {
    private openModalRefs: ComponentRef<IUniModal>[] = [];
    private containerElement: HTMLElement;
    private clickOutsideSubscription: Subscription;

    constructor(
        private applicationRef: ApplicationRef,
        private factoryResolver: ComponentFactoryResolver,
        private injector: Injector
    ) {
        this.createContainer();

        fromEvent(document, 'keydown').subscribe((event: KeyboardEvent) => {
            const key = event.which || event.keyCode;
            if (this.openModalRefs.length && key === 27) {
                const activeModal = this.openModalRefs[this.openModalRefs.length - 1];
                if (activeModal.instance.options.closeOnEscape !== false) {
                    this.forceClose(activeModal);
                }
            }
        });
    }

    public forceClose(modalRef: ComponentRef<IUniModal>): void {
        const options = modalRef && modalRef.instance.options || {};

        const closeFn = () => {
            if (modalRef.instance.forceCloseValueResolver) {
                modalRef.instance.onClose.emit(modalRef.instance.forceCloseValueResolver());
            } else if (options.hasOwnProperty('cancelValue')) {
                modalRef.instance.onClose.emit(options.cancelValue);
            } else {
                modalRef.instance.onClose.emit(null);
            }

            if (this.clickOutsideSubscription) {
                this.clickOutsideSubscription.unsubscribe();
            }
        };

        if (modalRef.instance.canDeactivate) {
            const canClose = modalRef.instance.canDeactivate();
            if (canClose instanceof Observable) {
                canClose.subscribe(allowed => {
                    if (allowed) {
                        closeFn();
                    }
                });
            } else if (canClose) {
                closeFn();
            }
        } else {
            closeFn();
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

    public openRejectChangesModal(): IUniModal {
        return this.confirm({
            header: 'Ulagrede endringer',
            message: 'Du har ulagrede endringer. Forkaste?',
            buttonLabels: {
                reject: 'Forkast',
                cancel: 'Avbryt'
            },
            closeOnClickOutside: false,
            closeOnEscape: false
        });
    }

    public openUnsavedChangesModal(acceptButtonText: string = 'Lagre'): IUniModal {
        return this.confirm({
            header: 'Ulagrede endringer',
            message: 'Du har ulagrede endringer. Ønsker du å lagre?',
            buttonLabels: {
                accept: acceptButtonText,
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
        setTimeout(() => {
            componentRef.instance.onClose.complete();
        });

        const index = this.openModalRefs.findIndex(ref => ref === componentRef);
        componentRef.destroy();

        if (index >= 0) {
            this.openModalRefs.splice(index, 1);

            // Remove backdrop
            const backdropElements = this.containerElement.querySelectorAll('.uni-modal-backdrop');
            this.containerElement.removeChild(backdropElements.item(index));

            // Remove modalOpen class from body to allow scroll again
            if (!this.openModalRefs || !this.openModalRefs.length) {
                document.body.classList.remove('modal-open');
            }
        }
    }

    private createModal(modal: Type<IUniModal>, options: IModalOptions): ComponentRef<IUniModal> {
        const componentRef = this.compileModal(modal, options || {});
        const componentRootNode = (componentRef.hostView as EmbeddedViewRef<any>)
            .rootNodes[0] as HTMLElement;

        const dialogElement = componentRootNode.querySelector('.uni-modal');
        if (dialogElement) {
            dialogElement.setAttribute('open', 'true');

            // Add close button
            if (!options || !options.hideCloseButton) {
                const header = dialogElement.querySelector('header');

                if (header && !header.querySelector('.close-button')) {
                    const closeBtn = document.createElement('i');
                    closeBtn.classList.add('material-icons', 'close-button');
                    closeBtn.setAttribute('role', 'button');
                    closeBtn.innerText = 'close';
                    closeBtn.onclick = () => this.forceClose(componentRef);

                    header.appendChild(closeBtn);
                }
            }

            // Add classes from options
            if (options.class) {
                dialogElement.classList.add(...options.class.split(' '));
            }
        }

        const backdrop = this.createBackdrop(options);
        backdrop.appendChild(componentRootNode);

        // Set class modal-open on body to prevent background scroll
        // when scrolling modal
        document.body.classList.add('modal-open');

        return componentRef;
    }

    /** Injects a new UniModal into the container and returns it's ComponentRef */
    private compileModal(modal: Type<IUniModal>, options: IModalOptions): ComponentRef<IUniModal> {
        const factory = this.factoryResolver.resolveComponentFactory(modal);
        const componentRef = factory.create(this.injector);

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
        const backdrop = document.createElement('section');
        backdrop.classList.add('uni-modal-backdrop');

        if (options.closeOnClickOutside !== false) {

            /*
                Instead of simply subscribing to click events we subscribe to mousedown events,
                verify that the event target is the backdrop and then switchMap
                to the mouseup event, which causes the modal to close.

                This way we ensure that the click started and ended outside the dialog,
                and avoid an annoying bug where mousedrags that started inside but ended outside
                (for example while marking text) would cause it to close.
            */
            this.clickOutsideSubscription =  fromEvent(backdrop, 'mousedown').pipe(
                filter(event => (event.target || event.srcElement) === backdrop),
                switchMap(() => fromEvent(backdrop, 'mouseup').pipe(take(1))),
            ).subscribe(event => {
                if (event && (event.target || event.srcElement) === backdrop) {
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
        const container = document.createElement('section');
        container.classList.add('uni-modal-container');
        container.id = 'uni-modal-container';

        document.body.appendChild(container);
        this.containerElement = container;
    }
}
