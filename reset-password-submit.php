<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/includes/db.php';

define('MEMBER_GUARD_SKIP_ENFORCE', true);
require_once __DIR__ . '/_guard.php';

if (!function_exists('reset_password_flash')) {
    function reset_password_flash(string $type, string $message): void
    {
        $_SESSION['reset_password_flash'] = [
            'type' => $type,
            'message' => $message,
        ];
    }
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: /member/forgot-password.php');
    exit;
}

$postedCsrf = isset($_POST['csrf_token']) ? (string) $_POST['csrf_token'] : '';
if (
    empty($_SESSION['reset_password_csrf']) ||
    !is_string($_SESSION['reset_password_csrf']) ||
    !hash_equals($_SESSION['reset_password_csrf'], $postedCsrf)
) {
    reset_password_flash('error', 'The security check failed. Please try again.');
    header('Location: /member/forgot-password.php');
    exit;
}

$token = trim((string) ($_POST['token'] ?? ''));
$newPassword = trim((string) ($_POST['new_password'] ?? ''));
$confirmPassword = trim((string) ($_POST['confirm_password'] ?? ''));

$errors = [];

if ($token === '') {
    $errors[] = 'The reset token is missing.';
}

if ($newPassword === '') {
    $errors[] = 'Please enter a new password.';
}

if ($confirmPassword === '') {
    $errors[] = 'Please confirm your new password.';
}

if ($newPassword !== '' && strlen($newPassword) < 8) {
    $errors[] = 'Your new password must be at least 8 characters long.';
}

if ($newPassword !== '' && strlen($newPassword) > 255) {
    $errors[] = 'Your new password is too long.';
}

if ($newPassword !== $confirmPassword) {
    $errors[] = 'The new password and confirmation password do not match.';
}

if (!empty($errors)) {
    reset_password_flash('error', implode("\n", $errors));
    header('Location: /member/reset-password.php?token=' . rawurlencode($token));
    exit;
}

try {
    $tokenHash = hash('sha256', $token);

    $pdo->beginTransaction();

    $stmt = $pdo->prepare("
        SELECT id, user_id, expires_at, used_at
        FROM password_resets
        WHERE stage = 'reset'
          AND token_hash = :token_hash
        LIMIT 1
        FOR UPDATE
    ");
    $stmt->execute([
        ':token_hash' => $tokenHash,
    ]);

    $resetRow = $stmt->fetch(PDO::FETCH_ASSOC);

    if (
        !$resetRow ||
        !empty($resetRow['used_at']) ||
        strtotime((string) ($resetRow['expires_at'] ?? '1970-01-01 00:00:00')) < time()
    ) {
        $pdo->rollBack();
        reset_password_flash('error', 'This password reset link is invalid or has expired.');
        header('Location: /member/forgot-password.php');
        exit;
    }

    $newHash = password_hash($newPassword, PASSWORD_DEFAULT);

    $updateUser = $pdo->prepare("
        UPDATE users
        SET password_hash = :password_hash,
            updated_at = NOW()
        WHERE id = :user_id
        LIMIT 1
    ");
    $updateUser->execute([
        ':password_hash' => $newHash,
        ':user_id' => (int) $resetRow['user_id'],
    ]);

    $markUsed = $pdo->prepare("
        UPDATE password_resets
        SET used_at = NOW()
        WHERE id = :id
        LIMIT 1
    ");
    $markUsed->execute([
        ':id' => (int) $resetRow['id'],
    ]);

    $pdo->commit();

    $_SESSION['login_flash'] = [
        'type' => 'success',
        'message' => 'Your password has been reset successfully. Please sign in with your new password.',
    ];

    header('Location: /login.php');
    exit;
} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    error_log('reset-password-submit error: ' . $e->getMessage());
    reset_password_flash('error', 'A password reset error occurred. Please request a new link and try again.');
    header('Location: /member/forgot-password.php');
    exit;
}