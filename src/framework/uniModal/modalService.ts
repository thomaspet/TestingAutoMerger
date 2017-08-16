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
    UniConfirmModalV2
} from './barrel';

export interface IModalOptions {
    data?: any;
    class?: string;
    header?: string;
    message?: string;
    warning?: string;
    closeOnClickOutside?: boolean;
    buttonLabels?: {
        accept?: string;
        reject?: string;
        cancel?: string;
    };
    modalConfig?: any;
    activateClickOutside?: boolean;
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
    }

    public open(modal: Type<IUniModal>, options: IModalOptions = {}): IUniModal {
        const componentRef = this.createModal(modal, options);
        return componentRef.instance;
    }

    // TODO: remove this after everyone has migrated to the new method
    public deprecated_openUnsavedChangesModal(): IUniModal {
        const componentRef = this.createModal(UniUnsavedChangesModal, {});
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
            }
        });
    }

    public confirm(options: IModalOptions) {
        const componentRef = this.createModal(UniConfirmModalV2, options);
        return componentRef.instance;
    }

    public close(componentRef: ComponentRef<IUniModal>): void {
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
                    componentRef.instance.onClose.emit();
                };

                header.appendChild(button);
            }

            // Add classes from options
            if (options.class) {
                dialogElement.classList.add(...options.class.split(' '));
            }
        }

        let backdrop = this.createBackdrop();
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
            this.close(componentRef);
        });

        this.openModalRefs.push(componentRef);
        this.applicationRef.attachView(componentRef.hostView);

        return componentRef;
    }

    /** Creates a backdrop element, appends it to our container and returns it */
    private createBackdrop(): Element {
        let backdrop = document.createElement('section');
        backdrop.classList.add('uni-modal-backdrop');
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
