<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/includes/db.php';

if (file_exists(dirname(__DIR__) . '/includes/config.php')) {
    require_once dirname(__DIR__) . '/includes/config.php';
}

define('MEMBER_GUARD_SKIP_ENFORCE', true);
require_once __DIR__ . '/_guard.php';

if (!function_exists('forgot_password_flash')) {
    function forgot_password_flash(string $type, string $message): void
    {
        $_SESSION['forgot_password_flash'] = [
            'type' => $type,
            'message' => $message,
        ];
    }
}

if (!function_exists('member_auth_send_email')) {
    function member_auth_send_email(string $to, string $subject, string $html): bool
    {
        $mailerFiles = [
            dirname(__DIR__) . '/includes/mailer.php',
            dirname(__DIR__) . '/config/mailer.php',
        ];

        foreach ($mailerFiles as $mailerFile) {
            if (file_exists($mailerFile)) {
                require_once $mailerFile;
            }
        }

        if (function_exists('send_user_email')) {
            return (bool) send_user_email($to, $subject, $html);
        }

        if (function_exists('send_email')) {
            return (bool) send_email($to, $subject, $html);
        }

        $headers = [];
        $headers[] = 'MIME-Version: 1.0';
        $headers[] = 'Content-type: text/html; charset=UTF-8';
        $headers[] = 'From: Bettavaro <no-reply@bettavaro.com>';

        return @mail($to, $subject, $html, implode("\r\n", $headers));
    }
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: /member/forgot-password.php');
    exit;
}

if (!empty($_POST['website'] ?? '')) {
    header('Location: /member/forgot-password.php');
    exit;
}

$postedCsrf = isset($_POST['csrf_token']) ? (string) $_POST['csrf_token'] : '';
if (
    empty($_SESSION['forgot_password_csrf']) ||
    !is_string($_SESSION['forgot_password_csrf']) ||
    !hash_equals($_SESSION['forgot_password_csrf'], $postedCsrf)
) {
    forgot_password_flash('error', 'The security check failed. Please try again.');
    header('Location: /member/forgot-password.php');
    exit;
}

$email = trim((string) ($_POST['email'] ?? ''));
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    forgot_password_flash('error', 'Please enter a valid email address.');
    header('Location: /member/forgot-password.php');
    exit;
}

$genericMessage = 'If the email address exists in our system, we have sent a password reset link. Please check your inbox and spam folder.';

try {
    $ip = substr((string) ($_SERVER['REMOTE_ADDR'] ?? ''), 0, 45);

    $stmtRL = $pdo->prepare("
        SELECT COUNT(*)
        FROM password_resets
        WHERE requested_ip = :ip
          AND created_at >= (NOW() - INTERVAL 15 MINUTE)
    ");
    $stmtRL->execute([
        ':ip' => $ip,
    ]);
    $attemptCount = (int) $stmtRL->fetchColumn();

    if ($attemptCount >= 5) {
        forgot_password_flash('success', $genericMessage);
        header('Location: /member/forgot-password.php');
        exit;
    }

    $stmt = $pdo->prepare("
        SELECT id, email, account_status
        FROM users
        WHERE email = :email
        LIMIT 1
    ");
    $stmt->execute([
        ':email' => $email,
    ]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    usleep(200000);

    if ($user && (string) ($user['account_status'] ?? 'active') !== 'deleted') {
        $userId = (int) $user['id'];

        $token = bin2hex(random_bytes(32));
        $tokenHash = hash('sha256', $token);
        $expiresAt = (new DateTime('+30 minutes'))->format('Y-m-d H:i:s');

        $pdo->prepare("
            INSERT INTO password_resets (user_id, stage, token_hash, expires_at, requested_ip, used_at, created_at)
            VALUES (:user_id, 'reset', :token_hash, :expires_at, :requested_ip, NULL, NOW())
            ON DUPLICATE KEY UPDATE
                token_hash = VALUES(token_hash),
                expires_at = VALUES(expires_at),
                requested_ip = VALUES(requested_ip),
                used_at = NULL,
                created_at = NOW()
        ")->execute([
            ':user_id' => $userId,
            ':token_hash' => $tokenHash,
            ':expires_at' => $expiresAt,
            ':requested_ip' => $ip,
        ]);

        $baseUrl = defined('APP_URL') && is_string(APP_URL) && APP_URL !== ''
            ? rtrim(APP_URL, '/')
            : (
                ((isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http') .
                '://' .
                ($_SERVER['HTTP_HOST'] ?? 'www.bettavaro.com')
            );

        $resetLink = $baseUrl . '/member/reset-password.php?token=' . rawurlencode($token);

        $html = '
        <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.7;color:#111;background:#f6f7f8;padding:24px;">
            <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e6e8ea;border-radius:18px;overflow:hidden;">
                <div style="padding:22px 24px;background:#0d1712;color:#f4f1e8;">
                    <div style="font-size:20px;font-weight:800;letter-spacing:.2px;color:#e7d4a2;">Bettavaro</div>
                    <div style="opacity:.88;">Password Reset</div>
                </div>
                <div style="padding:24px;">
                    <p style="margin:0 0 12px;">We received a request to reset the password for your Bettavaro account.</p>
                    <p style="margin:0 0 16px;">Click the button below to create a new password. This reset link will expire in <strong>30 minutes</strong>.</p>

                    <p style="margin:0 0 18px;">
                        <a href="' . htmlspecialchars($resetLink, ENT_QUOTES, 'UTF-8') . '" style="display:inline-block;padding:12px 18px;border-radius:12px;background:#cfb06b;color:#111;text-decoration:none;font-weight:800;">
                            Reset Password
                        </a>
                    </p>

                    <p style="margin:0 0 12px;color:#444;">If you did not request this change, you can safely ignore this email.</p>
                    <p style="margin:0 0 4px;font-size:12px;color:#666;">Or copy and paste this link into your browser:</p>
                    <p style="margin:0;font-size:12px;word-break:break-all;color:#666;">' . htmlspecialchars($resetLink, ENT_QUOTES, 'UTF-8') . '</p>
                </div>
            </div>
        </div>';

        member_auth_send_email((string) $user['email'], 'Reset your Bettavaro password', $html);
    }

    forgot_password_flash('success', $genericMessage);
    header('Location: /member/forgot-password.php');
    exit;
} catch (Throwable $e) {
    error_log('forgot-password-submit error: ' . $e->getMessage());
    forgot_password_flash('success', $genericMessage);
    header('Location: /member/forgot-password.php');
    exit;
}