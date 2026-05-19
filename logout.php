<?php
declare(strict_types=1);

// =============================================================================
// Bettavaro Mobile API v1 — /api/mobile/v1/logout.php
// Token-based mobile logout. Revokes the current Bearer token.
//
// CRITICAL: Never touches $_SESSION. Never outputs HTML. Never redirects.
// =============================================================================

while (ob_get_level() > 0) {
    @ob_end_clean();
}

header('Content-Type: application/json; charset=UTF-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('X-Content-Type-Options: nosniff');

if (!function_exists('bv_mobile_logout_public_root')) {
    function bv_mobile_logout_public_root(): string
    {
        return dirname(__DIR__, 3);
    }
}

if (!function_exists('bv_mobile_logout_project_root')) {
    function bv_mobile_logout_project_root(): string
    {
        return dirname(bv_mobile_logout_public_root());
    }
}

if (!function_exists('bv_mobile_logout_meta')) {
    function bv_mobile_logout_meta(): array
    {
        return [
            'api_version'  => 'mobile-v1',
            'generated_at' => gmdate('c'),
        ];
    }
}

if (!function_exists('bv_mobile_logout_json')) {
    function bv_mobile_logout_json(int $statusCode, array $payload): void
    {
        if (!array_key_exists('meta', $payload)) {
            $payload['meta'] = bv_mobile_logout_meta();
        }
        http_response_code($statusCode);
        echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRESERVE_ZERO_FRACTION);
        exit;
    }
}

if (!function_exists('bv_mobile_logout_error')) {
    function bv_mobile_logout_error(string $code, string $message, int $statusCode): void
    {
        bv_mobile_logout_json($statusCode, [
            'ok'    => false,
            'error' => [
                'code'    => $code,
                'message' => $message,
            ],
        ]);
    }
}

if (!function_exists('bv_mobile_logout_log')) {
    function bv_mobile_logout_log(string $message): void
    {
        error_log('[BV Mobile Logout] ' . $message);

        $line = date('[Y-m-d H:i:s] ') . $message . PHP_EOL;
        $logCandidates = [
            bv_mobile_logout_project_root() . '/private_html/mobile_api.log',
            bv_mobile_logout_public_root() . '/logs/mobile_api.log',
        ];

        foreach ($logCandidates as $logFile) {
            $logDir = dirname($logFile);
            if (is_dir($logDir) && is_writable($logDir)) {
                @file_put_contents($logFile, $line, FILE_APPEND | LOCK_EX);
                break;
            }
        }
    }
}

