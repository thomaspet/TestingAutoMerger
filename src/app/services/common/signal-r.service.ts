import { Injectable } from '@angular/core';
import * as signalR from '@aspnet/signalr';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from '@app/authService';
import { environment } from 'src/environments/environment';
import { PushMessage } from '@app/models';
import { UserDto } from '@uni-entities';

@Injectable({
    providedIn: 'root'
})
export class SignalRService {

    user: UserDto;
    userGlobalIdentity: string;
    currentCompanyKey: string;
    notifications: string[] = [];
    pushMessage$: BehaviorSubject<PushMessage> = new BehaviorSubject(null);

    connected = false;
    retryConnectionCounter = 0;

    public hubConnection: signalR.HubConnection;

    constructor(private authService: AuthService) {
        this.authService.token$.subscribe(token => {
            if (token && !this.connected) {
                this.startConnection();
            }
        });
        this.authService.authentication$.subscribe(auth => {
            if (auth && auth.user) {
                this.user = auth.user;
                this.userGlobalIdentity = auth.user.GlobalIdentity;
                this.currentCompanyKey = auth.activeCompany.Key;
            } else if (this.hubConnection) {
                this.hubConnection.stop();
                delete this.hubConnection;
            }
        });
    }

    addGlobalListener() {
        this.hubConnection.on('Notify', (message: PushMessage) => {
            if (message) {
                if (Array.isArray(message)) {
                    message = message[message.length - 1];
                }
                this.pushMessage$.next(message);
            }
        });
    }

    startConnection() {
        this.retryConnectionCounter = 0;
        this.hubConnection = new signalR.HubConnectionBuilder().withUrl(
            environment.SIGNALR_PUSHHUB_URL,
            { accessTokenFactory: () => this.authService.jwt }
        ).build();

        this.start();

        this.hubConnection.onclose(() => {
            this.connected = false;
            setTimeout(() => this.start(), 1000);
        });
    }

    async start() {
        if (!this.connected && this.hubConnection) {
            await this.hubConnection.start()
                .then(() => {
                    // console.log('SignalR connection started');
                    this.connected = true;
                    this.addGlobalListener();
                })
                .catch(err => {
                    // console.log('Error while starting SignalR connection');
                    if (this.retryConnectionCounter < 5) {
                        // console.log('DEBUG:: attempting to reconnect, attempt nr: ' + this.retryConnectionCounter);
                        setTimeout(() => this.start(), 5000);
                        this.retryConnectionCounter++;
                    } else {
                        // console.log('Tried to reconnect too many times');
                        delete this.hubConnection;
                    }
            });
        }
    }
}
