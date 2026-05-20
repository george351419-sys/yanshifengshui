const nodemailer = require('nodemailer');

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

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ status: 'error', message: '无效请求' });
  }

  let data = {};
  if (req.body) {
    if (typeof req.body === 'string') {
      new URLSearchParams(req.body).forEach((v, k) => { data[k] = v; });
    } else {
      data = req.body;
    }
  }

  const emailBody = `【严氏风水预约邮件】

预约人：${data.name || ''}
联系电话：${data.phone || ''}
预约服务：${serviceMap[data.service] || data.service || ''}
预约方式：${methodMap[data.method] || data.method || ''}
期望时间：${data.preferredDate || ''}
出生日期：${data.birthdate || ''}
备注信息：${data.notes || ''}`;

  const transporter = nodemailer.createTransport({
    host: 'smtp.163.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: 'ga351419@163.com',
      subject: `网站用户${data.name || '访客'}预约`,
      text: emailBody
    });
    res.status(200).json({ status: 'success', message: '邮件发送成功', info: info.messageId });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
