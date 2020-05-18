import { Storage } from '@ionic/storage'
import { AlertController } from '@ionic/angular';

export class ChatManager {

    public hideChatBox = false;
    public hideRollBox = false;

    public nickName;
    public sync;

    constructor(private storage: Storage, private alertCtrl: AlertController) {
        this.storage.get('nickname').then((nickname) => {
            if (nickname) {
                this.nickName = nickname;
            } else {
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

    ToggleRoll() {
        this.hideRollBox = !this.hideRollBox;
        if (this.hideRollBox) {
            document.getElementById('chat-history').style.maxHeight = "1027px";
        } else {
            document.getElementById('chat-history').style.maxHeight = "350px";
        }
    }

    ToggleChat() {
        this.hideChatBox = !this.hideChatBox;
    }

    Roll() {
        // Get roll parameters
        const dim = document.getElementById('roll-dimension').getAttribute('value');
        const die = document.getElementById('roll-dice').getAttribute('value');
        const mod = document.getElementById('roll-modifier').getAttribute('value');
        const adv = document.getElementById('roll-advantage').getAttribute('value');

        let result: string;
        let answer: string;
        if (adv !== 'None') {
            result = 'Rolling ' + dim;
        } else {
            result = 'Rolling ' + die + dim;
        }
        let intResult = 0;
        let intRoll = 0;
        let intRollTwo = 0;

        if (mod !== '0') {
            if (parseInt(mod, 10) > 0) {
                result += '+' + mod;
            } else {
                result += mod;
            }
        }
        if (adv !== 'None') {
            result += ' w/ ' + adv;
        }
        result += ':  ';

        const dimInt = parseInt(dim.substr(1), 10);
        let dieInt = parseInt(die, 10);

        if (adv !== 'None') {
            intRoll = this.GetRandom(dimInt) + parseInt(mod, 10);
            intRollTwo = this.GetRandom(dimInt) + parseInt(mod, 10);
            if (intRoll === intRollTwo) {
                result += intRoll.toString() + ' = ' + intRollTwo.toString();
                answer = intRoll.toString();
            } else if (adv === 'Advantage') {
                result += (intRoll < intRollTwo ? intRoll.toString() + ' < ' + intRollTwo.toString() :
                    intRollTwo.toString() + ' < ' + intRoll.toString());
                answer = (intRoll < intRollTwo ? intRollTwo.toString() : intRoll.toString());
            } else {
                result += (intRoll < intRollTwo ? intRollTwo.toString() + ' > ' + intRoll.toString() :
                    intRoll.toString() + ' > ' + intRollTwo.toString());
                answer = (intRoll < intRollTwo ? intRoll.toString() : intRollTwo.toString());
                }
        } else {
            while (dieInt) {
                intRoll = this.GetRandom(dimInt);
                intResult += intRoll;
                result += intRoll.toString() + ' + ';
                --dieInt;
            }
            if (parseInt(mod, 10) <= 0 || (die === '1' && mod === '0')) {
                // Get rid of the last plus sign
                result = result.substr(0, result.length - 2);
            }
            if (mod !== '0') {
                intResult += parseInt(mod, 10);
                result += mod + ' ';
            }
            answer = intResult.toString();
        }
        if (adv === 'None' && (die !== '1' || parseInt(mod, 10) !== 0)) {
            result += '= ';
        }
        this.PostRoll(result, answer);

        // Reset to default roll.
        document.getElementById('roll-modifier').setAttribute('value', '0');
        document.getElementById('roll-dimension').setAttribute('value', 'd20');
        document.getElementById('roll-advantage').setAttribute('value', 'None');
        document.getElementById('roll-dice').setAttribute('value', '1');
        this.SetCurrentRoll();
    }

    GetRandom(range: number): number {
        return (Math.floor(Math.random() * range) + 1);
    }

    SetDie(newValue: any) {
        document.getElementById('roll-dice').setAttribute('value', newValue.detail.value);
        this.SetCurrentRoll();
    }

    SetDim(newValue: any) {
        document.getElementById('roll-dimension').setAttribute('value', newValue.detail.value);
        this.SetCurrentRoll();
    }

    SetMod(newValue: any) {
        document.getElementById('roll-modifier').setAttribute('value', newValue.detail.value);
        this.SetCurrentRoll();
    }

    SetAdv(newValue: any) {
        document.getElementById('roll-advantage').setAttribute('value', newValue.detail.value);
        this.SetCurrentRoll();
    }

    SetCurrentRoll(): void {
        const mod = document.getElementById('roll-modifier').getAttribute('value');
        const dim = document.getElementById('roll-dimension').getAttribute('value');
        const adv = document.getElementById('roll-advantage').getAttribute('value');
        const die = document.getElementById('roll-dice').getAttribute('value');
        let result = 'Roll ' + die + ' ' + dim;

        if (mod !== '0') {
            if (parseInt(mod, 10) > 0) {
                result += ' +' + mod;
            } else {
                result += ' ' + mod;
            }
        }
        if (adv !== 'None') {
            result += ' with ' + adv;
        }

        document.getElementById('roll-button').textContent = result;
    }

    SubscribeMessage(data) {
        const chatLog = document.getElementById('chat-log');
        const item = document.createElement('ion-item');
        const message = document.getElementById('message-template').cloneNode(false);

        message.textContent = data.nickname + ': ' + data.message;
        item.appendChild(message);
        chatLog.appendChild(item);
    }

    SubscribeRoll(data) {
        const chatLog = document.getElementById('chat-log');
        const item = document.createElement('ion-item');
        const message = document.getElementById('message-template').cloneNode(false);
        const rollResult = document.getElementById('roll-result').cloneNode(false);

        message.textContent = data.nickname + ': ' + data.message;
        rollResult.textContent = data.roll;
        item.appendChild(message);
        item.appendChild(rollResult);
        chatLog.appendChild(item);
    }

    PostRoll(result: string, answer: string): void {
        const chatLog = document.getElementById('chat-log');
        const newRoll = document.createElement('ion-item');
        const avatar = document.getElementById('avatar-template').cloneNode(true);
        const message = document.getElementById('message-template').cloneNode(false);
        const rollResult = document.getElementById('roll-result').cloneNode(false);

        message.textContent = this.nickName + ': ' + result;
        rollResult.textContent = answer;

        //newRoll.appendChild(avatar);
        newRoll.appendChild(message);
        newRoll.appendChild(rollResult);
        chatLog.appendChild(newRoll);
        this.sync.SendRoll(this.nickName, result, answer);
    }

    PostMessage() {
        // Get the message text
        const result = document.getElementById('message-text').textContent;

        // As long as the message text isn't blank, we'll insert it into the chat log
        if (result !== '') {
            // Get #chat-log and clone a template child to work from
            const chatLog = document.getElementById('chat-log');
            const item = document.createElement('ion-item');
            const message = document.getElementById('message-template').cloneNode(false);
            message.textContent = this.nickName + ': ' + result;
            
            // Append it to #chat-log
            item.appendChild(message);
            chatLog.appendChild(item);
            this.sync.SendMessage(this.nickName, result);

            // Reset the message textarea field
            document.getElementById('message-text').setAttribute('value', '');
        }
    }
}