if (!function_exists('bv_mobile_logout_db')) {
    function bv_mobile_logout_db(): ?object
    {
        static $cached = false;
        static $connection = null;

        if ($cached !== false) {
            return $connection;
        }

        $cached = true;
        $publicRoot = bv_mobile_logout_public_root();
        $candidates = [
            $publicRoot . '/config/db.php',
            $publicRoot . '/includes/db.php',
            $publicRoot . '/includes/config.php',
        ];

        foreach ($candidates as $cfg) {
            if (!is_file($cfg)) {
                continue;
            }

            $loader = static function (string $path): array {
                $db_host = $db_user = $db_pass = $db_name = $db_port = null;
                $host = $user = $pass = $name = $port = null;
                $DB_HOST = $DB_USER = $DB_PASS = $DB_NAME = $DB_PORT = null;
                $dsn = null;
                $pdo = $conn = $db = $mysqli = $link = null;
                /** @noinspection PhpIncludeInspection */
                @include $path;
                return compact(
                    'db_host', 'db_user', 'db_pass', 'db_name', 'db_port',
                    'host', 'user', 'pass', 'name', 'port',
                    'DB_HOST', 'DB_USER', 'DB_PASS', 'DB_NAME', 'DB_PORT',
                    'dsn', 'pdo', 'conn', 'db', 'mysqli', 'link'
                );
            };

            $vars = $loader($cfg);

            foreach (['pdo', 'conn', 'db', 'mysqli', 'link'] as $name) {
                if (isset($vars[$name]) && ($vars[$name] instanceof PDO || $vars[$name] instanceof mysqli)) {
                    $connection = $vars[$name];
                    return $connection;
                }
            }

            foreach (['pdo', 'conn', 'db', 'mysqli', 'link'] as $name) {
                if (isset($GLOBALS[$name]) && ($GLOBALS[$name] instanceof PDO || $GLOBALS[$name] instanceof mysqli)) {
                    $connection = $GLOBALS[$name];
                    return $connection;
                }
            }

            $h = $vars['db_host'] ?? $vars['host'] ?? $vars['DB_HOST'] ?? null;
            $u = $vars['db_user'] ?? $vars['user'] ?? $vars['DB_USER'] ?? null;
            $p = $vars['db_pass'] ?? $vars['pass'] ?? $vars['DB_PASS'] ?? null;
            $n = $vars['db_name'] ?? $vars['name'] ?? $vars['DB_NAME'] ?? null;
            $pt = (int) ($vars['db_port'] ?? $vars['port'] ?? $vars['DB_PORT'] ?? 3306);

            if ($h && $u !== null && $n) {
                try {
                    $pdo = new PDO(
                        "mysql:host={$h};port={$pt};dbname={$n};charset=utf8mb4",
                        (string) $u,
                        (string) $p,
                        [
                            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                            PDO::ATTR_EMULATE_PREPARES   => false,
                        ]
                    );
                    $connection = $pdo;
                    return $connection;
                } catch (Throwable $e) {
                    bv_mobile_logout_log('PDO connect failed');
                }
            }

            if ($h && $u !== null && $n && function_exists('mysqli_connect')) {
                try {
                    $mysqli = @new mysqli((string) $h, (string) $u, (string) $p, (string) $n, $pt ?: 3306);
                    if (!$mysqli->connect_errno) {
                        $mysqli->set_charset('utf8mb4');
                        $connection = $mysqli;
                        return $connection;
                    }
                    bv_mobile_logout_log('mysqli connect failed');
                } catch (Throwable $e) {
                    bv_mobile_logout_log('mysqli connect exception');
                }
            }

            break;
        }

        return null;
    }
}

if (!function_exists('bv_mobile_logout_ident')) {
    function bv_mobile_logout_ident(string $identifier): string
    {
        return '`' . str_replace('`', '', $identifier) . '`';
    }
}

if (!function_exists('bv_mobile_logout_columns')) {
    function bv_mobile_logout_columns(object $db, string $table): array
    {
        if (!preg_match('/^[a-zA-Z0-9_]+$/', $table)) {
            return [];
        }

        $columns = [];

        try {
            if ($db instanceof PDO) {
                $stmt = $db->query('SHOW COLUMNS FROM ' . bv_mobile_logout_ident($table));
                foreach ($stmt->fetchAll() as $row) {
                    $field = strtolower((string) ($row['Field'] ?? ''));
                    if ($field !== '') {
                        $columns[] = $field;
                    }
                }
            } elseif ($db instanceof mysqli) {
                $result = $db->query('SHOW COLUMNS FROM ' . bv_mobile_logout_ident($table));
                if ($result instanceof mysqli_result) {
                    while ($row = $result->fetch_assoc()) {
                        $field = strtolower((string) ($row['Field'] ?? ''));
                        if ($field !== '') {
                            $columns[] = $field;
                        }
                    }
                    $result->free();
                }
            }
        } catch (Throwable $e) {
            bv_mobile_logout_log('Column detection failed');
        }

        return array_values(array_unique($columns));
    }
}

if (!function_exists('bv_mobile_logout_query_row')) {
    function bv_mobile_logout_query_row(object $db, string $sql, array $params = []): ?array
    {
        try {
            if ($db instanceof PDO) {
                $stmt = $db->prepare($sql);
                $stmt->execute($params);
                $row = $stmt->fetch(PDO::FETCH_ASSOC);
                return is_array($row) ? $row : null;
            }

            if ($db instanceof mysqli) {
                $stmt = $db->prepare($sql);
                if ($stmt === false) {
                    return null;
                }

                if ($params !== []) {
                    $types = implode('', array_map(
                        static fn($value): string => is_int($value) ? 'i' : (is_float($value) ? 'd' : 's'),
                        $params
                    ));
                    $bind = [&$types];
                    foreach ($params as $key => $_) {
                        $bind[] = &$params[$key];
                    }
                    call_user_func_array([$stmt, 'bind_param'], $bind);
                }

                $stmt->execute();
                $result = $stmt->get_result();
                $row = $result ? $result->fetch_assoc() : null;
                $stmt->close();
                return is_array($row) ? $row : null;
            }
        } catch (Throwable $e) {
            bv_mobile_logout_log('Query failed');
        }

        return null;
    }
}

