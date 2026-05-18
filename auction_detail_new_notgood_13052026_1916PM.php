<?php
declare(strict_types=1);

while (ob_get_level() > 0) {
    @ob_end_clean();
}

header('Content-Type: application/json; charset=UTF-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('X-Content-Type-Options: nosniff');

final class BvmAuctionDetailException extends RuntimeException
{
    private int $httpStatus;
    private string $publicMessage;

    public function __construct(string $code, string $message, int $httpStatus = 400)
    {
        parent::__construct($code);
        $this->publicMessage = $message;
        $this->httpStatus = $httpStatus;
    }

    public function httpStatus(): int
    {
        return $this->httpStatus;
    }

    public function publicMessage(): string
    {
        return $this->publicMessage;
    }
}

function bvm_auction_detail_meta(): array
{
    return [
        'api_version' => 'mobile-v1',
        'generated_at' => gmdate('c'),
    ];
}

function bvm_auction_detail_json(int $statusCode, array $payload): void
{
    if (!isset($payload['meta'])) {
        $payload['meta'] = bvm_auction_detail_meta();
    }

    http_response_code($statusCode);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRESERVE_ZERO_FRACTION);
    exit;
}

function bvm_auction_detail_error(string $code, string $message, int $statusCode): void
{
    bvm_auction_detail_json($statusCode, [
        'ok' => false,
        'error' => [
            'code' => $code,
            'message' => $message,
        ],
    ]);
}

function bvm_auction_detail_public_root(): string
{
    $dir = __DIR__;
    while ($dir !== dirname($dir)) {
        if (basename($dir) === 'public_html') {
            return $dir;
        }
        $dir = dirname($dir);
    }

    return dirname(__DIR__, 3);
}

function bvm_auction_detail_project_root(): string
{
    return dirname(bvm_auction_detail_public_root());
}

function bvm_auction_detail_log(string $message): void
{
    $safe = str_replace(["\r", "\n"], ' ', $message);
    error_log('[BVM Auction Detail] ' . $safe);

    $logFile = bvm_auction_detail_public_root() . '/logs/mobile_auction_detail.log';
    $logDir = dirname($logFile);
    if (!is_dir($logDir)) {
        @mkdir($logDir, 0755, true);
    }
    if (is_dir($logDir) && is_writable($logDir)) {
        @file_put_contents($logFile, gmdate('[Y-m-d H:i:s] ') . $safe . PHP_EOL, FILE_APPEND | LOCK_EX);
    }
}

function bvm_auction_detail_pdo_options(): array
{
    return [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ];
}

function bvm_auction_detail_prepare_pdo(PDO $pdo): PDO
{
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    $pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
    return $pdo;
}

