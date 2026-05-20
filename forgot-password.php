<?php
declare(strict_types=1);

define('MEMBER_GUARD_SKIP_ENFORCE', true);
require_once __DIR__ . '/_guard.php';

if (member_is_logged_in()) {
    header('Location: /member/change-password.php');
    exit;
}

if (!function_exists('fp_h')) {
    function fp_h($value): string
    {
        return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8');
    }
}

if (!function_exists('fp_ensure_csrf')) {
    function fp_ensure_csrf(): string
    {
        if (empty($_SESSION['forgot_password_csrf']) || !is_string($_SESSION['forgot_password_csrf'])) {
            $_SESSION['forgot_password_csrf'] = bin2hex(random_bytes(32));
        }

        return $_SESSION['forgot_password_csrf'];
    }
}

$flash = $_SESSION['forgot_password_flash'] ?? null;
unset($_SESSION['forgot_password_flash']);

$csrfToken = fp_ensure_csrf();
$pageTitle = 'Forgot Password';
?>
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title><?php echo fp_h($pageTitle); ?> | Bettavaro</title>
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
        .actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:16px;}
        .btn{display:inline-flex;align-items:center;justify-content:center;min-height:46px;padding:0 18px;border-radius:12px;text-decoration:none;font-weight:700;border:1px solid transparent;transition:.18s ease;cursor:pointer;}
        .btn-primary{background:var(--gold);color:#111;}
        .btn-primary:hover{transform:translateY(-1px);}
        .btn-secondary{background:transparent;color:var(--text);border-color:var(--line);}
        .btn-secondary:hover{border-color:var(--gold);color:var(--gold-2);}
        .foot{margin-top:16px;color:var(--muted);font-size:14px;line-height:1.7;}
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
                <h1 class="title">Forgot Password</h1>
                <p class="subtitle">
                    Enter your registered email address. We will send you a secure password reset link.
                </p>

                <?php if (is_array($flash)): ?>
                    <div class="alert <?php echo (($flash['type'] ?? '') === 'success') ? 'alert-success' : 'alert-error'; ?>">
                        <?php echo fp_h((string) ($flash['message'] ?? '')); ?>
                    </div>
                <?php endif; ?>

                <form method="post" action="/member/forgot-password-submit.php" autocomplete="off" novalidate>
                    <div style="position:absolute;left:-9999px;" aria-hidden="true">
                        <label for="website">Website</label>
                        <input type="text" id="website" name="website" tabindex="-1" autocomplete="off">
                    </div>

                    <input type="hidden" name="csrf_token" value="<?php echo fp_h($csrfToken); ?>">

                    <div class="field">
                        <label for="email">Email Address</label>
                        <input id="email" name="email" type="email" required placeholder="you@example.com" inputmode="email" autocomplete="email">
                    </div>

                    <div class="actions">
                        <button class="btn btn-primary" type="submit">Send Reset Link</button>
                        <a class="btn btn-secondary" href="/login.php">Cancel</a>
                    </div>
                </form>

                <div class="foot">
                    For security reasons, the form will always show the same response whether the email exists in the system or not.
                </div>
            </div>
        </div>
    </div>
</body>
</html>