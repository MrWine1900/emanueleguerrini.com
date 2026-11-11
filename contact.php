<?php
/**
 * EmanueleGuerrini.com lead form.
 * On Hostinger, set the recipient in contact-config.php before going live.
 * Requires working PHP mail transport; send a test before launch.
 */
declare(strict_types=1);
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: strict-origin-when-cross-origin');
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    header('Allow: POST');
    exit('Method not allowed');
}
$language = ($_POST['lang'] ?? '') === 'en' ? 'en' : 'it';
$target = $language === 'en' ? '/en/?' : '/?';
function failForm(string $reason, string $target): never {
    header('Location: ' . $target . 'error=' . rawurlencode($reason) . '#contact', true, 303);
    exit;
}
if (strlen((string)($_SERVER['CONTENT_LENGTH'] ?? '0')) > 16000) {
    http_response_code(413);
    exit('Request too large');
}
if (!empty($_POST['website'])) {
    header('Location: ' . $target . 'sent=1#contact', true, 303);
    exit;
}
function clean(string $name, int $max): string {
    $val = trim((string)($_POST[$name] ?? ''));
    $val = str_replace(["\r", "\0"], '', $val);
    return function_exists('mb_substr') ? mb_substr($val, 0, $max, 'UTF-8') : substr($val, 0, $max);
}
$name = clean('name', 100);
$company = clean('company', 120);
$email = clean('email', 200);
$country = clean('country', 100);
$type = clean('type', 40);
$message = clean('message', 3500);
$allowedTypes = ['Steam systems', 'Heat recovery', 'Biomass', 'Technical review', 'Feasibility study', 'Other'];
if (!$name || !$company || !$message || strlen($message)<12 || !filter_var($email, FILTER_VALIDATE_EMAIL) || !in_array($type, $allowedTypes, true) || ($_POST['consent'] ?? '') !== 'yes') {
    failForm('invalid', $target);
}
if (!is_file(__DIR__ . '/contact-config.php')) {
    http_response_code(503);exit('Contact form is not yet configured on this website.');
}
/** @var string $recipientEmail */
$recipientEmail = '';
require __DIR__ . '/contact-config.php';
if (!filter_var($recipientEmail, FILTER_VALIDATE_EMAIL)) {
    http_response_code(503);exit('Contact form is not yet configured on this website.');
}
session_start();
$now=time();
if (!empty($_SESSION['last_lead']) && ($now - (int)$_SESSION['last_lead']) < 45) {
    http_response_code(429);exit('Too many requests. Try again later.');
}
$subject = '[EmanueleGuerrini.com] ' . $type . ' — new B2B enquiry';
$body = "Website contact request\n\n" .
        "Name: $name\nCompany: $company\nEmail: $email\nCountry: $country\nType: $type\nLanguage: $language\n\nProject details:\n$message\n\n" .
        "Submitted from: emanueleguerrini.com\n";
$replyTo = str_replace(["\r", "\n"], '', $email);
$headers = [
  'From' => 'Emanuele Guerrini Website <no-reply@emanueleguerrini.com>',
  'Reply-To' => $replyTo,
  'Content-Type' => 'text/plain; charset=UTF-8',
  'X-Mailer' => 'PHP/' . PHP_VERSION,
];
$ok = @mail($recipientEmail, $subject, $body, $headers);
if (!$ok) failForm('delivery', $target);
$_SESSION['last_lead'] = $now;
header('Location: ' . $target . 'sent=1#contact', true, 303);
exit;
