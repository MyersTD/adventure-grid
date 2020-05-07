import { Component, ViewChild, ElementRef } from '@angular/core';
import { Platform, ToastController, AlertController} from '@ionic/angular'; 
import { Scroll, Router } from '@angular/router';
import { Storage, IonicStorageModule } from '@ionic/storage';
import { Request } from '../requests';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  providers: [Request]
})
export class HomePage {
    s_id: any;
    sessions: Array<any>

    constructor(private storage: Storage, private request: Request, private router: Router, private alertCtrl: AlertController) {
      this.sessions = new Array<any>();
      this.storage.get('nickname').then((nickname) => {
        console.log(nickname)
        if (nickname == null) {
          let alert = this.alertCtrl.create({
            inputs: [
              {
                name: 'nickname',
                placeholder: 'nickname'
              }
            ],
            buttons: [
              {
                text: 'Done',
                handler: data => {
                  this.storage.set('nickname', data.nickname);
                }
              }
            ],
            
          }).then((al) => {
            al.present();
          })
        }
      })
    }
  
    SetNickname(nick) {
      console.log(nick)
      this.storage.set('nickname', nick);
    }

    socketConnect() {

    }

    ionViewDidEnter() : void 
    {
      this.request.GetAllSessions((data) => {
        if (data) {
          this.sessions = JSON.parse(data);
        }
        else {this.sessions.push({'sessionid': 'No sessions available'})}
      })
    }
    
    enterServer(e, session) {
      this.router.navigate(['room', {'id': session.sessionid}])
    }

    createSession() {
      let id = Math.floor(Math.random() * 100000000)
      this.request.CreateSession(id, '', (response) => {
        this.router.navigate(['room', {'id': id}]);
      })
    }

    goHome() {
      this.router.navigate(['home'])
    }
}
