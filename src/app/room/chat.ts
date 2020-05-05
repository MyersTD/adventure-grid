export class ChatManager {

    Roll() {
        // Get roll parameters
        const dim = parseInt(document.getElementById('roll-dimension').getAttribute('value').substr(1), 10);
        let die: number = parseInt(document.getElementById('roll-dice').getAttribute('value'), 10);
        const mod = parseInt(document.getElementById('roll-modifier').getAttribute('value'), 10);
        const adv = document.getElementById('roll-advantage').getAttribute('value');
        let result: number;

        if (adv === 'Advantage') {

        } else if (adv === 'Disadvantage') {

        } else {

        }
        while (die) {
            result = this.GetRandom(dim) + mod;
            // Need to post to #chat-history
            --die;
        }

        // Reset to default roll.
        document.getElementById('roll-modifier').setAttribute('value', '0');
        document.getElementById('roll-dimension').setAttribute('value', 'd20');
        document.getElementById('roll-advantage').setAttribute('value', 'None');
        document.getElementById('roll-dice').setAttribute('value', '1');
        this.SetCurrentRoll();
    }

    GetRandom(range: number): number {
        return Math.floor(Math.random() * range) + 1;
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

    PostRoll() {

    }

    PostMessage() {
        const result = document.getElementById('message-text').textContent;
        if (result !== '') {
            const child = document.createElement('ion-item');
            const label = document.createElement('ion-label');
            const logItem = document.getElementById('chat-log');
            const avatar = document.createElement('ion-avatar');
            avatar.className = 'avatar';
            const image = document.createElement('img');
            image.setAttribute('src', 'https://gravatar.com/avatar/dba6bae8c566f9d4041fb9cd9ada7741?d=identicon&f=y');
            avatar.appendChild(image);
            label.textContent = result;
            child.appendChild(avatar);
            child.appendChild(label);
            logItem.appendChild(child);
            document.getElementById('message-text').setAttribute('value', '');
        }
    }
}