function bvm_auction_detail_db(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    foreach (['pdo', 'PDO', 'db', 'conn'] as $globalName) {
        if (($GLOBALS[$globalName] ?? null) instanceof PDO) {
            $pdo = bvm_auction_detail_prepare_pdo($GLOBALS[$globalName]);
            return $pdo;
        }
    }

    $publicRoot = bvm_auction_detail_public_root();
    $projectRoot = bvm_auction_detail_project_root();
    $candidates = [
        $publicRoot . '/config/db.php',
        $publicRoot . '/includes/db.php',
        $publicRoot . '/includes/config.php',
        $projectRoot . '/config/db.php',
        $projectRoot . '/includes/db.php',
        $projectRoot . '/includes/config.php',
    ];

    foreach ($candidates as $file) {
        if (!is_file($file)) {
            continue;
        }

        $loader = static function (string $path): array {
            $db_host = $db_user = $db_pass = $db_name = $db_port = null;
            $host = $user = $pass = $name = $port = null;
            $DB_HOST = $DB_USER = $DB_PASS = $DB_NAME = $DB_PORT = null;
            $dsn = null;
            $pdo = $PDO = $db = $conn = null;
            /** @noinspection PhpIncludeInspection */
            include $path;
            return compact(
                'db_host', 'db_user', 'db_pass', 'db_name', 'db_port',
                'host', 'user', 'pass', 'name', 'port',
                'DB_HOST', 'DB_USER', 'DB_PASS', 'DB_NAME', 'DB_PORT',
                'dsn', 'pdo', 'PDO', 'db', 'conn'
            );
        };

        $vars = $loader($file);
        foreach (['pdo', 'PDO', 'db', 'conn'] as $name) {
            if (($vars[$name] ?? null) instanceof PDO) {
                $pdo = bvm_auction_detail_prepare_pdo($vars[$name]);
                return $pdo;
            }
            if (($GLOBALS[$name] ?? null) instanceof PDO) {
                $pdo = bvm_auction_detail_prepare_pdo($GLOBALS[$name]);
                return $pdo;
            }
        }

        $username = $vars['db_user'] ?? $vars['user'] ?? $vars['DB_USER'] ?? null;
        $password = $vars['db_pass'] ?? $vars['pass'] ?? $vars['DB_PASS'] ?? null;
        $dsn = $vars['dsn'] ?? null;
        if (is_string($dsn) && $dsn !== '' && $username !== null) {
            $pdo = new PDO($dsn, (string) $username, (string) $password, bvm_auction_detail_pdo_options());
            return $pdo;
        }

        $host = $vars['db_host'] ?? $vars['host'] ?? $vars['DB_HOST'] ?? null;
        $database = $vars['db_name'] ?? $vars['name'] ?? $vars['DB_NAME'] ?? null;
        $port = (int) ($vars['db_port'] ?? $vars['port'] ?? $vars['DB_PORT'] ?? 3306);
        if ($host !== null && $username !== null && $database !== null) {
            $pdo = new PDO(
                'mysql:host=' . (string) $host . ';port=' . $port . ';dbname=' . (string) $database . ';charset=utf8mb4',
                (string) $username,
                (string) $password,
                bvm_auction_detail_pdo_options()
            );
            return $pdo;
        }
    }

    throw new BvmAuctionDetailException('server_error', 'Database connection is unavailable.', 500);
}

function bvm_auction_detail_ident(string $identifier): string
{
    if (!preg_match('/^[A-Za-z0-9_]+$/', $identifier)) {
        throw new BvmAuctionDetailException('server_error', 'Invalid database identifier.', 500);
    }

    return '`' . $identifier . '`';
}

function bvm_auction_detail_table_exists(PDO $pdo, string $table): bool
{
    try {
        $stmt = $pdo->prepare('SHOW TABLES LIKE :table_name');
        $stmt->execute([':table_name' => $table]);
        return $stmt->fetchColumn() !== false;
    } catch (Throwable $e) {
        bvm_auction_detail_log('Table lookup failed for ' . $table . ': ' . $e->getMessage());
        return false;
    }
}

function bvm_auction_detail_columns(PDO $pdo, string $table): array
{
    static $cache = [];
    if (array_key_exists($table, $cache)) {
        return $cache[$table];
    }

    if (!bvm_auction_detail_table_exists($pdo, $table)) {
        $cache[$table] = [];
        return [];
    }

    try {
        $stmt = $pdo->prepare('SHOW COLUMNS FROM ' . bvm_auction_detail_ident($table));
        $stmt->execute();
        $columns = [];
        foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
            if (isset($row['Field'])) {
                $columns[(string) $row['Field']] = true;
            }
        }
        $cache[$table] = $columns;
        return $columns;
    } catch (Throwable $e) {
        bvm_auction_detail_log('Column lookup failed for ' . $table . ': ' . $e->getMessage());
        $cache[$table] = [];
        return [];
    }
}

function bvm_auction_detail_has_col(PDO $pdo, string $table, string $column): bool
{
    $columns = bvm_auction_detail_columns($pdo, $table);
    return isset($columns[$column]);
}