if (!function_exists('bv_mobile_logout_execute')) {
    function bv_mobile_logout_execute(object $db, string $sql, array $params = []): bool
    {
        try {
            if ($db instanceof PDO) {
                $stmt = $db->prepare($sql);
                return $stmt->execute($params);
            }

            if ($db instanceof mysqli) {
                $stmt = $db->prepare($sql);
                if ($stmt === false) {
                    return false;
                }

                if ($params !== []) {
                    $types = implode('', array_map(
                        static fn($value): string => is_int($value) ? 'i' : (is_float($value) ? 'd' : 's'),
                        $params
                    ));
                    $bind = [&$types];
                    foreach ($params as $key => $_) {
                        $bind[] = &$params[$key];
                    }
                    call_user_func_array([$stmt, 'bind_param'], $bind);
                }

                $ok = $stmt->execute();
                $stmt->close();
                return $ok;
            }
        } catch (Throwable $e) {
            bv_mobile_logout_log('Execute failed');
        }

        return false;
    }
}

if (!function_exists('bv_mobile_logout_authorization_header')) {
    function bv_mobile_logout_authorization_header(): string
    {
        $serverCandidates = [
            'HTTP_AUTHORIZATION',
            'REDIRECT_HTTP_AUTHORIZATION',
            'Authorization',
        ];

        foreach ($serverCandidates as $key) {
            if (isset($_SERVER[$key]) && trim((string) $_SERVER[$key]) !== '') {
                return trim((string) $_SERVER[$key]);
            }
        }

        if (function_exists('getallheaders')) {
            $headers = getallheaders();
            if (is_array($headers)) {
                foreach ($headers as $name => $value) {
                    if (strcasecmp((string) $name, 'Authorization') === 0) {
                        return trim((string) $value);
                    }
                }
            }
        }

        return '';
    }
}

if (!function_exists('bv_mobile_logout_success')) {
    function bv_mobile_logout_success(bool $includeMessage): void
    {
        $data = ['logged_out' => true];

        if ($includeMessage) {
            $data['message'] = 'You have safely left Bettavaro.';
        }

        bv_mobile_logout_json(200, [
            'ok'   => true,
            'data' => $data,
        ]);
    }
}

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        bv_mobile_logout_error('method_not_allowed', 'Only POST requests are accepted.', 405);
    }

    $authorization = bv_mobile_logout_authorization_header();
    if ($authorization === '' || !preg_match('/^Bearer\s+(.+)$/i', $authorization, $matches)) {
        bv_mobile_logout_error('token_missing', 'Authorization token is required.', 401);
    }

    $plainToken = trim((string) $matches[1]);
    if ($plainToken === '') {
        bv_mobile_logout_error('token_missing', 'Authorization token is required.', 401);
    }

    $tokenHash = hash('sha256', $plainToken);
    $db = bv_mobile_logout_db();
    if (!$db) {
        bv_mobile_logout_log('Database connection unavailable');
        bv_mobile_logout_error('server_error', 'Something went wrong.', 500);
    }

  $tokenRow = bv_mobile_logout_query_row(
        $db,
        'SELECT id FROM ' . bv_mobile_logout_ident('mobile_auth_tokens') . ' WHERE ' . bv_mobile_logout_ident('token_hash') . ' = ? LIMIT 1',
        [$tokenHash]
    );

    if (!$tokenRow) {
        bv_mobile_logout_success(false);
    }

    $updated = bv_mobile_logout_execute(
        $db,
        'UPDATE ' . bv_mobile_logout_ident('mobile_auth_tokens') . ' SET revoked_at = NOW() WHERE ' . bv_mobile_logout_ident('token_hash') . ' = ? LIMIT 1',
        [$tokenHash]
    );

    if (!$updated) {
        bv_mobile_logout_log('Token revoke update failed');
        bv_mobile_logout_error('server_error', 'Something went wrong.', 500);
    }


    bv_mobile_logout_success(true);
} catch (Throwable $e) {
    bv_mobile_logout_log('Unhandled exception');
    bv_mobile_logout_error('server_error', 'Something went wrong.', 500);
}
