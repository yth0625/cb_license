const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const fetch = require('node-fetch');

const port =  process.env.cb_licnese_bot_port | '5555';
const botServer = `http://115.178.77.137:${port}`;
const token = 'sz7errj5ypgsbn885bbg1wd1na';
const mattermostServer = 'https://chat.architectgroup.com';

app.post('/cb_license', (req, res) => {
    const {trigger_id} = req.body;
    const payload = {
        trigger_id: '',
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
                    name: 'companyName',
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
                    name: 'nameUser',
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
            submit_label: 'Create',
            notify_on_cancel: false,
        }
    }
});

app.listen(port, () => console.log('app listening on port ' + port));