function bvm_auction_detail_first_col(PDO $pdo, string $table, array $candidates): ?string
{
    foreach ($candidates as $column) {
        if (bvm_auction_detail_has_col($pdo, $table, $column)) {
            return $column;
        }
    }

    return null;
}

function bvm_auction_detail_select_expr(PDO $pdo, string $table, string $column, string $alias, string $fallback = 'NULL'): string
{
    if (bvm_auction_detail_has_col($pdo, $table, $column)) {
        return bvm_auction_detail_ident($column) . ' AS ' . bvm_auction_detail_ident($alias);
    }

    return $fallback . ' AS ' . bvm_auction_detail_ident($alias);
}

function bvm_auction_detail_require_cols(PDO $pdo, string $table, array $columns): void
{
    foreach ($columns as $column) {
        if (!bvm_auction_detail_has_col($pdo, $table, $column)) {
            throw new BvmAuctionDetailException('server_error', 'Required database column is unavailable.', 500);
        }
    }
}

function bvm_auction_detail_bearer_token(): string
{
    $header = trim((string) ($_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? ''));
    if ($header === '' && function_exists('getallheaders')) {
        $headers = getallheaders();
        if (is_array($headers)) {
            foreach ($headers as $name => $value) {
                if (strcasecmp((string) $name, 'Authorization') === 0) {
                    $header = trim((string) $value);
                    break;
                }
            }
        }
    }

    if ($header === '') {
        throw new BvmAuctionDetailException('missing_token', 'Bearer token is required.', 401);
    }
    if (preg_match('/^Bearer\s+(.+)$/i', $header, $matches) !== 1) {
        throw new BvmAuctionDetailException('unauthorized', 'Unauthorized.', 401);
    }

    $token = trim((string) $matches[1]);
    if ($token === '') {
        throw new BvmAuctionDetailException('missing_token', 'Bearer token is required.', 401);
    }

    return $token;
}

function bvm_auction_detail_auth(PDO $pdo): array
{
    bvm_auction_detail_require_cols($pdo, 'mobile_auth_tokens', ['token_hash', 'user_id', 'expires_at']);
    bvm_auction_detail_require_cols($pdo, 'users', ['id']);

    $select = ['u.' . bvm_auction_detail_ident('id') . ' AS user_id'];
    foreach (['account_status', 'status', 'is_active'] as $column) {
        if (bvm_auction_detail_has_col($pdo, 'users', $column)) {
            $select[] = 'u.' . bvm_auction_detail_ident($column) . ' AS ' . bvm_auction_detail_ident($column);
        }
    }
    if (bvm_auction_detail_has_col($pdo, 'mobile_auth_tokens', 'id')) {
        $select[] = 'mat.' . bvm_auction_detail_ident('id') . ' AS token_id';
    }

    $where = [
        'mat.' . bvm_auction_detail_ident('token_hash') . ' = :token_hash',
        'mat.' . bvm_auction_detail_ident('expires_at') . ' > NOW()',
    ];
    if (bvm_auction_detail_has_col($pdo, 'mobile_auth_tokens', 'revoked_at')) {
        $where[] = 'mat.' . bvm_auction_detail_ident('revoked_at') . ' IS NULL';
    }

    $sql = 'SELECT ' . implode(', ', $select)
        . ' FROM ' . bvm_auction_detail_ident('mobile_auth_tokens') . ' mat'
        . ' INNER JOIN ' . bvm_auction_detail_ident('users') . ' u ON u.' . bvm_auction_detail_ident('id') . ' = mat.' . bvm_auction_detail_ident('user_id')
        . ' WHERE ' . implode(' AND ', $where)
        . ' ORDER BY mat.' . bvm_auction_detail_ident('expires_at') . ' DESC LIMIT 1';

    $stmt = $pdo->prepare($sql);
    $stmt->execute([':token_hash' => hash('sha256', bvm_auction_detail_bearer_token())]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$user) {
        throw new BvmAuctionDetailException('unauthorized', 'Unauthorized.', 401);
    }

    if (array_key_exists('account_status', $user) && strtolower((string) $user['account_status']) !== 'active') {
        throw new BvmAuctionDetailException('unauthorized', 'Unauthorized.', 401);
    }
    if (array_key_exists('status', $user) && (string) $user['status'] !== '' && strtolower((string) $user['status']) !== 'active') {
        throw new BvmAuctionDetailException('unauthorized', 'Unauthorized.', 401);
    }
    if (array_key_exists('is_active', $user) && $user['is_active'] !== null && (int) $user['is_active'] !== 1) {
        throw new BvmAuctionDetailException('unauthorized', 'Unauthorized.', 401);
    }

    if (bvm_auction_detail_has_col($pdo, 'mobile_auth_tokens', 'last_used_at')) {
        try {
            if (!empty($user['token_id']) && bvm_auction_detail_has_col($pdo, 'mobile_auth_tokens', 'id')) {
                $update = $pdo->prepare('UPDATE ' . bvm_auction_detail_ident('mobile_auth_tokens') . ' SET ' . bvm_auction_detail_ident('last_used_at') . ' = NOW() WHERE ' . bvm_auction_detail_ident('id') . ' = :token_id LIMIT 1');
                $update->execute([':token_id' => (int) $user['token_id']]);
            }
        } catch (Throwable $e) {
            bvm_auction_detail_log('Unable to update last_used_at: ' . $e->getMessage());
        }
    }

    return ['user_id' => (int) $user['user_id']];
}

