<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/includes/db.php';
require_once __DIR__ . '/_guard.php';

if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}

/*
|--------------------------------------------------------------------------
| Local helpers (file-specific prefix to avoid naming collisions)
|--------------------------------------------------------------------------
*/
if (!function_exists('member_cp_h')) {
    function member_cp_h($value): string
    {
        return htmlspecialchars((string)$value, ENT_QUOTES, 'UTF-8');
    }
}

if (!function_exists('member_cp_url')) {
    function member_cp_url(): string
    {
        return '/member/change-password.php';
    }
}

if (!function_exists('member_cp_set_flash')) {
    function member_cp_set_flash(string $type, string $message): void
    {
        $_SESSION['member_change_password_flash'] = [
            'type'    => $type,
            'message' => $message,
        ];
    }
}

if (!function_exists('member_cp_get_flash')) {
    function member_cp_get_flash(): ?array
    {
        if (
            !isset($_SESSION['member_change_password_flash']) ||
            !is_array($_SESSION['member_change_password_flash'])
        ) {
            return null;
        }

        $flash = $_SESSION['member_change_password_flash'];
        unset($_SESSION['member_change_password_flash']);

        return $flash;
    }
}

if (!function_exists('member_cp_ensure_csrf')) {
    function member_cp_ensure_csrf(): string
    {
        if (
            empty($_SESSION['member_change_password_csrf']) ||
            !is_string($_SESSION['member_change_password_csrf'])
        ) {
            $_SESSION['member_change_password_csrf'] = bin2hex(random_bytes(32));
        }

        return $_SESSION['member_change_password_csrf'];
    }
}

if (!function_exists('member_cp_verify_csrf')) {
    function member_cp_verify_csrf(?string $token): bool
    {
        return isset($_SESSION['member_change_password_csrf'])
            && is_string($_SESSION['member_change_password_csrf'])
            && is_string($token)
            && hash_equals($_SESSION['member_change_password_csrf'], $token);
    }
}

$currentUserId = member_user_id();
if ($currentUserId <= 0) {
    header('Location: /login.php?redirect=' . rawurlencode('/member/change-password.php'));
    exit;
}

