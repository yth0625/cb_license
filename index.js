const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const fetch = require('node-fetch');

const port =  process.env.cb_licnese_bot_port | '5555';
const botServer = `http://115.178.77.137:${port}`;
const token = 'sz7errj5ypgsbn885bbg1wd1na';
const mattermostServer = 'https://chat.architectgroup.com';
const cbLicenseServer = 'http://115.178.77.223:8081/cb/api/createLicense';

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({'extended': 'true'}))

app.post('/cb_license', (req, res) => {
    const {trigger_id} = req.body;
    const payload = {
        trigger_id: trigger_id,
        url: `${botServer}/issued`,
        dialog: {
            title: 'cb-license',
            elements: [
                {
                    display_name: 'Host-ID',
                    name: 'hostId',
                    type: 'text',
                    placeholder: '[LIN/WIN-Mac address] 형태로 입력해주세요',
                    optional: false,
                },
                {
                    display_name: 'Company Name',
                    name: 'company',
                    type: 'text',
                    default: 'SLEXN',
                    optional: false,
                },
                {
                    display_name: 'Expired Date',
                    name: 'expiredDate',
                    type: 'text',
                    placeholder: '라이센스 마감날짜를 입력해주세요 ex)20991231',
                    optional: false,
                },
                {
                    display_name: 'License Type',
                    name: 'licenseType',
                    type: 'select',
                    placeholder: 'Select license type',
                    optional: false,
                    options:[
                        {
                           text:"ALM",
                           value:"alm"
                        },
                        {
                            text:"Collab",
                            value:"collab"
                        },
                        {
                            text:"RM",
                            value:"rm"
                        },
                        {
                            text:"QA-Test",
                            value:"qa-test"
                        }
                     ]
                },
                {
                    display_name: 'Named User',
                    name: 'namedUser',
                    type: 'text',
                    placeholder: 'Named 라이센스 수를 입력해주세요.',
                    optional: false,
                },
                {
                    display_name: 'Floating User',
                    name: 'floatingUser',
                    type: 'text',
                    placeholder: 'Floating 라이센스 수를 입력해주세요.',
                    optional: false,
                }
            ],
            submit_label: 'OK'
        }
    }

    let options = {
        headers: {
           'Authorization': `Bearer ${token}` 
        },
        method: 'POST',
        body: JSON.stringify(payload)
    };

    fetch(`${mattermostServer}/api/v4/actions/dialogs/open`, options)
        .then(res => res.json())
        .then(json => {
            console.log(json)
            res.send();
        })
        .catch(err => res.send({ ephemeral_text: '에러 발생: ' + err }));
});

app.post('/issued', (req, res) => {
    const {submission} = req.body;

    let options = {
        headers: {
            'Content-Type': 'application/json' 
        },
        method: 'POST',
        body: JSON.stringify(submission)
    };

    fetch(cbLicenseServer, options)
        .then(res => console.log(res))
        .catch(err => console.log(JSON.parse(err)))
});

app.listen(port, () => console.log('app listening on port ' + port)); 