function bvm_auction_detail_listing(PDO $pdo, int $listingId): array
{
    bvm_auction_detail_require_cols($pdo, 'listings', ['id']);

    $select = [
        bvm_auction_detail_ident('id'),
        bvm_auction_detail_select_expr($pdo, 'listings', 'title', 'title', "''"),
        bvm_auction_detail_select_expr($pdo, 'listings', 'seller_id', 'seller_id'),
        bvm_auction_detail_select_expr($pdo, 'listings', 'user_id', 'user_id'),
        bvm_auction_detail_select_expr($pdo, 'listings', 'currency', 'currency', "'USD'"),
        bvm_auction_detail_select_expr($pdo, 'listings', 'cover_image', 'cover_image'),
        bvm_auction_detail_select_expr($pdo, 'listings', 'image_url', 'image_url'),
        bvm_auction_detail_select_expr($pdo, 'listings', 'main_image', 'main_image'),
        bvm_auction_detail_select_expr($pdo, 'listings', 'sale_format', 'sale_format'),
        bvm_auction_detail_select_expr($pdo, 'listings', 'auction_enabled', 'auction_enabled', '0'),
        bvm_auction_detail_select_expr($pdo, 'listings', 'auction_start_price', 'auction_start_price'),
        bvm_auction_detail_select_expr($pdo, 'listings', 'auction_min_increment', 'auction_min_increment'),
        bvm_auction_detail_select_expr($pdo, 'listings', 'auction_starts_at', 'auction_starts_at'),
        bvm_auction_detail_select_expr($pdo, 'listings', 'auction_start_at', 'auction_start_at'),
        bvm_auction_detail_select_expr($pdo, 'listings', 'starts_at', 'starts_at'),
        bvm_auction_detail_select_expr($pdo, 'listings', 'auction_ends_at', 'auction_ends_at'),
        bvm_auction_detail_select_expr($pdo, 'listings', 'auction_end_at', 'auction_end_at'),
        bvm_auction_detail_select_expr($pdo, 'listings', 'ends_at', 'ends_at'),
        bvm_auction_detail_select_expr($pdo, 'listings', 'auction_status', 'auction_status'),
        bvm_auction_detail_select_expr($pdo, 'listings', 'status', 'listing_status'),
        bvm_auction_detail_select_expr($pdo, 'listings', 'sale_status', 'sale_status'),
        bvm_auction_detail_select_expr($pdo, 'listings', 'price', 'price'),
    ];

    $stmt = $pdo->prepare('SELECT ' . implode(', ', $select) . ' FROM ' . bvm_auction_detail_ident('listings') . ' WHERE ' . bvm_auction_detail_ident('id') . ' = :listing_id LIMIT 1');
    $stmt->execute([':listing_id' => $listingId]);
    $listing = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$listing) {
        throw new BvmAuctionDetailException('listing_not_found', 'Listing was not found.', 404);
    }

    return $listing;
}

