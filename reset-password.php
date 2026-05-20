<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/includes/db.php';

define('MEMBER_GUARD_SKIP_ENFORCE', true);
require_once __DIR__ . '/_guard.php';

if (!function_exists('rp_h')) {
    function rp_h($value): string
    {
        return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8');
    }
}

if (!function_exists('rp_ensure_csrf')) {
    function rp_ensure_csrf(): string
    {
        if (empty($_SESSION['reset_password_csrf']) || !is_string($_SESSION['reset_password_csrf'])) {
            $_SESSION['reset_password_csrf'] = bin2hex(random_bytes(32));
        }

        return $_SESSION['reset_password_csrf'];
    }
}

$flash = $_SESSION['reset_password_flash'] ?? null;
unset($_SESSION['reset_password_flash']);

$token = trim((string) ($_GET['token'] ?? ''));
$tokenHash = $token !== '' ? hash('sha256', $token) : '';
$validToken = false;

if ($tokenHash !== '') {
    try {
        $stmt = $pdo->prepare("
            SELECT id
            FROM password_resets
            WHERE stage = 'reset'
              AND token_hash = :token_hash
              AND used_at IS NULL
              AND expires_at >= NOW()
            LIMIT 1
        ");
        $stmt->execute([
            ':token_hash' => $tokenHash,
        ]);
        $validToken = (bool) $stmt->fetch(PDO::FETCH_ASSOC);
    } catch (Throwable $e) {
        $validToken = false;
    }
}

$csrfToken = rp_ensure_csrf();
$pageTitle = 'Reset Password';
?>
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title><?php echo rp_h($pageTitle); ?> | Bettavaro</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex,nofollow,noarchive">
    <style>
        :root{
            --bg:#08110d;
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
        body{margin:0;font-family:Arial,Helvetica,sans-serif;background:radial-gradient(circle at top,#122117 0%,#08110d 45%,#050906 100%);color:var(--text);}
        .wrap{max-width:760px;margin:0 auto;padding:28px 16px 48px;}
        .topbar{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:18px;}
        .topbar a{color:var(--gold-2);text-decoration:none;font-weight:700;}
        .card{background:linear-gradient(180deg, rgba(255,255,255,.03), rgba(255,255,255,.015));border:1px solid var(--line);border-radius:22px;box-shadow:var(--shadow);overflow:hidden;}
        .card-body{padding:24px;}
        .title{margin:0 0 8px;font-size:32px;line-height:1.08;letter-spacing:-.02em;}
        .subtitle{margin:0 0 22px;color:var(--muted);font-size:15px;line-height:1.7;}
        .alert{border-radius:14px;padding:14px 16px;margin-bottom:16px;white-space:pre-line;line-height:1.6;border:1px solid transparent;}
        .alert-success{background:var(--green);border-color:var(--green-line);color:var(--green-text);}
        .alert-error{background:var(--danger);border-color:var(--danger-line);color:var(--danger-text);}
        .field label{display:block;margin-bottom:8px;font-weight:700;font-size:14px;}
        .field input{width:100%;padding:14px 16px;border-radius:14px;border:1px solid var(--line);background:#0b1220;color:var(--text);outline:none;font-size:15px;}
        .field input:focus{border-color:var(--gold);box-shadow:0 0 0 3px rgba(207,176,107,.12);}
        .grid{display:grid;gap:16px;}
        .actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:16px;}
        .btn{display:inline-flex;align-items:center;justify-content:center;min-height:46px;padding:0 18px;border-radius:12px;text-decoration:none;font-weight:700;border:1px solid transparent;transition:.18s ease;cursor:pointer;}
        .btn-primary{background:var(--gold);color:#111;}
        .btn-primary:hover{transform:translateY(-1px);}
        .btn-secondary{background:transparent;color:var(--text);border-color:var(--line);}
        .btn-secondary:hover{border-color:var(--gold);color:var(--gold-2);}
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
            <a href="/login.php">← Back to Sign In</a>
            <a href="/">Home</a>
        </div>

        <div class="card">
            <div class="card-body">
                <h1 class="title">Reset Password</h1>

                <?php if (is_array($flash)): ?>
                    <div class="alert <?php echo (($flash['type'] ?? '') === 'success') ? 'alert-success' : 'alert-error'; ?>">
                        <?php echo rp_h((string) ($flash['message'] ?? '')); ?>
                    </div>
                <?php endif; ?>

                <?php if (!$validToken): ?>
                    <div class="alert alert-error">
                        This password reset link is invalid or has expired.
                    </div>

                    <p class="subtitle">
                        Request a new reset link and try again.
                    </p>

                    <div class="actions">
                        <a class="btn btn-primary" href="/member/forgot-password.php">Request New Link</a>
                        <a class="btn btn-secondary" href="/login.php">Back to Sign In</a>
                    </div>
                <?php else: ?>
                    <p class="subtitle">
                        Enter a new password for your account. This secure link can only be used once.
                    </p>

                    <form method="post" action="/member/reset-password-submit.php" novalidate>
                        <input type="hidden" name="csrf_token" value="<?php echo rp_h($csrfToken); ?>">
                        <input type="hidden" name="token" value="<?php echo rp_h($token); ?>">

                        <div class="grid">
                            <div class="field">
                                <label for="new_password">New Password</label>
                                <input type="password" id="new_password" name="new_password" autocomplete="new-password" required>
                            </div>

                            <div class="field">
                                <label for="confirm_password">Confirm New Password</label>
                                <input type="password" id="confirm_password" name="confirm_password" autocomplete="new-password" required>
                            </div>
                        </div>

                        <div class="actions">
                            <button class="btn btn-primary" type="submit">Save New Password</button>
                            <a class="btn btn-secondary" href="/login.php">Cancel</a>
                        </div>
                    </form>
                <?php endif; ?>
            </div>
        </div>
    </div>
</body>
</html>