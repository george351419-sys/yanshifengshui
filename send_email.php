<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $service = $_POST['service'] ?? '';
    $method = $_POST['method'] ?? '';
    $preferredDate = $_POST['preferredDate'] ?? '';
    $name = $_POST['name'] ?? '';
    $phone = $_POST['phone'] ?? '';
    $birthdate = $_POST['birthdate'] ?? '';
    $notes = $_POST['notes'] ?? '';

    $serviceMap = [
        'yangzhai' => '阳宅风水',
        'yinzhai' => '阴宅风水',
        'zeyue' => '择日选时',
        'mingli' => '命理综合',
        'qiming' => '起名服务'
    ];

    $methodMap = [
        'onsite' => '现场考察',
        'video' => '远程视频',
        'phone' => '电话/语音咨询',
        'wechat' => '微信沟通'
    ];

    $serviceText = $serviceMap[$service] ?? $service;
    $methodText = $methodMap[$method] ?? $method;

    $emailBody = "【严氏风水预约邮件】\n\n";
    $emailBody .= "预约人：{$name}\n";
    $emailBody .= "联系电话：{$phone}\n";
    $emailBody .= "预约服务：{$serviceText}\n";
    $emailBody .= "预约方式：{$methodText}\n";
    $emailBody .= "期望时间：{$preferredDate}\n";
    $emailBody .= "出生日期：{$birthdate}\n";
    $emailBody .= "备注信息：{$notes}\n";

    $to = 'ga351419@163.com';
    $subject = "网站用户{$name}预约";
    $from = 'aydenyan@163.com';
    $smtpHost = 'smtp.163.com';
    $smtpPort = 465;
    $smtpUser = 'aydenyan@163.com';
    $smtpPass = 'Af351419';

    function sendMail($to, $subject, $body, $from, $smtpHost, $smtpPort, $smtpUser, $smtpPass) {
        $subject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
        $headers = "From: {$from}\r\n";
        $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
        
        $socket = fsockopen('ssl://' . $smtpHost, $smtpPort, $errno, $errstr, 30);
        if (!$socket) {
            return ['status' => 'error', 'message' => "连接失败: $errstr ($errno)"];
        }

        fgets($socket);
        fwrite($socket, "EHLO localhost\r\n");
        fgets($socket);
        fwrite($socket, "AUTH LOGIN\r\n");
        fgets($socket);
        fwrite($socket, base64_encode($smtpUser) . "\r\n");
        fgets($socket);
        fwrite($socket, base64_encode($smtpPass) . "\r\n");
        fgets($socket);
        fwrite($socket, "MAIL FROM:<{$from}>\r\n");
        fgets($socket);
        fwrite($socket, "RCPT TO:<{$to}>\r\n");
        fgets($socket);
        fwrite($socket, "DATA\r\n");
        fgets($socket);
        fwrite($socket, "Subject: {$subject}\r\n");
        fwrite($socket, $headers);
        fwrite($socket, "\r\n");
        fwrite($socket, $body . "\r\n");
        fwrite($socket, ".\r\n");
        fgets($socket);
        fwrite($socket, "QUIT\r\n");
        fgets($socket);
        fclose($socket);

        return ['status' => 'success', 'message' => '邮件发送成功'];
    }

    $result = sendMail($to, $subject, $emailBody, $from, $smtpHost, $smtpPort, $smtpUser, $smtpPass);
    echo json_encode($result);
} else {
    echo json_encode(['status' => 'error', 'message' => '无效请求']);
}
?>