function bvm_auction_detail_is_auction_enabled(PDO $pdo, array $listing): bool
{
    $hasSaleFormat = bvm_auction_detail_has_col($pdo, 'listings', 'sale_format');
    $hasAuctionEnabled = bvm_auction_detail_has_col($pdo, 'listings', 'auction_enabled');

    if ($hasSaleFormat && strtolower(trim((string) ($listing['sale_format'] ?? ''))) === 'auction') {
        return true;
    }
    if ($hasAuctionEnabled && (int) ($listing['auction_enabled'] ?? 0) === 1) {
        return true;
    }

    return !$hasSaleFormat && !$hasAuctionEnabled;
}

function bvm_auction_detail_money($value): ?float
{
    if ($value === null || $value === '') {
        return null;
    }

    return round((float) $value, 2);
}

function bvm_auction_detail_datetime(?string $value): ?DateTimeImmutable
{
    if ($value === null || trim($value) === '') {
        return null;
    }

    try {
        return new DateTimeImmutable($value, new DateTimeZone('UTC'));
    } catch (Throwable $e) {
        bvm_auction_detail_log('Invalid datetime value: ' . $value);
        return null;
    }
}

function bvm_auction_detail_datetime_out($value): ?string
{
    if (!is_string($value) || trim($value) === '') {
        return null;
    }

    $dt = bvm_auction_detail_datetime($value);
    return $dt instanceof DateTimeImmutable ? $dt->format('c') : null;
}

function bvm_auction_detail_bid_stats(PDO $pdo, int $listingId, int $viewerId): array
{
    bvm_auction_detail_require_cols($pdo, 'listing_auction_bids', ['id', 'listing_id', 'bidder_user_id', 'bid_amount']);

    $stmt = $pdo->prepare(
        'SELECT MAX(' . bvm_auction_detail_ident('bid_amount') . ') AS max_bid, COUNT(*) AS bid_count'
        . ' FROM ' . bvm_auction_detail_ident('listing_auction_bids')
        . ' WHERE ' . bvm_auction_detail_ident('listing_id') . ' = :listing_id'
    );
    $stmt->execute([':listing_id' => $listingId]);
    $aggregate = $stmt->fetch(PDO::FETCH_ASSOC) ?: [];

    $highestStmt = $pdo->prepare(
        'SELECT ' . bvm_auction_detail_ident('id') . ', ' . bvm_auction_detail_ident('bidder_user_id') . ', ' . bvm_auction_detail_ident('bid_amount')
        . ' FROM ' . bvm_auction_detail_ident('listing_auction_bids')
        . ' WHERE ' . bvm_auction_detail_ident('listing_id') . ' = :listing_id'
        . ' ORDER BY ' . bvm_auction_detail_ident('bid_amount') . ' DESC, ' . bvm_auction_detail_ident('id') . ' DESC LIMIT 1'
    );
    $highestStmt->execute([':listing_id' => $listingId]);
    $highest = $highestStmt->fetch(PDO::FETCH_ASSOC) ?: null;

    $myStmt = $pdo->prepare(
        'SELECT MAX(' . bvm_auction_detail_ident('bid_amount') . ') AS my_highest_bid'
        . ' FROM ' . bvm_auction_detail_ident('listing_auction_bids')
        . ' WHERE ' . bvm_auction_detail_ident('listing_id') . ' = :listing_id'
        . ' AND ' . bvm_auction_detail_ident('bidder_user_id') . ' = :viewer_id'
    );
    $myStmt->execute([':listing_id' => $listingId, ':viewer_id' => $viewerId]);
    $myBid = $myStmt->fetch(PDO::FETCH_ASSOC) ?: [];

    return [
        'max_bid' => bvm_auction_detail_money($aggregate['max_bid'] ?? null),
        'bid_count' => (int) ($aggregate['bid_count'] ?? 0),
        'highest_bidder_user_id' => $highest !== null ? (int) $highest['bidder_user_id'] : null,
        'highest_bid_id' => $highest !== null ? (int) $highest['id'] : null,
        'my_highest_bid' => bvm_auction_detail_money($myBid['my_highest_bid'] ?? null),
    ];
}

