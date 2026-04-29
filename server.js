const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const querystring = require('querystring');
const nodemailer = require('nodemailer');

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url);
    const pathname = parsedUrl.pathname;

    if (pathname === '/send-email' && req.method === 'POST') {
        let body = '';
        req.on('data', (chunk) => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const data = querystring.parse(body);
            console.log('收到预约请求:', data);
            sendEmail(data, (result) => {
                console.log('邮件发送结果:', result);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(result));
            });
        });
        return;
    }

    let filePath = '.' + pathname;
    if (filePath === './') {
        filePath = './index.html';
    }

    const extname = path.extname(filePath);
    const contentType = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon'
    }[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 File Not Found</h1>');
            } else {
                res.writeHead(500);
                res.end('Server Error: ' + error.code);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

function sendEmail(data, callback) {
    const serviceMap = {
        yangzhai: '阳宅风水',
        yinzhai: '阴宅风水',
        zeyue: '择日选时',
        mingli: '命理综合',
        qiming: '起名服务'
    };

    const methodMap = {
        onsite: '现场考察',
        video: '远程视频',
        phone: '电话/语音咨询',
        wechat: '微信沟通'
    };

    const serviceText = serviceMap[data.service] || data.service || '';
    const methodText = methodMap[data.method] || data.method || '';

    const emailBody = `【严氏风水预约邮件】

预约人：${data.name || ''}
联系电话：${data.phone || ''}
预约服务：${serviceText}
预约方式：${methodText}
期望时间：${data.preferredDate || ''}
出生日期：${data.birthdate || ''}
备注信息：${data.notes || ''}`;

    const transporter = nodemailer.createTransport({
        host: 'smtp.163.com',
        port: 465,
        secure: true,
        auth: {
            user: 'aydenyan@163.com',
            pass: 'LHhydtKFx3x856x6'
        },
        debug: true,
        logger: true
    });

    const mailOptions = {
        from: 'aydenyan@163.com',
        to: 'ga351419@163.com',
        subject: `网站用户${data.name || '访客'}预约`,
        text: emailBody
    };

    console.log('准备发送邮件, SMTP配置:', { host: 'smtp.163.com', port: 465, user: 'aydenyan@163.com' });
    console.log('邮件内容:', mailOptions);

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('邮件发送失败! 错误:', error.message);
            console.error('错误代码:', error.code);
            callback({ status: 'error', message: error.message, code: error.code });
        } else {
            console.log('邮件发送成功! MessageId:', info.messageId);
            callback({ status: 'success', message: '邮件发送成功', info: info.messageId });
        }
    });
}

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});