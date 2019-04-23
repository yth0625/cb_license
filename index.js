const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const rp = require('request-promise');
const dateFormat = require('dateformat');

const port =  process.env.cb_licnese_bot_port | '5555';

const mattermostChannel = '';
const token = '';

const botServer = ``;
const mattermostServer = '';
const cbLicenseServer = '';

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({'extended': 'true'}))

app.post('/cb_license', (req, res) => {

    if(req.body.channel_id !== mattermostChannel) {
        res.send({response_type: 'in_channel', text: '해당 봇은 코드비머 라이센스 발급 채널에서만 사용 가능합니다.'});
        return;
    }

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
                           value:"ALM"
                        },
                        {
                            text:"Collab",
                            value:"Collab"
                        },
                        {
                            text:"RM",
                            value:"RM"
                        },
                        {
                            text:"QA-Test",
                            value:"QA-Test"
                        }
                     ]
                },
                {
                    display_name: 'Named User',
                    name: 'namedUser',
                    type: 'text',
                    default: '0',
                    help_text: 'Named 라이센스 수를 입력해주세요.',
                    optional: false,
                },
                {
                    display_name: 'Floating User',
                    name: 'floatingUser',
                    type: 'text',
                    default: '0',
                    help_text: 'Floating 라이센스 수를 입력해주세요.',
                    optional: false,
                },
                {
                    display_name: 'Addition Options',
                    name: 'additionOptions',
                    type: 'text',
                    default: 'TTTTTTT',
                    help_text: "Variant Management, Document Review, Service Desk, Escalation, Branching, Doors bridge, Jira integration 순서입니다. T = true, F = false",
                    optional: false,
                }
            ],
            submit_label: 'OK'
        }
    };

    let options = {
        url: `${mattermostServer}/api/v4/actions/dialogs/open`,
        headers: {
           'Authorization': `Bearer ${token}` 
        },
        method: 'POST',
        json: payload
    };

    rp(options)
        .then(res => res.send())
        .catch(err => res.send({ ephemeral_text: '에러 발생: ' + err }));
});

app.post('/issued', (req, res) => {
    const {submission} = req.body;

    let options = {
        url: cbLicenseServer,
        headers: {
            'Content-Type': 'application/json' 
        },
        method: 'POST',
        json: submission
    };

    rp(options)
        .then(data => {
            let now = new Date();
            const fileName = dateFormat(now, 'yyyymmdd') + 
                (submission.namedUser > 0 ? '_N_' + submission.namedUser : '') + (submission.floatingUser > 0 ? '_F_' + submission.floatingUser : '') + '_' + submission.hostId + '.txt';

            if (data.licenseCode) {
                    options.url = mattermostServer + '/api/v4/files';
                    options.headers.Authorization = `Bearer ${token}`;
                    options.headers['Content-Type'] = 'multipart/form-data;';
                    delete options.json;
                    options.json = true;

                    options.formData = { 
                        files: { 
                            value: data.licenseCode,
                            options: { filename: fileName, contentType: null } 
                        },
                        channel_id: mattermostChannel 
                    };

                    rp(options)
                        .then(data => {
                            const fileID = data.file_infos[0].id;
                            options.headers['Content-Type'] = 'application/json';
                            delete options.formData
                            options.url = mattermostServer + '/api/v4/posts';
                            options.json = {
                                channel_id: mattermostChannel,
                                file_ids: [fileID],
                                props: {
                                    attachments: [
                                            {
                                                title: submission.company + " 의 코드비머 라이센스 발급이 완료 되었습니다.",
                                                fields: [
                                                    {
                                                        title: "만료일",
                                                        value: submission.expiredDate,
                                                        short: false
                                                    },
                                                    {
                                                        title: "Named License 인원",
                                                        value: submission.namedUser,
                                                        short: true
                                                    },
                                                    {
                                                        title: "Floating Licnese 인원",
                                                        value: submission.floatingUser,
                                                        short: true
                                                    }
                                                ]
                                            }
                                        ]
                                }
                            }

                            rp(options)
                                .then(res => console.log(res))
                                .catch(err => console.log(err));
                        })
            } 
            else {
                const errorMessages = Object.values(data.fieldErrors).map(a => a + "\n").join().replace(/,/g, '');

                options.url = mattermostServer + '/api/v4/posts';
                options.headers.Authorization = `Bearer ${token}`;
                options.json = {
                    channel_id: mattermostChannel,
                    message: errorMessages
                };

                rp(options)
                    .then(res => console.log(res))
                    .catch(err => console.log(err));
            }
        })

    res.send();
});

app.listen(port, () => console.log('app listening on port ' + port));