function bvm_auction_detail_bid_history(PDO $pdo, int $listingId): array
{
    bvm_auction_detail_require_cols($pdo, 'listing_auction_bids', ['id', 'listing_id', 'bidder_user_id', 'bid_amount']);
    $createdAtExpr = bvm_auction_detail_select_expr($pdo, 'listing_auction_bids', 'created_at', 'created_at');
    $currencyExpr = bvm_auction_detail_select_expr($pdo, 'listing_auction_bids', 'currency', 'currency', "'USD'");

    $stmt = $pdo->prepare(
        'SELECT ' . bvm_auction_detail_ident('id')
        . ', ' . bvm_auction_detail_ident('bidder_user_id')
        . ', ' . bvm_auction_detail_ident('bid_amount')
        . ', ' . $currencyExpr
        . ', ' . $createdAtExpr
        . ' FROM ' . bvm_auction_detail_ident('listing_auction_bids')
        . ' WHERE ' . bvm_auction_detail_ident('listing_id') . ' = :listing_id'
        . ' ORDER BY ' . bvm_auction_detail_ident('bid_amount') . ' DESC, ' . bvm_auction_detail_ident('id') . ' DESC LIMIT 20'
    );
    $stmt->execute([':listing_id' => $listingId]);

    $history = [];
    foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
        $history[] = [
            'id' => (int) $row['id'],
            'bidder_user_id' => (int) $row['bidder_user_id'],
            'bid_amount' => bvm_auction_detail_money($row['bid_amount']) ?? 0.00,
            'currency' => (string) ($row['currency'] ?? 'USD'),
            'created_at' => $row['created_at'] !== null ? (string) $row['created_at'] : null,
        ];
    }

    return $history;
}

function bvm_auction_detail_first_non_empty(array $row, array $keys): ?string
{
    foreach ($keys as $key) {
        if (isset($row[$key]) && trim((string) $row[$key]) !== '') {
            return (string) $row[$key];
        }
    }

    return null;
}

function bvm_auction_detail_status(array $listing, ?DateTimeImmutable $startsAt, ?DateTimeImmutable $endsAt): string
{
    $stored = strtolower(trim((string) ($listing['auction_status'] ?? '')));
    if (in_array($stored, ['ended', 'closed', 'cancelled', 'canceled'], true)) {
        return $stored === 'cancelled' || $stored === 'canceled' ? 'cancelled' : 'ended';
    }
    if (in_array($stored, ['active', 'live'], true)) {
        $stored = 'active';
    }

    $now = new DateTimeImmutable('now', new DateTimeZone('UTC'));
    if ($startsAt instanceof DateTimeImmutable && $startsAt > $now) {
        return 'scheduled';
    }
    if ($endsAt instanceof DateTimeImmutable && $endsAt <= $now) {
        return 'ended';
    }

    return $stored !== '' ? $stored : 'active';
}

