import { Component, ViewChild, ElementRef } from '@angular/core';
import { Base64ToGallery, Base64ToGalleryOptions } from '@ionic-native/base64-to-gallery/ngx';
import { Platform, ToastController} from '@ionic/angular'; 
import { NumberSymbol } from '@angular/common';
import { Scroll, Router } from '@angular/router';
import { CONTEXT_NAME } from '@angular/compiler/src/render3/view/util';
import { ThrowStmt } from '@angular/compiler';
import { sizeof } from '../sizeof.compressed';
import { Storage, IonicStorageModule } from '@ionic/storage';
import { Request } from '../requests';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  providers: [Request]
})
export class HomePage {
    @ViewChild('canvas', {static: false}) canvasEl : ElementRef;
    @ViewChild('bgcanvas', {static: false}) bgCanvasEl : ElementRef;
  
    s_id: any;
    sessions: Array<any>

    constructor(private storage: Storage, private request: Request, private router: Router) {
      this.sessions = new Array<any>();
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
}
