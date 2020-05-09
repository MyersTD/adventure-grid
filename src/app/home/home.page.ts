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
          this.alertCtrl.create({
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

    ionViewDidEnter() : void 
    {
      this.request.GetAllSessions((data) => {
        if (data) {
          this.sessions = JSON.parse(data);
          console.log(data);
        }
        else {this.sessions.push({'sid': 'No sessions available'})}
      })
    }
    
    enterServer(e, session) {
      this.router.navigate(['room', {'id': session.sid, 'sname': session.sname}])
    }

    createSession() {
      let id = Math.floor(Math.random() * 100000000)
      this.alertCtrl.create({
        inputs: [
          {
            name: 'name',
            placeholder: 'Server Name'
          }
        ],
        buttons: [
          {
            text: 'Done',
            handler: data => {
              this.request.CreateSession(id, data.name, (response) => {
                try {
                  this.router.navigate(['room', {'id': id, 'sname': data.name}]);
                } catch {
                  console.log('no function')
                }
              })
            }
          }
        ],
        
      }).then((al) => {
        al.present();
      })
    }

    goHome() {
      this.router.navigate(['home'])
    }
}