try {
    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'GET') {
        throw new BvmAuctionDetailException('server_error', 'Only GET requests are accepted.', 405);
    }

    $listingIdRaw = $_GET['listing_id'] ?? null;
    if (!is_string($listingIdRaw) || preg_match('/^[1-9][0-9]*$/', $listingIdRaw) !== 1) {
        throw new BvmAuctionDetailException('invalid_listing_id', 'A valid listing_id is required.', 400);
    }
    $listingId = (int) $listingIdRaw;

    $pdo = bvm_auction_detail_db();
    $viewer = bvm_auction_detail_auth($pdo);
    $viewerId = (int) $viewer['user_id'];

    $listing = bvm_auction_detail_listing($pdo, $listingId);
    if (!bvm_auction_detail_is_auction_enabled($pdo, $listing)) {
        throw new BvmAuctionDetailException('auction_not_enabled', 'Auction is not enabled for this listing.', 400);
    }

    $stats = bvm_auction_detail_bid_stats($pdo, $listingId, $viewerId);
    $startPrice = bvm_auction_detail_money($listing['auction_start_price'] ?? null)
        ?? bvm_auction_detail_money($listing['price'] ?? null)
        ?? 0.00;
    $currentBid = $stats['max_bid'] ?? $startPrice;
    $minIncrement = bvm_auction_detail_money($listing['auction_min_increment'] ?? null) ?? 1.00;
    if ($minIncrement <= 0) {
        $minIncrement = 1.00;
    }

    $startsAtRaw = bvm_auction_detail_first_non_empty($listing, ['auction_starts_at', 'auction_start_at', 'starts_at']);
    $endsAtRaw = bvm_auction_detail_first_non_empty($listing, ['auction_ends_at', 'auction_end_at', 'ends_at']);
    $startsAt = bvm_auction_detail_datetime($startsAtRaw);
    $endsAt = bvm_auction_detail_datetime($endsAtRaw);
    $status = bvm_auction_detail_status($listing, $startsAt, $endsAt);
    $isEnded = $status === 'ended' || $status === 'closed' || $status === 'cancelled';

    $sellerId = null;
    if ($listing['seller_id'] !== null && $listing['seller_id'] !== '') {
        $sellerId = (int) $listing['seller_id'];
    } elseif ($listing['user_id'] !== null && $listing['user_id'] !== '') {
        $sellerId = (int) $listing['user_id'];
    }
    $isSeller = $sellerId !== null && $sellerId === $viewerId;

    $imageUrl = bvm_auction_detail_first_non_empty($listing, ['cover_image', 'image_url', 'main_image']);
    $currency = trim((string) ($listing['currency'] ?? ''));
    if ($currency === '') {
        $currency = 'USD';
    }

    bvm_auction_detail_json(200, [
        'ok' => true,
        'data' => [
            'listing' => [
                'id' => (int) $listing['id'],
                'title' => (string) ($listing['title'] ?? ''),
                'image_url' => $imageUrl,
                'seller_id' => $sellerId,
            ],
            'auction' => [
                'current_bid' => $currentBid,
                'next_min_bid' => bvm_auction_detail_money($currentBid + $minIncrement),
                'bid_count' => (int) $stats['bid_count'],
                'currency' => $currency,
                'starts_at' => bvm_auction_detail_datetime_out($startsAtRaw),
                'ends_at' => bvm_auction_detail_datetime_out($endsAtRaw),
                'status' => $status,
                'is_ended' => $isEnded,
            ],
            'viewer' => [
                'user_id' => $viewerId,
                'is_seller' => $isSeller,
                'is_highest_bidder' => $stats['highest_bidder_user_id'] !== null && (int) $stats['highest_bidder_user_id'] === $viewerId,
                'my_highest_bid' => $stats['my_highest_bid'],
                'can_bid' => !$isSeller && !$isEnded,
            ],
            'bid_history' => bvm_auction_detail_bid_history($pdo, $listingId),
        ],
    ]);
} catch (BvmAuctionDetailException $e) {
    bvm_auction_detail_error($e->getMessage(), $e->publicMessage(), $e->httpStatus());
} catch (Throwable $e) {
    bvm_auction_detail_log('Unhandled exception: ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine());
    bvm_auction_detail_error('server_error', 'Something went wrong.', 500);
}