$flash = member_cp_get_flash();
$csrfToken = member_cp_ensure_csrf();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $currentPassword = isset($_POST['current_password']) ? trim((string)$_POST['current_password']) : '';
    $newPassword     = isset($_POST['new_password']) ? trim((string)$_POST['new_password']) : '';
    $confirmPassword = isset($_POST['confirm_password']) ? trim((string)$_POST['confirm_password']) : '';
    $postedCsrf      = isset($_POST['csrf_token']) ? (string)$_POST['csrf_token'] : '';

    $errors = [];

    if (!member_cp_verify_csrf($postedCsrf)) {
        $errors[] = 'The form session is invalid. Please try again.';
    }

    if ($currentPassword === '') {
        $errors[] = 'Please enter your current password.';
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

    if ($currentPassword !== '' && $newPassword !== '' && $currentPassword === $newPassword) {
        $errors[] = 'Your new password must be different from your current password.';
    }

    if ($newPassword !== $confirmPassword) {
        $errors[] = 'The new password and confirmation password do not match.';
    }

    if (empty($errors)) {
        try {
            $stmt = $pdo->prepare("
                SELECT id, email, password_hash, account_status
                FROM users
                WHERE id = :id
                LIMIT 1
            ");
            $stmt->execute([
                ':id' => $currentUserId,
            ]);

            $userRow = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$userRow) {
                $errors[] = 'The user account could not be found.';
            } else {
                $storedHash = isset($userRow['password_hash']) ? (string)$userRow['password_hash'] : '';

                if ($storedHash === '' || !password_verify($currentPassword, $storedHash)) {
                    $errors[] = 'Your current password is incorrect.';
                } else {
                    $newHash = password_hash($newPassword, PASSWORD_DEFAULT);

                    $update = $pdo->prepare("
                        UPDATE users
                        SET password_hash = :password_hash,
                            updated_at = NOW()
                        WHERE id = :id
                        LIMIT 1
                    ");
                    $update->execute([
                        ':password_hash' => $newHash,
                        ':id'            => (int)$userRow['id'],
                    ]);

                    $_SESSION['member_change_password_csrf'] = bin2hex(random_bytes(32));

                    if (!empty($_SESSION['user']) && is_array($_SESSION['user'])) {
                        $_SESSION['user']['id'] = (int)$userRow['id'];
                        if (isset($userRow['email'])) {
                            $_SESSION['user']['email'] = (string)$userRow['email'];
                        }
                    }

                    if (!empty($_SESSION['member']) && is_array($_SESSION['member'])) {
                        $_SESSION['member']['id'] = (int)$userRow['id'];
                        if (isset($userRow['email'])) {
                            $_SESSION['member']['email'] = (string)$userRow['email'];
                        }
                    }

                    $_SESSION['member_flash_success'] = 'Your password has been changed successfully.';
                    member_cp_set_flash('success', 'Your password has been changed successfully.');
                    header('Location: ' . member_cp_url());
                    exit;
                }
            }
        } catch (Throwable $e) {
            $errors[] = 'An error occurred while saving your new password. Please try again.';
        }
    }

    if (!empty($errors)) {
        member_cp_set_flash('error', implode("\n", $errors));
        header('Location: ' . member_cp_url());
        exit;
    }
}

$pageTitle = 'Change Password';
?>
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title><?php echo member_cp_h($pageTitle); ?> | Bettavaro</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex,nofollow,noarchive">
    <style>
        :root{
            --bg:#08110d;
            --bg-2:#0d1712;
            --panel:#121a16;
            --line:rgba(255,255,255,.08);
            --text:#f4f1e8;
            --muted:#aab7ad;
            --gold:#cfb06b;
            --gold-2:#e7d4a2;
            --green:#14311f;
            --green-line:#2f6a48;
            --green-text:#d7ffe4;
            --danger:#3a1717;
            --danger-line:#7f1d1d;
            --danger-text:#fecaca;
            --shadow:0 18px 50px rgba(0,0,0,.28);
        }
        *{box-sizing:border-box}
        body{
            margin:0;
            font-family:Arial, Helvetica, sans-serif;
            background:radial-gradient(circle at top, #122117 0%, #08110d 45%, #050906 100%);
            color:var(--text);
        }
        .wrap{
            max-width:760px;
            margin:0 auto;
            padding:28px 16px 48px;
        }
        .topbar{
            display:flex;
            justify-content:space-between;
            align-items:center;
            gap:12px;
            flex-wrap:wrap;
            margin-bottom:18px;
        }
        .topbar a{
            color:var(--gold-2);
            text-decoration:none;
            font-weight:700;
        }
        .card{
            background:linear-gradient(180deg, rgba(255,255,255,.03), rgba(255,255,255,.015));
            border:1px solid var(--line);
            border-radius:22px;
            box-shadow:var(--shadow);
            overflow:hidden;
        }
        .card-body{
            padding:24px;
        }
        .title{
            margin:0 0 8px;
            font-size:32px;
            line-height:1.08;
            letter-spacing:-.02em;
        }
        .subtitle{
            margin:0 0 22px;
            color:var(--muted);
            font-size:15px;
            line-height:1.7;
        }
        .alert{
            border-radius:14px;
            padding:14px 16px;
            margin-bottom:16px;
            white-space:pre-line;
            line-height:1.6;
            border:1px solid transparent;
        }
        .alert-success{
            background:var(--green);
            border-color:var(--green-line);
            color:var(--green-text);
        }
        .alert-error{
            background:var(--danger);
            border-color:var(--danger-line);
            color:var(--danger-text);
        }
        .grid{
            display:grid;
            gap:16px;
        }
        .field label{
            display:block;
            margin-bottom:8px;
            font-weight:700;
            font-size:14px;
        }
        .field input{
            width:100%;
            padding:14px 16px;
            border-radius:14px;
            border:1px solid var(--line);
            background:#0b1220;
            color:var(--text);
            outline:none;
            font-size:15px;
        }
        .field input:focus{
            border-color:var(--gold);
            box-shadow:0 0 0 3px rgba(207,176,107,.12);
        }
        .help{
            margin-top:8px;
            color:var(--muted);
            font-size:13px;
            line-height:1.6;
        }
        .actions{
            display:flex;
            gap:12px;
            flex-wrap:wrap;
            margin-top:6px;
        }
        .btn{
            display:inline-flex;
            align-items:center;
            justify-content:center;
            min-height:46px;
            padding:0 18px;
            border-radius:12px;
            text-decoration:none;
            font-weight:700;
            border:1px solid transparent;
            transition:.18s ease;
            cursor:pointer;
        }
        .btn-primary{
            background:var(--gold);
            color:#111;
        }
        .btn-primary:hover{
            transform:translateY(-1px);
        }
        .btn-secondary{
            background:transparent;
            color:var(--text);
            border-color:var(--line);
        }
        .btn-secondary:hover{
            border-color:var(--gold);
            color:var(--gold-2);
        }
        @media (max-width:640px){
            .wrap{padding:18px 12px 36px;}
            .card-body{padding:18px;}
            .title{font-size:26px;}
            .actions{flex-direction:column;}
            .btn{width:100%;}
        }
    </style>
</head>
<body>
    <div class="wrap">
        <div class="topbar">
            <a href="/member/index.php">← Back to Member Dashboard</a>
            <a href="/logout.php">Logout</a>
        </div>

        <div class="card">
            <div class="card-body">
                <h1 class="title">Change Password</h1>
                <p class="subtitle">
                    Update your account password using the same clean auth, session, and CSRF standard used across the member area.
                </p>

                <?php if ($flash): ?>
                    <div class="alert <?php echo (($flash['type'] ?? '') === 'success') ? 'alert-success' : 'alert-error'; ?>">
                        <?php echo member_cp_h((string)($flash['message'] ?? '')); ?>
                    </div>
                <?php endif; ?>

                <form method="post" action="<?php echo member_cp_h(member_cp_url()); ?>" novalidate>
                    <input type="hidden" name="csrf_token" value="<?php echo member_cp_h($csrfToken); ?>">

                    <div class="grid">
                        <div class="field">
                            <label for="current_password">Current Password</label>
                            <input type="password" id="current_password" name="current_password" autocomplete="current-password" required>
                        </div>

                        <div class="field">
                            <label for="new_password">New Password</label>
                            <input type="password" id="new_password" name="new_password" autocomplete="new-password" required>
                            <div class="help">Use at least 8 characters and avoid easy-to-guess passwords.</div>
                        </div>

                        <div class="field">
                            <label for="confirm_password">Confirm New Password</label>
                            <input type="password" id="confirm_password" name="confirm_password" autocomplete="new-password" required>
                        </div>
                    </div>

                    <div class="actions">
                        <button type="submit" class="btn btn-primary">Save New Password</button>
                        <a href="/member/index.php" class="btn btn-secondary">Cancel</a>
                    </div>
                </form>
            </div>
        </div>
    </div>
</body>
</html>