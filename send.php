<?php
/**
 * NexFlora — send.php
 * Recebe POST do formulário de contato e envia e-mail via mail().
 * Configurar: DESTINATARIO, REMETENTE_NAME e REMETENTE_FROM.
 */

header('Content-Type: application/json; charset=utf-8');

// Apenas POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
    exit;
}

// ============================================================
// CONFIGURAÇÃO — edite aqui
// ============================================================
define('DESTINATARIO',    'seu@email.com.br');   // onde receber os leads
define('REMETENTE_NAME',  'NexFlora Site');
define('REMETENTE_FROM',  'noreply@nexflora.com.br');
// ============================================================

// Sanitização
function clean(string $v): string {
    return htmlspecialchars(strip_tags(trim($v)), ENT_QUOTES, 'UTF-8');
}

$honeypot = $_POST['_honeypot'] ?? '';
if ($honeypot !== '') {
    // Bot detectado — responde OK silenciosamente
    echo json_encode(['ok' => true]);
    exit;
}

$nome         = clean($_POST['nome']         ?? '');
$empresa      = clean($_POST['empresa']      ?? '');
$telefone     = clean($_POST['telefone']     ?? '');
$email        = clean($_POST['email']        ?? '');
$certificacao = clean($_POST['certificacao'] ?? '');
$mensagem     = clean($_POST['mensagem']     ?? '');

// Validação básica
if (!$nome || !$empresa || !$telefone || !$email || !$certificacao) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'error' => 'Campos obrigatórios não preenchidos.']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'error' => 'E-mail inválido.']);
    exit;
}

// Monta e-mail
$assunto = "Nova solicitação de avaliação — NexFlora";

$corpo = "Nova solicitação recebida pelo site NexFlora.\n\n"
       . "Nome:          {$nome}\n"
       . "Empresa:       {$empresa}\n"
       . "Telefone/WA:   {$telefone}\n"
       . "E-mail:        {$email}\n"
       . "Certificação:  {$certificacao}\n"
       . "Mensagem:\n{$mensagem}\n";

$headers  = "From: " . REMETENTE_NAME . " <" . REMETENTE_FROM . ">\r\n";
$headers .= "Reply-To: {$nome} <{$email}>\r\n";
$headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

$enviado = mail(DESTINATARIO, $assunto, $corpo, $headers);

if ($enviado) {
    echo json_encode(['ok' => true]);
} else {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Falha ao enviar e-mail. Tente novamente.']);
}
